import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { JSONPLACEHOLDER_POSTS_KEY } from '@/config/constants/external-urls';
import { usePosts } from '@/hooks/use-posts';
import type { Post } from '@/types/post';

/*
 * SWR is mocked at the module level so tests can drive the three states
 * (loading, error, data) without a network call or a real SWR cache.
 * We test BEHAVIOUR: does the hook surface the right shape in each state?
 */

const mockUseSWR = vi.fn();

vi.mock('swr', () => ({
  default: (...args: unknown[]) => mockUseSWR(...args),
}));

const MOCK_POSTS: Post[] = [
  { id: 1, userId: 1, title: 'First post', body: 'Body of first post.' },
  { id: 2, userId: 1, title: 'Second post', body: 'Body of second post.' },
];

describe('usePosts', () => {
  it('passes the correct SWR key', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    });

    renderHook(() => usePosts());

    expect(mockUseSWR).toHaveBeenCalledWith(JSONPLACEHOLDER_POSTS_KEY);
  });

  it('returns isLoading true and no data while fetching', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    });

    const { result } = renderHook(() => usePosts());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.posts).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('returns posts once data resolves', () => {
    mockUseSWR.mockReturnValue({
      data: MOCK_POSTS,
      isLoading: false,
      error: undefined,
    });

    const { result } = renderHook(() => usePosts());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.posts).toEqual(MOCK_POSTS);
    expect(result.current.error).toBeUndefined();
  });

  it('surfaces an Error when the fetch fails', () => {
    const fetchError = new Error('Request failed: 500 Internal Server Error');
    mockUseSWR.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: fetchError,
    });

    const { result } = renderHook(() => usePosts());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.posts).toBeUndefined();
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
    });

    const { result } = renderHook(() => usePosts());

    expect(result.current.error).toBeUndefined();
  });
});
