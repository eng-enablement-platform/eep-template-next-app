import { clerk } from '@clerk/testing/playwright';
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
    /*
     * Navigate to an unprotected page first — clerk.signIn() requires Clerk
     * to be loaded in the page before it can run.
     */
    await page.goto('/sign-in');

    /*
     * emailAddress approach: signs in via the Backend API using CLERK_SECRET_KEY.
     * Bypasses OTP and MFA entirely. The user must exist in the Clerk dashboard.
     * No +clerk_test email format required.
     */
    await clerk.signIn({
      page,
      emailAddress: process.env.E2E_CLERK_USER_EMAIL ?? '',
    });

    /*
     * Wait for Clerk to finish settling after sign-in before handing the page
     * to the test. Without this, the page may still be mid-redirect and
     * elements the test expects won't be present yet.
     */
    await clerk.loaded({ page });

    await use(page);

    await clerk.signOut({ page });
  },
});

export { expect } from '@playwright/test';
