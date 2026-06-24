import { defineConfig } from 'vitest/config';

/*
 * Vitest config for the template. `resolve.tsconfigPaths` mirrors the `@/*`
 * alias from `tsconfig.json` natively (Vite/Vitest now resolve tsconfig paths
 * without a plugin), so test files import the same way source files do.
 *
 * `jsdom` + the setup file give component tests a DOM and the jest-dom matchers
 * (toBeInTheDocument, etc.). Pure-logic tests (utils, store, validation) run
 * fine under jsdom too, so one environment covers the whole suite.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    /*
     * Stub `server-only` so vitest can import server-layer modules without
     * throwing. The package's only job is to cause a Next.js build error when
     * server code leaks into the client bundle — that is a build-time concern,
     * not something vitest needs to enforce.
     */
    alias: {
      'server-only': new URL('./vitest.server-only-stub.ts', import.meta.url)
        .pathname,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
