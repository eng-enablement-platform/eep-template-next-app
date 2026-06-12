import { expect, test } from '@playwright/test';

/*
 * Exercises the Zustand-backed counter end-to-end: the store drives the
 * rendered count, and each button mutates it. Reference coverage for the
 * client-state pattern, mirroring the unit tests in
 * src/store/__tests__/counter-store.test.ts.
 */
test.describe('counter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('increments the count', async ({ page }) => {
    await expect(page.getByText('Count: 0')).toBeVisible();

    await page.getByRole('button', { name: 'Increment' }).click();
    await page.getByRole('button', { name: 'Increment' }).click();

    await expect(page.getByText('Count: 2')).toBeVisible();
  });

  test('decrements the count', async ({ page }) => {
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();

    await page.getByRole('button', { name: 'Decrement' }).click();

    await expect(page.getByText('Count: 0')).toBeVisible();
  });

  test('resets the count back to zero', async ({ page }) => {
    await page.getByRole('button', { name: 'Increment' }).click();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 2')).toBeVisible();

    await page.getByRole('button', { name: 'Reset' }).click();

    await expect(page.getByText('Count: 0')).toBeVisible();
  });
});
