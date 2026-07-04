import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApplicationError } from '@/classes/errors';
import type { Post } from '@/types/post';

import { _forTests } from '../index';

/*
 * `server-only` throws if imported into a client bundle; under vitest (a node
 * environment) it is a harmless no-op, so the service imports cleanly here.
 *
 * We test BEHAVIOUR: does the service return the parsed payload on success, and
 * does it throw a typed ApplicationError (not a bare fetch result) on a non-ok
 * response? `fetch` is stubbed so no network call is made.
 */

const { PostsService } = _forTests;

const MOCK_POSTS: Post[] = [
  { id: 1, userId: 1, title: 'First post', body: 'Body of first post.' },
  { id: 2, userId: 1, title: 'Second post', body: 'Body of second post.' },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PostsService', () => {
  it('returns the parsed posts on a successful response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_POSTS,
      }),
    );

    const posts = await new PostsService().getAll();

    expect(posts).toEqual(MOCK_POSTS);
  });

  it('throws an ApplicationError when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      }),
    );

    await expect(new PostsService().getAll()).rejects.toBeInstanceOf(
      ApplicationError,
    );
  });

  it('tags the thrown error with the posts scope and originating function', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({}),
      }),
    );

    await expect(new PostsService().getAll()).rejects.toMatchObject({
      context: {
        scope: 'posts',
        function: 'PostsService.getAll',
        originalError: '404 Not Found',
      },
    });
  });
});
