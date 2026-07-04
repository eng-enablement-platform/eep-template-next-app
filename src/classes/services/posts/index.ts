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
 * This wiring is illustrative. JSONPlaceholder is a public,
 * no-auth GET, so in real life it would NOT warrant a service class - a client
 * hook straight through SWR would be enough.
 */
class PostsService {
  /**
   * Fetch the demo list of posts from JSONPlaceholder.
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
