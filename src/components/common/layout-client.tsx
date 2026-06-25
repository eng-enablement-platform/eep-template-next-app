'use client';

import { RedirectToSignIn, useUser } from '@clerk/nextjs';
import type { ReactNode } from 'react';

import { ErrorBoundary } from '@/components/common/error-boundary';
import { Spinner } from '@/components/common/loading';
import { Providers } from '@/components/providers';

type RootLayoutClientProps = {
  children: ReactNode;
};

/*
 * Client shell that owns auth gating for authenticated routes.
 *
 * Auth routes (/sign-in, /sign-up) never reach this component — they live in
 * the (auth) route group which has its own bare layout. So this component can
 * assume every visitor should be signed in and gate unconditionally.
 *
 *   - While Clerk resolves the session, show a spinner.
 *   - Signed-out users are handed to Clerk's <RedirectToSignIn> (which appends
 *     a redirect_url so they return here after signing in). We avoid
 *     next/navigation's redirect() because, in a client component, it throws
 *     the NEXT_REDIRECT control-flow exception during render.
 *   - Signed-in users get the app wrapped in an error boundary.
 *   - <Providers> mounts all client-side providers.
 *     New providers get added to components/providers/index.tsx.
 */
export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <Spinner isLoading />;
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return (
    <Providers>
      <ErrorBoundary>{children}</ErrorBoundary>
    </Providers>
  );
}
