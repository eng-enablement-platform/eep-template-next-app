import { expect, test } from '../fixtures/auth.fixture';

/*
 * EXAMPLE E2E TEST
 *
 * Exercises the Zustand-backed counter end-to-end: the store drives the
 * rendered count, and each button mutates it. Reference coverage for the
 * client-state pattern, mirroring the unit tests in
 * src/store/__tests__/counter-store.test.ts.
 *
 * The counter lives inside a collapsible accordion on the home page - the
 * beforeEach opens it before each test.
 *
 * Uses the `superAdminPage` fixture - the counter lives on the home page which
 * is behind Clerk auth, and a super-admin can do everything a valid session can.
 */

test.describe('counter', () => {
  test.beforeEach(async ({ superAdminPage }) => {
    await superAdminPage.goto('/');
    await superAdminPage.waitForURL('/', { timeout: 15_000 });

    /* The counter is inside the "Counter" accordion - open it first. */
    await superAdminPage.getByRole('button', { name: /Counter/ }).click();
    await expect(superAdminPage.getByText('Count: 0')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('increments the count', async ({ superAdminPage }) => {
    await superAdminPage.getByRole('button', { name: 'Increment' }).click();
    await superAdminPage.getByRole('button', { name: 'Increment' }).click();

    await expect(superAdminPage.getByText('Count: 2')).toBeVisible();
  });

  test('decrements the count', async ({ superAdminPage }) => {
    await superAdminPage.getByRole('button', { name: 'Increment' }).click();
    await expect(superAdminPage.getByText('Count: 1')).toBeVisible();

    await superAdminPage.getByRole('button', { name: 'Decrement' }).click();

    await expect(superAdminPage.getByText('Count: 0')).toBeVisible();
  });

  test('resets the count back to zero', async ({ superAdminPage }) => {
    await superAdminPage.getByRole('button', { name: 'Increment' }).click();
    await superAdminPage.getByRole('button', { name: 'Increment' }).click();
    await expect(superAdminPage.getByText('Count: 2')).toBeVisible();

    await superAdminPage.getByRole('button', { name: 'Reset' }).click();

    await expect(superAdminPage.getByText('Count: 0')).toBeVisible();
  });
});
