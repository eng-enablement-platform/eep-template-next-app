import useSWR from 'swr';

import type { Post } from '@/types/post';

/*
 * EXAMPLE HOOK
 *
 * Demonstrates the SWR hook pattern used across this template.
 * It exists for learning — it is not intended for production use.
 *
 * Pattern:
 *  1. The hook owns its key and return type — callers never touch SWR directly.
 *  2. The fetcher is omitted because `SwrProvider` registers it globally.
 *  3. Loading and error states are surfaced explicitly so the component can
 *     branch on them without importing SWR itself.
 */

/** Base URL for the JSONPlaceholder API used in this reference example. */
const JSONPLACEHOLDER_BASE_URL = 'https://jsonplaceholder.typicode.com';

/** Number of posts fetched by the reference hook. */
const POSTS_LIMIT = 5;

/** SWR key for the posts list — a stable string used to cache and dedupe. */
const POSTS_KEY = `${JSONPLACEHOLDER_BASE_URL}/posts?_limit=${POSTS_LIMIT}`;

type UsePostsReturn = {
  posts: Post[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
};

/**
 * Fetches a short list of posts from the JSONPlaceholder API.
 *
 * @returns `posts` (undefined while loading), `isLoading` flag, and an `error`
 *          if the fetch failed.
 * @example
 * ```tsx
 * const { posts, isLoading, error } = usePosts();
 * ```
 */
export function usePosts(): UsePostsReturn {
  const { data, isLoading, error } = useSWR<Post[]>(POSTS_KEY);

  return {
    posts: data,
    isLoading,
    // SWR types error as `any` — narrow to Error so callers get a stable shape.
    error: error instanceof Error ? error : undefined,
  };
}

export const _forTests = { POSTS_KEY };
