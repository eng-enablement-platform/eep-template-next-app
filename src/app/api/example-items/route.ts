import { NextResponse } from 'next/server';

import {
  routeErrorHandler,
  validationErrorResponse,
  withAuth,
  withRole,
} from '@/app/api/utils';
import { LOG_SOURCE, rootLogger } from '@/classes/loggers/application';
import { exampleItemService } from '@/classes/services/example-item';
import { exampleItemSchema } from '@/validation/example-item';

const logger = rootLogger(LOG_SOURCE.API);

// EXAMPLE ROUTE HANDLERS

/**
 * Collection route for `example_items`.
 *
 * This file, together with `[id]/route.ts`, is the template's full-CRUD REST
 * reference (GET / POST / PATCH / DELETE). It exists so every HTTP method is
 * documented in one place and is reachable from Swagger and tools like curl.
 *
 * Auth is enforced in-handler for defence-in-depth (independent of the proxy):
 * reads require any authenticated caller (`withAuth`), writes require the
 * `SuperAdmin` role (`withRole('SuperAdmin')`). This is the template's teaching
 * shape - in a real product you would pick the role per route, not blanket
 * `SuperAdmin` on every write.
 *
 * For mutations driven by our own UI, prefer the matching server action in
 * `actions/example-item-actions.ts` - it shares the same Zod schema and the same
 * role check. Reach for these POST/PATCH/DELETE handlers when the write comes
 * from an external caller (a webhook, a cron job, a non-browser client). See
 * `src/app/README.md`.
 */

/**
 * List every example item.
 *
 * @returns 200 with `{ exampleItems }`, or 401 if unauthenticated.
 *
 * @example
 * GET http://localhost:3000/api/example-items
 * Response: `{ "exampleItems": [{ "id": 1, "name": "...", ... }] }`
 */
export const GET = withAuth(async () => {
  try {
    const exampleItems = await exampleItemService.getAll();
    return NextResponse.json({ exampleItems }, { status: 200 });
  } catch (error) {
    return routeErrorHandler(error, 'GET /api/example-items');
  }
});

/**
 * Create a new example item. Requires the `SuperAdmin` role.
 *
 * @param request - Request whose JSON body is validated by `exampleItemSchema`.
 * @returns 201 with `{ exampleItem }`, 400 with field errors on invalid input,
 *   401 if unauthenticated, or 403 without the `SuperAdmin` role.
 *
 * @example
 * POST http://localhost:3000/api/example-items
 * Body: `{ "name": "First item", "quantity": 3, "status": "active" }`
 * Response: `{ "exampleItem": { "id": 1, "name": "First item", ... } }`
 */
export const POST = withRole('SuperAdmin', async (request) => {
  try {
    const parsed = exampleItemSchema.safeParse(await request.json());

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const exampleItem = await exampleItemService.create(parsed.data);
    logger.info({ message: 'Example item created', id: exampleItem.id });

    return NextResponse.json({ exampleItem }, { status: 201 });
  } catch (error) {
    return routeErrorHandler(error, 'POST /api/example-items');
  }
});
