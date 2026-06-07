'use client';

import type { ReactNode } from 'react';

import { SwrProvider } from './swr';

type ProvidersProps = {
  children: ReactNode;
};

/**
 * Composes every client-side provider into a single wrapper.
 *
 * Nesting order is outermost-first: a provider that others
 * depend on goes on the outside.
 *
 * @param children - The application tree to wrap.
 * @returns The children wrapped in all client providers.
 */
export function Providers({ children }: ProvidersProps) {
  return <SwrProvider>{children}</SwrProvider>;
}
