import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Clerk proxy (formerly `middleware.ts`).
 *
 * Next.js 16 renamed the root `middleware.ts` convention to `proxy.ts` to make
 * the network boundary explicit and move it onto the Node.js runtime. The file
 * must live at the project root and export the handler as the default export
 * (or a named `proxy` export). Logic is unchanged from the old middleware.
 *
 * Runs ahead of routing to gate protected areas:
 * - `/admin/*` — redirected home for non-admins.
 * - `/api-docs/*` — 403 for non-admins.
 *
 * Admin status is read from the `role` session claim (see
 * `src/types/clerk.d.ts`). Keep this layer to lightweight network checks
 * (redirects, rewrites, claim reads). Per the Next.js 16 guidance, heavier auth
 * (DB lookups, full session validation) belongs in the Data Access Layer or
 * Route Handlers, not here — the proxy is not a security boundary on its own.
 *
 * @see https://nextjs.org/docs/app/getting-started/proxy
 * @see https://clerk.com/docs/nextjs/middleware
 */

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api-docs(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const session = await auth();
  const isAdmin = session.sessionClaims?.metadata?.role === 'Admin';

  // Protect admin and API docs routes
  if (isAdminRoute(req) && !isAdmin) {
    // For api-docs, return 403 Forbidden
    if (req.url.includes('/api-docs')) {
      return NextResponse.json(
        { error: 'Not authorized to access this resource' },
        { status: 403 },
      );
    }
    // For admin routes, redirect to home
    const url = new URL('/', req.url);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals, Clerk assets, and all static files
    '/((?!_next|clerk|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/api-docs(.*)',
  ],
};
