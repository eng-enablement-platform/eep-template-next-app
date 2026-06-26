import { defineConfig } from 'vitest/config';

/*
 * Vitest config for contract tests. Uses `node` environment so fetch is
 * available natively (Node 18+). Scoped to src/contract-tests/ only — these
 * make real network calls and are intentionally excluded from the standard
 * test suite to keep fast feedback loops fast.
 *
 * Run with: `pnpm test:contract`
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['contract-tests/**/*.contract.test.ts'],
    // Generous timeout — live network calls can be slow.
    testTimeout: 15_000,
  },
});
