import { existsSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

import { API_ROUTES } from '../api-routes';

/**
 * Contract tests for API_ROUTES.
 *
 * Each test asserts that a `route.ts` handler file exists on disk for the
 * corresponding constant.
 *
 * If a test goes red: a route handler was deleted or moved. Either restore
 * the handler, update API_ROUTES to match the new path, and update the hook
 * that consumes it.
 */

/*
 * Resolve from the project root (process.cwd()) so tests work regardless of
 * where vitest is invoked from.
 */
function routeFilePath(apiPath: string): string {
  return join(process.cwd(), 'src/app', apiPath, 'route.ts');
}

describe('API_ROUTES — route handlers exist on disk', () => {
  it('GET /api/example-items has a route handler', () => {
    const path = routeFilePath(API_ROUTES.exampleItems);
    expect(
      existsSync(path),
      `No route handler found at ${path}.\n` +
        `useExampleItems() calls API_ROUTES.exampleItems ('${API_ROUTES.exampleItems}') — ` +
        `if the handler was moved or deleted, update API_ROUTES and the hook.`,
    ).toBe(true);
  });

  it('GET /api/example-items/[id] has a route handler', () => {
    /*
     * The parameterised segment in Next.js is the literal folder name `[id]`,
     * not a resolved value — we check the template path directly.
     */
    const path = join(process.cwd(), 'src/app/api/example-items/[id]/route.ts');
    expect(
      existsSync(path),
      `No route handler found at ${path}.\n` +
        `API_ROUTES.exampleItem(id) resolves to '/api/example-items/:id' — ` +
        `if the handler was moved or deleted, update API_ROUTES and any callers.`,
    ).toBe(true);
  });
});
