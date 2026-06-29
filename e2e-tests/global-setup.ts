import { clerkSetup } from '@clerk/testing/playwright';

/**
 * Global setup for Playwright e2e tests.
 *
 * Runs once before all tests. Calls `clerkSetup()` from `@clerk/testing`
 * which configures the Clerk testing token so the `authenticatedPage` fixture
 * can sign in via the Backend API without a password.
 *
 * Requires `CLERK_SECRET_KEY` to be set in `.env.local`.
 * Tests still run if the key is absent - auth tests will fail, smoke tests won't.
 *
 * @see https://clerk.com/docs/testing/playwright/overview
 */
export default async function globalSetup() {
  await clerkSetup();
}
