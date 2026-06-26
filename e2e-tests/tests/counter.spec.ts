import { expect, test } from '../fixtures/auth.fixture';

/*
 * EXAMPLE E2E TEST
 *
 * Exercises the Zustand-backed counter end-to-end: the store drives the
 * rendered count, and each button mutates it. Reference coverage for the
 * client-state pattern, mirroring the unit tests in
 * src/store/__tests__/counter-store.test.ts.
 *
 * The counter lives inside a collapsible accordion on the home page — the
 * beforeEach opens it before each test.
 *
 * Uses the `authenticatedPage` fixture — the counter lives on the home page
 * which is behind Clerk auth.
 */

test.describe('counter', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/');
    await authenticatedPage.waitForURL('/', { timeout: 15_000 });

    /* The counter is inside the "Counter" accordion — open it first. */
    await authenticatedPage.getByRole('button', { name: /Counter/ }).click();
    await expect(authenticatedPage.getByText('Count: 0')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('increments the count', async ({ authenticatedPage }) => {
    await authenticatedPage.getByRole('button', { name: 'Increment' }).click();
    await authenticatedPage.getByRole('button', { name: 'Increment' }).click();

    await expect(authenticatedPage.getByText('Count: 2')).toBeVisible();
  });

  test('decrements the count', async ({ authenticatedPage }) => {
    await authenticatedPage.getByRole('button', { name: 'Increment' }).click();
    await expect(authenticatedPage.getByText('Count: 1')).toBeVisible();

    await authenticatedPage.getByRole('button', { name: 'Decrement' }).click();

    await expect(authenticatedPage.getByText('Count: 0')).toBeVisible();
  });

  test('resets the count back to zero', async ({ authenticatedPage }) => {
    await authenticatedPage.getByRole('button', { name: 'Increment' }).click();
    await authenticatedPage.getByRole('button', { name: 'Increment' }).click();
    await expect(authenticatedPage.getByText('Count: 2')).toBeVisible();

    await authenticatedPage.getByRole('button', { name: 'Reset' }).click();

    await expect(authenticatedPage.getByText('Count: 0')).toBeVisible();
  });
});
