import { clerk, setupClerkTestingToken } from '@clerk/testing/playwright';
import { test as base, type Page } from '@playwright/test';

/**
 * Auth fixture for Playwright e2e tests.
 *
 * Extends the base `test` with an `authenticatedPage` fixture that signs in
 * via Clerk's Backend API before yielding the page — no password required,
 * just `CLERK_SECRET_KEY` and `E2E_CLERK_USER_EMAIL` in `.env.local`.
 *
 * Usage:
 * ```ts
 * import { expect, test } from '../fixtures/auth.fixture';
 *
 * test('protected route', async ({ authenticatedPage }) => {
 *   await authenticatedPage.goto('/');
 *   await expect(authenticatedPage).not.toHaveURL(/sign-in/);
 * });
 * ```
 *
 * @see https://clerk.com/docs/testing/playwright/test-helpers
 */

type AuthFixtures = {
  /** A page that is already signed in with the configured test user. */
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await setupClerkTestingToken({ page });

    await page.goto('/sign-in');

    await clerk.signIn({
      page,
      signInParams: {
        strategy: 'email_code',
        identifier: process.env.E2E_CLERK_USER_EMAIL ?? '',
      },
    });

    await use(page);

    await clerk.signOut({ page });
  },
});

export { expect } from '@playwright/test';
