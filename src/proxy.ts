import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Clerk proxy
 *
 * Gate strategy for the live deployment:
 * - `/sign-in`, `/sign-up`, `/restricted` - public, anyone can reach them.
 * - Everything else - `Admin` or higher required (page access).
 *
 * The template ships a two-role model (see `src/types/clerk.d.ts`): `Admin`
 * gets into the app and can read; `SuperAdmin` is a strict superset that can
 * also write. This gate only decides *page access*, so both roles pass. The
 * write distinction is enforced separately at the API/action layer via
 * `withRole('SuperAdmin')` in `@/app/api/utils`.
 *
 * The proxy is a coarse routing gate, not a security boundary on its own -
 * every API route and server action independently re-checks auth
 * (defence-in-depth), so a change here can never silently expose the DB. The
 * role check is inlined here (rather than importing `hasRole`) to keep the
 * proxy free of the API utils' server-only logger dependency.
 *
 * This is intentionally restrictive for the template's live demo deployment.
 * Relax the matcher or the role check when scaffolding a real product that
 * should allow broader access.
 *
 * @see https://nextjs.org/docs/app/getting-started/proxy
 * @see https://clerk.com/docs/nextjs/middleware
 */

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/restricted',
]);

// Roles that grant app (page) access. SuperAdmin is a superset of Admin.
const APP_ACCESS_ROLES = ['Admin', 'SuperAdmin'];

export default clerkMiddleware(async (auth, req) => {
  // Always allow auth routes through - sign-in/up must be reachable.
  if (isPublicRoute(req)) return;

  const session = await auth();
  const role = session.sessionClaims?.metadata?.role;
  const canAccessApp = role !== undefined && APP_ACCESS_ROLES.includes(role);

  /*
   * Everything else requires at least the Admin role.
   * - Signed-out users go to /sign-in (Clerk handles the auth flow).
   * - Signed-in users without a qualifying role go to /restricted.
   */
  if (!session.userId) {
    const signInUrl = new URL('/sign-in', req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (!canAccessApp) {
    const restrictedUrl = new URL('/restricted', req.url);
    return NextResponse.redirect(restrictedUrl);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals, Clerk assets, and all static files
    '/((?!_next|clerk|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/api-docs(.*)',
  ],
};
