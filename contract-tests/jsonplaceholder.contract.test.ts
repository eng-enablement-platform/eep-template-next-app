import { describe, expect, it } from 'vitest';
import { z } from 'zod';

/**
 * EXAMPLE CONTRACT TEST
 *
 * Verifies that the JSONPlaceholder API still returns the shape our code
 * depends on. This is a live network call — it runs outside the standard
 * test suite (`pnpm test`) to avoid blocking fast feedback loops.
 *
 * Run manually: `pnpm test:contract`
 *
 * When to add a contract test: any time you depend on a third-party API
 * response shape that you don't control. The test fails if the provider
 * changes a field name, type, or removes a required property — giving you
 * early warning before the breakage reaches production.
 *
 * @see https://jsonplaceholder.typicode.com
 */

const JSONPLACEHOLDER_BASE_URL = 'https://jsonplaceholder.typicode.com';

/*
 * Mirrors src/types/post.ts — the contract test owns its own schema so it
 * catches drift between the live API and our local type definition.
 */
const PostSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  body: z.string(),
});

const PostArraySchema = z.array(PostSchema);

describe('JSONPlaceholder API contract', () => {
  it('GET /posts returns an array matching the Post schema', async () => {
    const response = await fetch(`${JSONPLACEHOLDER_BASE_URL}/posts?_limit=3`);

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const data: unknown = await response.json();
    const result = PostArraySchema.safeParse(data);

    expect(
      result.success,
      `The JSONPlaceholder API response no longer matches our Post schema — ` +
        `the provider may have changed their contract. ` +
        `Check https://jsonplaceholder.typicode.com/posts and update src/types/post.ts if needed.\n` +
        `${result.success ? '' : result.error.message}`,
    ).toBe(true);
  });

  it('GET /posts/:id returns a single Post matching the schema', async () => {
    const response = await fetch(`${JSONPLACEHOLDER_BASE_URL}/posts/1`);

    expect(response.ok).toBe(true);

    const data: unknown = await response.json();
    const result = PostSchema.safeParse(data);

    expect(
      result.success,
      `The JSONPlaceholder API response no longer matches our Post schema — ` +
        `the provider may have changed their contract. ` +
        `Check https://jsonplaceholder.typicode.com/posts and update src/types/post.ts if needed.\n` +
        `${result.success ? '' : result.error.message}`,
    ).toBe(true);
  });
});
