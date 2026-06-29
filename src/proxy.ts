import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Clerk proxy
 *
 * Gate strategy for the live deployment:
 * - `/sign-in`, `/sign-up`, `/restricted` - public, anyone can reach them.
 * - Everything else - Admin role required.
 *
 * This is intentionally restrictive for the template's live demo deployment.
 * Relax the `isProtectedRoute` matcher or remove the `isAdmin` check when
 * scaffolding a real product that should allow broader access.
 *
 * Admin status is read from the `role` session claim (see
 * `src/types/clerk.d.ts`).
 *
 * @see https://nextjs.org/docs/app/getting-started/proxy
 * @see https://clerk.com/docs/nextjs/middleware
 */

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/restricted',
]);

export default clerkMiddleware(async (auth, req) => {
  // Always allow auth routes through - sign-in/up must be reachable.
  if (isPublicRoute(req)) return;

  const session = await auth();
  const isAdmin = session.sessionClaims?.metadata?.role === 'Admin';

  /*
   * Everything else requires Admin role.
   * - Signed-out users go to /sign-in (Clerk handles the auth flow).
   * - Signed-in non-admins go to /restricted (friendly explanation page).
   */
  if (!session.userId) {
    const signInUrl = new URL('/sign-in', req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (!isAdmin) {
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
