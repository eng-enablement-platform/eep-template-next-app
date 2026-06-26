import { expect, test } from '@playwright/test';

/*
 * EXAMPLE E2E TEST
 *
 * Smoke check — verifies the app is running and Clerk's auth gate is active.
 * No credentials required; runs without the auth fixture.
 */

test('unauthenticated visit redirects to sign-in', async ({ page }) => {
  await page.goto('/');

  await page.waitForURL(/sign-in/, { timeout: 10_000 });
  await expect(page).toHaveURL(/sign-in/);
});

test('sign-in page renders the Clerk component', async ({ page }) => {
  await page.goto('/sign-in');

  await expect(page.locator('[data-clerk-component="SignIn"]')).toBeVisible({
    timeout: 15_000,
  });
});
