import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import type { ZodError } from 'zod';
import { z } from 'zod';

import { LOG_SOURCE, rootLogger } from '@/classes/loggers/application';
import type { UserRole } from '@/types/clerk';

const logger = rootLogger(LOG_SOURCE.API);

/**
 * Role hierarchy, highest privilege last. `SuperAdmin` is a strict superset of
 * `Admin`: a SuperAdmin satisfies any `Admin` requirement, but not vice versa.
 *
 * A user's rank is its index here; a role is satisfied when the caller's rank
 * is greater than or equal to the required role's rank.
 */
const ROLE_HIERARCHY: readonly UserRole[] = ['Admin', 'SuperAdmin'];

/**
 * Whether a caller's role satisfies a required role.
 *
 * @param callerRole - The role from the caller's session claim, if any.
 * @param requiredRole - The minimum role the resource demands.
 * @returns `true` when the caller meets or exceeds the required role.
 *
 * @example
 * ```ts
 * hasRole('SuperAdmin', 'Admin'); // true - superset
 * hasRole('Admin', 'SuperAdmin'); // false
 * ```
 */
export function hasRole(
  callerRole: UserRole | undefined,
  requiredRole: UserRole,
): boolean {
  if (callerRole === undefined) return false;
  return (
    ROLE_HIERARCHY.indexOf(callerRole) >= ROLE_HIERARCHY.indexOf(requiredRole)
  );
}

/**
 * Context passed to a wrapped handler once authentication has succeeded. Carries
 * the authenticated `userId` and the caller's role so the handler need not
 * re-read the session.
 */
export type AuthContext = { userId: string; role: UserRole | undefined };

/**
 * A route handler that has been guaranteed an authenticated caller. Receives the
 * original request, the route context (dynamic params etc.), and an
 * {@link AuthContext}.
 */
type AuthedHandler<TRouteContext> = (
  request: NextRequest,
  context: TRouteContext,
  auth: AuthContext,
) => Promise<NextResponse> | NextResponse;

/**
 * Wrap a route handler so it independently enforces authentication before
 * running - defence-in-depth so a proxy/middleware change can never silently
 * expose the handler. Returns 401 when the caller is signed out.
 *
 * The wrapped handler receives an {@link AuthContext} as its third argument.
 *
 * @param handler - The handler to protect; runs only for authenticated callers.
 * @returns A handler that returns 401 for signed-out callers, else delegates.
 *
 * @example
 * ```ts
 * export const GET = withAuth(async (_request, _context, { userId }) => {
 *   // userId is guaranteed here
 *   return NextResponse.json({ userId });
 * });
 * ```
 */
export function withAuth<TRouteContext>(
  handler: AuthedHandler<TRouteContext>,
): (request: NextRequest, context: TRouteContext) => Promise<NextResponse> {
  return async (request, context) => {
    const session = await auth();

    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return handler(request, context, {
      userId: session.userId,
      role: session.sessionClaims?.metadata?.role,
    });
  };
}

/**
 * Wrap a route handler so it enforces both authentication and a minimum role.
 * Returns 401 when signed out, 403 when the caller lacks the required role
 * (honouring the hierarchy, so `SuperAdmin` satisfies `withRole('Admin')`).
 *
 * This is the authorization layer for the template's write surface: mutating
 * example-item handlers are wrapped with `withRole('SuperAdmin')`.
 *
 * @param requiredRole - The minimum role the caller must hold.
 * @param handler - The handler to protect; runs only for permitted callers.
 * @returns A handler returning 401/403 as appropriate, else delegating.
 *
 * @example
 * ```ts
 * export const POST = withRole('SuperAdmin', async (request) => {
 *   // caller is an authenticated SuperAdmin
 *   return NextResponse.json({ ok: true }, { status: 201 });
 * });
 * ```
 */
export function withRole<TRouteContext>(
  requiredRole: UserRole,
  handler: AuthedHandler<TRouteContext>,
): (request: NextRequest, context: TRouteContext) => Promise<NextResponse> {
  return withAuth<TRouteContext>((request, context, authContext) => {
    if (!hasRole(authContext.role, requiredRole)) {
      return NextResponse.json(
        { error: `Requires the ${requiredRole} role` },
        { status: 403 },
      );
    }

    return handler(request, context, authContext);
  });
}

/**
 * Return a consistent 400 response for a failed Zod validation.
 *
 * Flattens the Zod issues into a `fieldErrors` map so the caller can see
 * exactly which fields were rejected and why. Call it from a route after a
 * `safeParse` fails.
 *
 * @param error - The `ZodError` produced by a failed `safeParse`.
 * @returns A 400 `NextResponse` with `{ error, fieldErrors }`.
 */
export function validationErrorResponse(error: ZodError): NextResponse {
  return NextResponse.json(
    {
      error: 'Validation failed',
      fieldErrors: z.flattenError(error).fieldErrors,
    },
    { status: 400 },
  );
}

/**
 * Parse a dynamic route `id` segment into a positive integer.
 *
 * Route params arrive as strings, so this guards against non-numeric input
 * before it reaches the service layer.
 *
 * @param raw - The raw `id` string from the route params.
 * @returns The parsed integer, or `null` if it is not a valid positive id.
 */
export function parseId(raw: string): number | null {
  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

/**
 * Standard error handler for API route handlers.
 *
 * Logs the failure against the application logger and returns a consistent
 * JSON error envelope so every route surfaces failures the same way. Call it
 * from a route's `catch` block.
 *
 * @param error - The thrown value caught in the route handler.
 * @param context - A short label for where the error occurred, e.g.
 *   `'GET /api/get-static'`. Included in the log for traceability.
 * @returns A 500 `NextResponse` with `{ error, details }`.
 *
 * @example
 * ```ts
 * try {
 *   // ...
 * } catch (error) {
 *   return routeErrorHandler(error, 'GET /api/get-static');
 * }
 * ```
 */
export function routeErrorHandler(
  error: unknown,
  context: string,
): NextResponse {
  const message = error instanceof Error ? error.message : 'Unknown error';

  logger.error({ message: 'Request failed', context, detail: message });

  return NextResponse.json(
    { error: 'Failed to process request', details: message },
    { status: 500 },
  );
}
