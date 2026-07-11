import { clerk } from '@clerk/testing/playwright';
import { test as base, type Page } from '@playwright/test';

/**
 * Auth fixtures for Playwright e2e tests.
 *
 * The template ships a two-role model (`Admin` | `SuperAdmin`, see
 * `src/types/clerk.d.ts`) plus signed-in users with no qualifying role. Each
 * fixture below signs in as one of those personas via Clerk's Backend API - no
 * password required, just `CLERK_SECRET_KEY` and the matching e-mail env var:
 *
 * - `superAdminPage` reads `E2E_CLERK_USER_EMAIL_SUPER_ADMIN`
 * - `adminPage` reads `E2E_CLERK_USER_EMAIL_ADMIN`
 * - `noRolePage` reads `E2E_CLERK_USER_EMAIL_NO_ROLE`
 *
 * A super-admin can do everything a plain authenticated user could, so specs
 * that just need "any valid session" (counter, posts) use `superAdminPage`.
 * The role-specific behaviour (page gate, API/action authz) is covered by
 * `roles.spec.ts`, which uses all three.
 *
 * Usage:
 * ```ts
 * import { expect, test } from '../fixtures/auth.fixture';
 *
 * test('protected route', async ({ superAdminPage }) => {
 *   await superAdminPage.goto('/');
 *   await expect(superAdminPage).not.toHaveURL(/sign-in/);
 * });
 * ```
 *
 * @see https://clerk.com/docs/testing/playwright/test-helpers
 */

type AuthFixtures = {
  /** Signed in as the SuperAdmin test user (reads + writes). */
  superAdminPage: Page;
  /** Signed in as the Admin test user (reads only; writes are denied). */
  adminPage: Page;
  /** Signed in as a user with no qualifying role (bounced to /restricted). */
  noRolePage: Page;
};

/**
 * Sign a page in as the user identified by `email` via Clerk's Backend API,
 * wait for Clerk to settle, hand the page to the test, then sign out again.
 *
 * Shared by every role fixture so the sign-in/out lifecycle lives in one place.
 *
 * @param page - The Playwright page to authenticate.
 * @param email - The Clerk user's e-mail (from a role-specific env var).
 * @param use - Playwright's fixture callback, invoked with the signed-in page.
 * @returns A promise that resolves once the fixture lifecycle completes.
 *
 * @example
 * ```ts
 * await signInAs(page, process.env.E2E_CLERK_USER_EMAIL_ADMIN ?? '', use);
 * ```
 */
async function signInAs(
  page: Page,
  email: string,
  use: (page: Page) => Promise<void>,
): Promise<void> {
  /*
   * Navigate to an unprotected page first - clerk.signIn() requires Clerk to
   * be loaded in the page before it can run.
   */
  await page.goto('/sign-in');

  /*
   * emailAddress approach: signs in via the Backend API using CLERK_SECRET_KEY.
   * Bypasses OTP and MFA entirely. The user must exist in the Clerk dashboard.
   */
  await clerk.signIn({ page, emailAddress: email });

  /*
   * Wait for Clerk to finish settling after sign-in before handing the page to
   * the test. Without this, the page may still be mid-redirect and elements the
   * test expects won't be present yet.
   */
  await clerk.loaded({ page });

  await use(page);

  await clerk.signOut({ page });
}

export const test = base.extend<AuthFixtures>({
  superAdminPage: async ({ page }, use) => {
    await signInAs(
      page,
      process.env.E2E_CLERK_USER_EMAIL_SUPER_ADMIN ?? '',
      use,
    );
  },
  adminPage: async ({ page }, use) => {
    await signInAs(page, process.env.E2E_CLERK_USER_EMAIL_ADMIN ?? '', use);
  },
  noRolePage: async ({ page }, use) => {
    await signInAs(page, process.env.E2E_CLERK_USER_EMAIL_NO_ROLE ?? '', use);
  },
});

export { expect } from '@playwright/test';
