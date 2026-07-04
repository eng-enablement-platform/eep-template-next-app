import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';
import { z } from 'zod';

import { LOG_SOURCE, rootLogger } from '@/classes/loggers/application';

const logger = rootLogger(LOG_SOURCE.API);

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
