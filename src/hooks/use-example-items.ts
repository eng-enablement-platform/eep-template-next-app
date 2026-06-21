import type { KeyedMutator } from 'swr';
import useSWR from 'swr';

import type { ExampleItem } from '@/db/types';

type ExampleItemsResponse = { exampleItems: ExampleItem[] };

type UseExampleItemsReturn = {
  items: ExampleItem[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  /**
   * SWR mutator for the example items cache. Use this to apply optimistic
   * updates before the server confirms a mutation — pass `{ optimisticData }`
   * with `rollbackOnError: true` so SWR reverts automatically on failure.
   */
  mutate: KeyedMutator<ExampleItemsResponse>;
};

/**
 * EXAMPLE HOOK
 *
 * Fetches all example items from `GET /api/example-items`. Demonstrates the
 * SWR hook pattern used across this template: one hook per data domain,
 * loading and error state handled here so components stay clean.
 *
 * Exposes `mutate` so callers can apply optimistic updates before the server
 * confirms a mutation — pass `{ optimisticData, rollbackOnError: true }`.
 *
 * @returns `items` (undefined while loading), `isLoading`, `error`, and `mutate`.
 * @example
 * ```ts
 * const { items, isLoading, error, mutate } = useExampleItems();
 * ```
 */
export function useExampleItems(): UseExampleItemsReturn {
  const { data, isLoading, error, mutate } =
    useSWR<ExampleItemsResponse>('/api/example-items');

  return {
    items: data?.exampleItems,
    isLoading,
    // SWR types error as `any` — narrow to Error so callers get a stable shape.
    error: error instanceof Error ? error : undefined,
    mutate,
  };
}
