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
 * Uses the `superAdminPage` fixture - the home page is behind Clerk auth, and a
 * super-admin can do everything a valid session can.
 */

test.describe('posts', () => {
  test.beforeEach(async ({ superAdminPage }) => {
    await superAdminPage.goto('/');
    await superAdminPage.waitForURL('/', { timeout: 15_000 });

    /* The posts list is inside the "Recent Posts" accordion - open it first. */
    await superAdminPage.getByRole('button', { name: /Recent Posts/ }).click();
  });

  test('renders fetched posts from the /api/posts route', async ({
    superAdminPage,
  }) => {
    /*
     * JSONPlaceholder returns deterministic seed data; the first post's title
     * is stable, so asserting a real item proves the whole chain resolved
     * rather than just that a container rendered.
     */
    await expect(
      superAdminPage.getByText('sunt aut facere', { exact: false }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
