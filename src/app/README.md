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

Both write surfaces validate with the **same Zod schema**
(`src/validation/example-item.ts`), so a route and an action can never disagree
about what valid input is.

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

## Documenting a route in OpenAPI

The interactive docs at `/api-docs` (and the spec at `/api/openapi`) are **not**
auto-discovered from the filesystem. The spec is assembled by hand in
`src/lib/openapi/index.ts` from your Zod schemas. This is deliberate: the spec
stays exact and fully typed, and the docs match reality because you state the
responses rather than letting a scanner guess them.

The cost is a small, bounded amount of config per operation. Most of it is
reused `$ref`s, so a second route on the same resource is mostly copy-paste.

### Steps to add a new route to the docs

Say you add `GET /api/widgets`:

1. **Build the route as normal** — `app/api/widgets/route.ts`, validating input
   with a Zod schema in `src/validation/widget.ts`. (Standard Next.js; nothing
   OpenAPI-specific yet. If you skip the rest, the route still works — it just
   won't appear in the docs.)

2. **Annotate the schema with `.meta()`** so it carries its own docs. Add
   `description` / `example` per field, and an `id` on the object to register it
   as a reusable component:

   ```ts
   export const widgetSchema = z
     .object({
       label: z.string().meta({ description: 'Widget label.', example: 'A' }),
     })
     .meta({ id: 'WidgetInput', description: 'Body for creating a widget.' });
   ```

   Also export an **entity** schema (the full row the API returns, including
   generated `id` / `createdAt`) with its own `.meta({ id: 'Widget' })` — that
   is the response contract. See `exampleItemEntitySchema` for the pattern.

3. **Register the operation** in `src/lib/openapi/index.ts`: add a `paths` entry
   keyed by the URL, with the method, `summary`, `tags`, any `requestParams` /
   `requestBody`, and the `responses` (wire each to the relevant schema via the
   `jsonContent` helper). Reuse the shared `validationErrorResponse` /
   `notFoundResponse` for 400 / 404 so error shapes stay consistent.

4. **Done** — no build step. The spec is rebuilt on the next request to
   `/api/openapi`, and `/api-docs` reflects it on refresh. Because the same
   schema validates the request and generates the doc, the two cannot drift.

### Why this isn't fully automatic

Two philosophies exist:

- **Explicit (this template):** hand-write the small `paths` entry. Verbose but
  exact, typed, and honest about responses. Fits the boring-by-default ethos.
- **Annotation-scanning** (e.g. `next-openapi-gen`): JSDoc tags above each
  handler + a CLI that scans the tree and emits the spec. Less typing, but it's
  a build step that can drift and it re-states info already in your Zod schemas.

If the per-route boilerplate ever outgrows its value, the explicit `paths`
object in one file is also the easiest thing to later generate from a helper —
the schemas are already the source of truth.

## The layers behind it

```
src/db/schema.ts            // exampleItemsTable + status pgEnum
src/db/types.ts             // inferred ExampleItem / NewExampleItem
src/validation/example-item.ts   // exampleItemSchema — the single source of truth
src/classes/services/example-item/   // exampleItemService — CRUD over Drizzle (server-only)
src/app/api/example-items/  // REST reference (GET/POST/PATCH/DELETE)
src/actions/example-item-actions.ts // recommended UI write path
src/lib/openapi/index.ts    // assembles the OpenAPI spec from the Zod schemas
src/app/api/openapi/route.ts // serves the spec JSON at /api/openapi
src/app/api-docs/route.ts   // Swagger UI at /api-docs (renders the spec)
scripts/seed.ts             // pnpm db:seed — live data to test against
scripts/db-smoke-check.ts   // pnpm db:check — read-only data-path sanity check
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
