import useSWR from 'swr';

import { API_ROUTES } from '@/config/constants/api-routes';
import type { Post } from '@/types/post';

/*
 * EXAMPLE HOOK
 *
 * Demonstrates the SWR hook pattern used across this template.
 * It exists for learning - not intended for production use.
 *
 */

type PostsResponse = { posts: Post[] };

type UsePostsReturn = {
  posts: Post[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
};

/**
 * Fetches a short list of posts from `GET /api/posts`.
 *
 * The route is backed by a server-side integration service rather than calling
 * JSONPlaceholder directly from the browser - see the client docs for why this
 * particular flow is illustrative.
 *
 * @returns `posts` (undefined while loading), `isLoading` flag, and an `error`
 *          if the fetch failed.
 * @example
 * ```tsx
 * const { posts, isLoading, error } = usePosts();
 * ```
 */
export function usePosts(): UsePostsReturn {
  const { data, isLoading, error } = useSWR<PostsResponse>(API_ROUTES.posts);

  return {
    posts: data?.posts,
    isLoading,
    // SWR types error as `any` - narrow to Error so callers get a stable shape.
    error: error instanceof Error ? error : undefined,
  };
}
