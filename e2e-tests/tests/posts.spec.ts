import { expect, test } from '../fixtures/auth.fixture';

/*
 * EXAMPLE E2E TEST
 *
 * Exercises the server-side integration path end to end: the home page's
 * <Posts /> component calls usePosts -> SWR -> GET /api/posts -> PostsService
 * -> JSONPlaceholder, and the fetched titles render in the list.
 *
 * The posts list lives inside a collapsible accordion on the home page - the
 * beforeEach opens it before each test.
 *
 * Uses the `authenticatedPage` fixture - the home page is behind Clerk auth.
 */

test.describe('posts', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/');
    await authenticatedPage.waitForURL('/', { timeout: 15_000 });

    /* The posts list is inside the "Recent Posts" accordion - open it first. */
    await authenticatedPage
      .getByRole('button', { name: /Recent Posts/ })
      .click();
  });

  test('renders fetched posts from the /api/posts route', async ({
    authenticatedPage,
  }) => {
    /*
     * JSONPlaceholder returns deterministic seed data; the first post's title
     * is stable, so asserting a real item proves the whole chain resolved
     * rather than just that a container rendered.
     */
    await expect(
      authenticatedPage.getByText('sunt aut facere', { exact: false }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
