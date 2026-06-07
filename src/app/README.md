# Data API — reads, writes, and the example vertical

This template ships one reference data vertical — **`example_item`** — wired all
the way through schema, validation, service, REST routes, and a server action.
It is deliberately named so it reads as demo data: copy the pattern, then delete
the vertical when you build for real.

## The default pattern: read routes + write actions

For most apps the data API splits along how the two halves actually behave:

| Operation           | Lives in                           | Why                                                    |
| ------------------- | ---------------------------------- | ------------------------------------------------------ |
| Reads               | `GET` route handlers in `app/api/` | Cacheable, addressable, hit from SWR / curl / Swagger  |
| Writes from our UI  | Server Actions in `actions/`       | Type-safe args, progressive enhancement, no fetch glue |
| Writes from outside | Route handlers in `app/api/`       | Webhooks/cron/3rd-party need a real HTTP surface       |

Both write surfaces validate with the **same Zod schema** (`src/db/validation.ts`),
so a route and an action can never disagree about what valid input is.

### Why a server action for UI writes?

Server Actions are an internal RPC bound to your own frontend — a form or button
calls a typed function, no hand-written `fetch` + JSON wiring. They are **not** a
public API. The moment an _external_ caller needs to write (a Slack webhook, a
cron job, a mobile client), use a route handler instead — and reuse the action's
Zod schema so the validation stays in one place.

## The full-CRUD REST reference

`app/api/example-items/` implements **every** method — `GET` (list), `POST`,
plus `GET`/`PATCH`/`DELETE` by id in `[id]/route.ts`. This exists as a learning
and testing surface (it is fully HTTP, so Swagger can document all of it), **not**
as the default. In a real feature, prefer the read-route + write-action split
above unless an external caller forces the REST write path.

```
/app
  /api
    /example-items
      /[id]
        route.ts   // GET, PATCH, DELETE one item
      route.ts     // GET list, POST new item
```

## The layers behind it

```
src/db/schema.ts            // exampleItemsTable + status pgEnum
src/db/types.ts             // inferred ExampleItem / NewExampleItem
src/db/validation.ts        // exampleItemSchema — the single source of truth
src/classes/example-item/   // exampleItemService — CRUD over Drizzle (server-only)
src/app/api/example-items/  // REST reference (GET/POST/PATCH/DELETE)
src/actions/example-item-actions.ts // recommended UI write path
scripts/seed.ts             // pnpm db:seed — live data to test against
```

Routes and the action both call `exampleItemService` rather than touching
Drizzle directly, so the data-access logic lives in exactly one place.

## Running it locally

```bash
cp env.local_template .env.local
docker compose up -d        # local Postgres
pnpm db:generate            # generate the migration from schema.ts
pnpm db:migrate             # apply it
pnpm db:seed                # populate example_items
pnpm dev                    # GET http://localhost:3000/api/example-items
```

## Conventions

- Each `route.ts` exports HTTP method handlers (`GET`, `POST`, `PATCH`,
  `DELETE`) as named functions.
- Dynamic segments are bracketed folders, e.g. `[id]`. In Next.js 15+, `params`
  is async and must be awaited.
- Untrusted input is parsed with a Zod schema at the boundary before it reaches
  the service.
- [TSDoc](https://tsdoc.org/) documents every handler.
