import { expect, test } from '../fixtures/auth.fixture';

/*
 * EXAMPLE E2E TEST
 *
 * Exercises the template's two-tier role model end to end (see
 * `src/types/clerk.d.ts`, `src/proxy.ts`, `src/app/api/utils/index.ts`, and
 * `src/actions/example-item-actions.ts`). Three surfaces are checked:
 *
 * - Page gate (proxy): Admin and SuperAdmin reach the app; a no-role user is
 *   bounced to /restricted.
 * - API authz (route handlers): reads need any session (withAuth); writes need
 *   SuperAdmin (withRole('SuperAdmin')) - so Admin gets 403, SuperAdmin 201.
 * - Server-action authz (UI): the example-items form surfaces the permission
 *   error as a toast for an under-privileged caller.
 *
 * `page.request` shares the browser context's cookies, so the signed-in Clerk
 * session rides along on the API calls without extra wiring.
 */

/* The 403 body from withRole('SuperAdmin') - see src/app/api/utils/index.ts. */
const REST_FORBIDDEN_MESSAGE = 'Requires the SuperAdmin role';

/*
 * The action-layer permission message - see authorizeMutation() in
 * src/actions/example-item-actions.ts. Surfaced as a toast by the form.
 */
const ACTION_FORBIDDEN_MESSAGE =
  'You do not have the correct role to do this (requires SuperAdmin)';

test.describe('role-based page access (proxy gate)', () => {
  test('Admin reaches the app home', async ({ adminPage }) => {
    await adminPage.goto('/');
    await expect(adminPage).toHaveURL('/', { timeout: 15_000 });
    await expect(
      adminPage.getByRole('heading', { name: 'Ready to build' }),
    ).toBeVisible();
  });

  test('SuperAdmin reaches the app home', async ({ superAdminPage }) => {
    await superAdminPage.goto('/');
    await expect(superAdminPage).toHaveURL('/', { timeout: 15_000 });
    await expect(
      superAdminPage.getByRole('heading', { name: 'Ready to build' }),
    ).toBeVisible();
  });

  test('a signed-in user without a qualifying role is sent to /restricted', async ({
    noRolePage,
  }) => {
    await noRolePage.goto('/');
    await expect(noRolePage).toHaveURL(/\/restricted$/, { timeout: 15_000 });
    await expect(
      noRolePage.getByRole('heading', { name: 'Access restricted' }),
    ).toBeVisible();
  });
});

test.describe('role-based API authorization', () => {
  test('Admin can read but cannot write example items', async ({
    adminPage,
  }) => {
    /* Read is gated by withAuth only - any authenticated caller succeeds. */
    const getResponse = await adminPage.request.get('/api/example-items');
    expect(getResponse.status()).toBe(200);

    /* Write is gated by withRole('SuperAdmin') - an Admin is forbidden. */
    const postResponse = await adminPage.request.post('/api/example-items', {
      data: { name: 'admin-should-not-create', quantity: 1, status: 'active' },
    });
    expect(postResponse.status()).toBe(403);
    expect((await postResponse.json()).error).toBe(REST_FORBIDDEN_MESSAGE);
  });

  test('SuperAdmin can create an example item', async ({ superAdminPage }) => {
    const postResponse = await superAdminPage.request.post(
      '/api/example-items',
      {
        data: {
          name: `e2e-superadmin-${Date.now()}`,
          quantity: 1,
          status: 'active',
        },
      },
    );
    expect(postResponse.status()).toBe(201);
    expect((await postResponse.json()).exampleItem).toBeTruthy();
  });
});

test.describe('role-based server-action authorization (UI)', () => {
  test('Admin sees a permission toast when creating via the form', async ({
    adminPage,
  }) => {
    await adminPage.goto('/');
    await adminPage.waitForURL('/', { timeout: 15_000 });

    /* Open the Example Items accordion, then fill and submit the create form. */
    await adminPage.getByRole('button', { name: /Example Items/ }).click();
    await adminPage
      .getByPlaceholder('Item name')
      .fill(`admin-ui-${Date.now()}`);
    await adminPage.getByRole('button', { name: 'Add item' }).click();

    /*
     * The action returns a failing ActionResult; the form surfaces
     * result.error both inline and as a toast. Asserting the exact copy proves
     * the authz message reached the UI, not a generic failure.
     */
    await expect(adminPage.getByText(ACTION_FORBIDDEN_MESSAGE)).toBeVisible({
      timeout: 10_000,
    });
  });
});
