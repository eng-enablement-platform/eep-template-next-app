import { defineConfig } from 'vitest/config';

/*
 * Vitest config for timezone-sensitive tests. Uses `node` environment because
 * jsdom caches the system timezone at startup and ignores runtime TZ changes -
 * meaning TZ=America/Denver vitest would still report UTC offsets if run under
 * jsdom. The `node` environment respects the TZ env var on every test run.
 *
 * Scoped to dates.test.ts only - the full suite runs under the main config.
 * Driven by the `test:tz` script which runs this config three times under
 * different TZ values: America/Denver, America/New_York, Pacific/Auckland.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/utils/__tests__/dates.test.ts'],
  },
});
