/**
 * External third-party URL constants.
 *
 * Any URL pointing to a service outside this application is defined here.
 *
 * @example
 * ```ts
 * import { JSONPLACEHOLDER_POSTS_KEY } from '@/config/constants/external-urls';
 *
 * useSWR(JSONPLACEHOLDER_POSTS_KEY);
 * ```
 */

/** Base URL for the JSONPlaceholder demo API. */
export const JSONPLACEHOLDER_BASE_URL =
  'https://jsonplaceholder.typicode.com' as const;

/**
 * SWR cache key and fetch URL for the posts demo list.
 * The `_limit=3` cap keeps the demo lightweight - adjust here if you need more.
 */
export const JSONPLACEHOLDER_POSTS_KEY =
  `${JSONPLACEHOLDER_BASE_URL}/posts?_limit=3` as const;
