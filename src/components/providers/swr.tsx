'use client';

import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { fetcher } from '@/lib/swr';

type SwrProviderProps = {
  children: ReactNode;
};

/**
 * Global SWR provider.
 *
 * Sets the default `fetcher` for all `useSWR` calls in the app so individual
 * hooks can drop the second argument:
 *
 * ```ts
 * // Before
 * const { data } = useSWR<Foo>('/api/foo', fetcher);
 *
 * // After
 * const { data } = useSWR<Foo>('/api/foo');
 * ```
 *
 * Per-hook revalidation behaviour (e.g. `revalidateOnFocus: false`) stays at
 * the call site where the lifecycle of that specific data is best understood.
 *
 * Mounted in the root layout so every authenticated route has access to it.
 */
export function SwrProvider({ children }: SwrProviderProps) {
  return <SWRConfig value={{ fetcher }}>{children}</SWRConfig>;
}
