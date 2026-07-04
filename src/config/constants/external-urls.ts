/**
 * External third-party URL constants.
 *
 * Any URL pointing to a service outside this application is defined here.
 *
 * @example
 * ```ts
 * import { JSONPLACEHOLDER_POSTS_URL } from '@/config/constants/external-urls';
 *
 * const response = await fetch(JSONPLACEHOLDER_POSTS_URL);
 * ```
 */

/** Base URL for the JSONPlaceholder demo API. */
export const JSONPLACEHOLDER_BASE_URL =
  'https://jsonplaceholder.typicode.com' as const;

/**
 * Fetch URL for the posts demo list, called server-side by `PostsService`.
 * The `_limit=3` cap keeps the demo lightweight - adjust here if you need more.
 */
export const JSONPLACEHOLDER_POSTS_URL =
  `${JSONPLACEHOLDER_BASE_URL}/posts?_limit=3` as const;
