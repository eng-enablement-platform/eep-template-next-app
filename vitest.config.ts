import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

/*
 * Minimal vitest config for the template. `vite-tsconfig-paths` mirrors the
 * `@/*` alias from `tsconfig.json` so test files can import the same way
 * source files do. Add `test.environment: "jsdom"` and
 * `@testing-library/react` when component tests get introduced.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
