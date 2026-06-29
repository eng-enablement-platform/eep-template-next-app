import { renderHook } from '@testing-library/react';
import type { KeyedMutator } from 'swr';
import { describe, expect, it, vi } from 'vitest';

import { API_ROUTES } from '@/config/constants/api-routes';
import type { ExampleItem } from '@/db/types';
import { useExampleItems } from '@/hooks/use-example-items';

/*
 * SWR is mocked at the module level so tests can drive the three states
 * (loading, error, data) without a network call or a real SWR cache.
 * We test BEHAVIOUR: does the hook surface the right shape in each state?
 */

const mockUseSWR = vi.fn();

vi.mock('swr', () => ({
  default: (...args: unknown[]) => mockUseSWR(...args),
}));

/*
 * Minimal ExampleItem fixtures — only the fields the hook tests actually
 * care about. Keeping fixtures small prevents test brittleness when new
 * DB columns are added.
 */
const MOCK_ITEMS: ExampleItem[] = [
  {
    id: 1,
    name: 'First item',
    description: null,
    quantity: 0,
    status: 'draft',
    expiresAt: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 2,
    name: 'Second item',
    description: 'A description',
    quantity: 5,
    status: 'active',
    expiresAt: '2025-12-31',
    createdAt: new Date('2024-01-02T00:00:00Z'),
  },
];

const MOCK_MUTATE = vi.fn() as unknown as KeyedMutator<{
  exampleItems: ExampleItem[];
}>;

describe('useExampleItems', () => {
  it('passes the correct SWR key', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
      mutate: MOCK_MUTATE,
    });

    renderHook(() => useExampleItems());

    expect(mockUseSWR).toHaveBeenCalledWith(API_ROUTES.exampleItems);
  });

  it('returns isLoading true and no items while fetching', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
      mutate: MOCK_MUTATE,
    });

    const { result } = renderHook(() => useExampleItems());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('unwraps items from the response envelope once data resolves', () => {
    /*
     * The API returns { exampleItems: [...] } — the hook unwraps this so
     * components receive a flat array, not the envelope object.
     */
    mockUseSWR.mockReturnValue({
      data: { exampleItems: MOCK_ITEMS },
      isLoading: false,
      error: undefined,
      mutate: MOCK_MUTATE,
    });

    const { result } = renderHook(() => useExampleItems());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(MOCK_ITEMS);
    expect(result.current.error).toBeUndefined();
  });

  it('surfaces an Error when the fetch fails', () => {
    const fetchError = new Error('Request failed: 500 Internal Server Error');
    mockUseSWR.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: fetchError,
      mutate: MOCK_MUTATE,
    });

    const { result } = renderHook(() => useExampleItems());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toBeUndefined();
    expect(result.current.error).toBe(fetchError);
  });

  it('coerces non-Error rejections to undefined', () => {
    /*
     * SWR types error as `any` — the hook narrows it; a raw string should not
     * escape as the error value.
     */
    mockUseSWR.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: 'string error',
      mutate: MOCK_MUTATE,
    });

    const { result } = renderHook(() => useExampleItems());

    expect(result.current.error).toBeUndefined();
  });

  it('exposes the SWR mutate function for optimistic updates', () => {
    mockUseSWR.mockReturnValue({
      data: { exampleItems: MOCK_ITEMS },
      isLoading: false,
      error: undefined,
      mutate: MOCK_MUTATE,
    });

    const { result } = renderHook(() => useExampleItems());

    expect(result.current.mutate).toBe(MOCK_MUTATE);
  });
});
