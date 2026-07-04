import 'server-only';

import { ApplicationError } from '@/classes/errors';
import { JSONPLACEHOLDER_POSTS_URL } from '@/config/constants/external-urls';
import type { Post } from '@/types/post';

/**
 * EXAMPLE SERVICE CLASS
 *
 * Reference integration class demonstrating the server-side third-party fetch
 * pattern
 *
 * This wiring is deliberately illustrative. JSONPlaceholder is a public,
 * no-auth GET, so in real life it would NOT warrant a service class - a client
 * hook straight through SWR would be enough (see the docs).
 */
class PostsService {
  /**
   * Fetch the demo list of posts from JSONPlaceholder.
   *
   * `fetch` does not throw on HTTP errors - a 4xx/5xx still resolves with
   * `ok: false` - so this inspects the result and deliberately throws a typed
   * `ApplicationError` on a non-ok response rather than letting a bad payload
   * pass downstream.
   *
   * @returns The parsed list of posts.
   * @throws ApplicationError when the upstream response is not ok.
   */
  async getAll(): Promise<Post[]> {
    const response = await fetch(JSONPLACEHOLDER_POSTS_URL);

    if (!response.ok) {
      throw new ApplicationError('Failed to fetch posts', {
        scope: 'posts',
        function: 'PostsService.getAll',
        originalError: `${response.status} ${response.statusText}`,
      });
    }

    return (await response.json()) as Post[];
  }
}

// Singleton service instance. Import this to read posts from the server.
export const postsService = new PostsService();

// test-only exports
export const _forTests = { PostsService };
