import useSWR from 'swr';

import type { Post } from '@/types/post';

/*
 * EXAMPLE HOOK
 *
 * Demonstrates the SWR hook pattern used across this template.
 * It exists for learning — not intended for production use.
 *
 */

const JSONPLACEHOLDER_BASE_URL = 'https://jsonplaceholder.typicode.com';
const POSTS_LIMIT = 3;
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

// test-only exports
export const _forTests = { POSTS_KEY };
