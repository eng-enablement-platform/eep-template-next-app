'use client';

import type { ReactNode } from 'react';

import { SwrProvider } from './swr';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Composes every client-side provider into a single wrapper.
 *
 * This is the one seam that absorbs provider growth: the root layout imports
 * `<Providers>` exactly once and never needs editing again, while each new
 * provider (theme, toast, auth/session) slots in here by nesting around
 * `children`. Each provider keeps its own file (e.g. `swr.tsx`) — this index
 * only nests them, it does not contain their logic.
 *
 * Nesting order is outermost-first: a provider that others depend on goes on
 * the outside.
 *
 * @param children - The application tree to wrap.
 * @returns The children wrapped in all client providers.
 */
export function Providers({ children }: ProvidersProps) {
  return <SwrProvider>{children}</SwrProvider>;
}
