import { NextResponse } from 'next/server';

import { routeErrorHandler, withAuth } from '@/app/api/utils';
import { postsService } from '@/classes/services/posts';

/**
 * EXAMPLE ROUTE
 *
 * Read route for the posts demo. This flow is illustrative. Auth is enforced
 * in-handler (`withAuth`) so a read still requires an authenticated caller,
 * independent of the proxy.
 */

/**
 * List the demo posts.
 *
 * @returns 200 with `{ posts }`, 401 if unauthenticated, or 500 on an upstream
 *   failure.
 *
 * @example
 * GET http://localhost:3000/api/posts
 * Response: `{ "posts": [{ "id": 1, "title": "...", ... }] }`
 */
export const GET = withAuth(async () => {
  try {
    const posts = await postsService.getAll();
    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    return routeErrorHandler(error, 'GET /api/posts');
  }
});
