import { type NextRequest, NextResponse } from 'next/server';

import { routeErrorHandler } from '@/app/api/utils';
import { postsService } from '@/classes/services/posts';

/**
 * EXAMPLE ROUTE
 *
 * Read route for the posts demo. This flow is deliberately illustrative
 *
 */

/**
 * List the demo posts.
 *
 * @param _request - Unused, required by the Next.js handler signature.
 * @returns 200 with `{ posts }`, or 500 on an upstream failure.
 *
 * @example
 * GET http://localhost:3000/api/posts
 * Response: `{ "posts": [{ "id": 1, "title": "...", ... }] }`
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const posts = await postsService.getAll();
    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    return routeErrorHandler(error, 'GET /api/posts');
  }
}
