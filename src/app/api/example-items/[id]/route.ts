import { NextResponse } from 'next/server';

import {
  parseId,
  routeErrorHandler,
  validationErrorResponse,
  withAuth,
  withRole,
} from '@/app/api/utils';
import { LOG_SOURCE, rootLogger } from '@/classes/loggers/application';
import { exampleItemService } from '@/classes/services/example-item';
import { exampleItemUpdateSchema } from '@/validation/example-item';

const logger = rootLogger(LOG_SOURCE.API);

// EXAMPLE ROUTE HANDLERS

/**
 * Single-resource route for `example_items` (read, update, delete by id).
 *
 * Part of the full-CRUD REST reference. Like the collection route, auth is
 * enforced in-handler: `GET` requires any authenticated caller (`withAuth`),
 * `PATCH`/`DELETE` require the `SuperAdmin` role (`withRole('SuperAdmin')`).
 *
 * In Next.js 15+, dynamic route `params` are async and must be awaited before
 * their values can be read.
 */

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Fetch a single example item by id.
 *
 * @param _request - Unused, required by the Next.js handler signature.
 * @param context - Route context carrying the async `id` param.
 * @returns 200 with `{ exampleItem }`, 400 on a bad id, 401 if unauthenticated,
 *   or 404 if not found.
 *
 * @example
 * GET http://localhost:3000/api/example-items/1
 * Response: `{ "exampleItem": { "id": 1, "name": "...", ... } }`
 */
export const GET = withAuth<RouteContext>(async (_request, context) => {
  try {
    const id = parseId((await context.params).id);

    if (id === null) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const exampleItem = await exampleItemService.getById(id);

    if (exampleItem === null) {
      return NextResponse.json(
        { error: 'Example item not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ exampleItem }, { status: 200 });
  } catch (error) {
    return routeErrorHandler(error, 'GET /api/example-items/[id]');
  }
});

/**
 * Partially update an example item. Requires the `SuperAdmin` role.
 *
 * @param request - Request whose JSON body is validated by `exampleItemUpdateSchema`.
 * @param context - Route context carrying the async `id` param.
 * @returns 200 with `{ exampleItem }`, 400 on bad id/body, 401 if
 *   unauthenticated, 403 without the `SuperAdmin` role, or 404 if not found.
 *
 * @example
 * PATCH http://localhost:3000/api/example-items/1
 * Body: `{ "status": "archived" }`
 * Response: `{ "exampleItem": { "id": 1, "status": "archived", ... } }`
 */
export const PATCH = withRole<RouteContext>(
  'SuperAdmin',
  async (request, context) => {
    try {
      const id = parseId((await context.params).id);

      if (id === null) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
      }

      const parsed = exampleItemUpdateSchema.safeParse(await request.json());

      if (!parsed.success) {
        return validationErrorResponse(parsed.error);
      }

      const exampleItem = await exampleItemService.update(id, parsed.data);

      if (exampleItem === null) {
        return NextResponse.json(
          { error: 'Example item not found' },
          { status: 404 },
        );
      }

      logger.info({ message: 'Example item updated', id });

      return NextResponse.json({ exampleItem }, { status: 200 });
    } catch (error) {
      return routeErrorHandler(error, 'PATCH /api/example-items/[id]');
    }
  },
);

/**
 * Delete an example item by id. Requires the `SuperAdmin` role.
 *
 * @param _request - Unused, required by the Next.js handler signature.
 * @param context - Route context carrying the async `id` param.
 * @returns 204 on success, 400 on a bad id, 401 if unauthenticated, 403 without
 *   the `SuperAdmin` role, or 404 if not found.
 *
 * @example
 * DELETE http://localhost:3000/api/example-items/1
 * Response: 204 No Content
 */
export const DELETE = withRole<RouteContext>(
  'SuperAdmin',
  async (_request, context) => {
    try {
      const id = parseId((await context.params).id);

      if (id === null) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
      }

      const deleted = await exampleItemService.delete(id);

      if (!deleted) {
        return NextResponse.json(
          { error: 'Example item not found' },
          { status: 404 },
        );
      }

      logger.info({ message: 'Example item deleted', id });

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return routeErrorHandler(error, 'DELETE /api/example-items/[id]');
    }
  },
);
