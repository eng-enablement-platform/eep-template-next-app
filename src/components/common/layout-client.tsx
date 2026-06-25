'use client';

import { RedirectToSignIn, useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { ErrorBoundary } from '@/components/common/error-boundary';
import { Spinner } from '@/components/common/loading';
import { Navbar } from '@/components/common/navbar';
import { Providers } from '@/components/providers';

type RootLayoutClientProps = {
  children: ReactNode;
};

/*
 * Client shell that owns route-aware auth gating for the whole app:
 *
 *   - Auth routes (/sign-in, /sign-up) render bare so Clerk's own flows are
 *     never gated behind a session.
 *   - While Clerk resolves the session, show a spinner.
 *   - Signed-out users are handed to Clerk's <RedirectToSignIn> (which appends
 *     a redirect_url so they return here after signing in). We avoid
 *     next/navigation's redirect() because, in a client component, it throws
 *     the NEXT_REDIRECT control-flow exception during render.
 *   - Signed-in users get the app, wrapped in an error boundary.
 *   - <Providers> mounts all client-side providers.
 *     New providers get added to components/providers/index.tsx.
 */

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useUser();

  const isAuthRoute =
    pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');

  if (isAuthRoute) {
    return children;
  }

  if (!isLoaded) {
    return <Spinner isLoading />;
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return (
    <Providers>
      <Navbar />
      <ErrorBoundary>{children}</ErrorBoundary>
    </Providers>
  );
}
