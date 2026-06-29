import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/* Load .env.local so CLERK_SECRET_KEY and E2E_CLERK_USER_EMAIL are available
 * to the global setup and fixture without needing to export them manually. */
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const baseURL = 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  /*
   * Pin artifact paths inside `e2e-tests/` so they're caught by the project's
   * `.gitignore` and don't pollute the repo root.
   */
  outputDir: './test-results',
  reporter: [['html', { outputFolder: './playwright-report' }]],
  /*
   * Single worker, sequential. Parallel workers all hit `next dev` cold at
   * the same time and trigger a thundering herd of route + font compiles -
   * sustained 200%+ CPU on the dev server and macOS thermal throttling on
   * laptops. Dial workers back up once the suite is large enough that
   * wall-clock time hurts, and ideally only after switching the e2e target
   * to `next start` (production build, no per-request compile cost).
   */
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  use: {
    baseURL,
    /* Keep the full trace only on failure - view via `pnpm e2e:report`. */
    trace: 'retain-on-failure',
  },

  globalSetup: './global-setup.ts',

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: 'pnpm dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    /*
     * Generous timeout - cold `next dev` boots can be slow on a thermally
     * throttled laptop (kernel_task steals CPU after sustained load) and the
     * first-request compile pulls down + subsets the three Google Fonts in
     * the root layout. Default 60s is not enough in those conditions.
     */
    timeout: 180_000,
    cwd: '..',
  },
});
