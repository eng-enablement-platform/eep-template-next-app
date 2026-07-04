/**
 * Internal API route path constants.
 *
 * Every internal `/api/*` path consumed by a SWR hook is defined here.
 *
 * For parameterised routes, use the builder function - it produces a
 * fully-resolved path and keeps call sites free of manual string interpolation.
 *
 * @example
 * ```ts
 * // Flat route
 * useSWR(API_ROUTES.exampleItems);
 *
 * // Parameterised route
 * await fetch(API_ROUTES.exampleItem(item.id), { method: 'DELETE' });
 * ```
 */
export const API_ROUTES = {
  /** `GET /api/example-items` - list all example items. */
  exampleItems: '/api/example-items',

  /** `GET /api/posts` - list the demo posts (server-side integration example). */
  posts: '/api/posts',

  /**
   * Builds a path for a single example item.
   *
   * @param id - The numeric ID of the example item.
   * @returns The resolved path, e.g. `/api/example-items/42`.
   */
  exampleItem: (id: number) => `/api/example-items/${id}`,
} as const;
