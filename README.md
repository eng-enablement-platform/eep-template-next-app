## Getting Started

```bash
pnpm install
```

First, run the development server:

```bash
pnpm dev
```

```bash
# Terminal 1 — leave running
pnpm dev

# Terminal 2 — iterate freely against the warm server
pnpm e2e
pnpm e2e:ui
```

## Local database

Local dev runs Postgres in Docker; production points the same driver at a hosted
provider (e.g. Neon) by changing only `DATABASE_URL`.

```bash
cp env.local_template .env.local   # local dev default already filled in
docker compose up -d               # start Postgres on :5432
pnpm db:generate                   # SQL migration from src/db/schema.ts
pnpm db:migrate                    # apply migrations
pnpm db:seed                       # insert demo example_items rows
pnpm db:check                      # read-only sanity check the data path
```

`pnpm db:check` (`scripts/db-smoke-check.ts`) is a fast, mutation-free probe of
the full `DATABASE_URL → pg.Pool → Drizzle → example_items` path — handy after a
fresh clone or when a teammate's local DB is misbehaving.

## API docs (OpenAPI + Swagger UI)

With the dev server running, the `example_items` REST API documents itself:

- **Interactive UI:** http://localhost:3000/api-docs — Swagger UI for every
  method, with a live "Try it out" console to fire requests against the running
  app and seeded data.
- **Raw spec (JSON):** http://localhost:3000/api/openapi — the OpenAPI 3.1
  document, for Postman, codegen, or SDK builders.

### How it works

Three layers, each with one job, none duplicating the others:

```
Zod schema (.meta)  →  zod-openapi createDocument()  →  OpenAPI JSON  →  Swagger UI renders it
  validation + docs       converts + registers $refs       /api/openapi      /api-docs
```

- **Zod** (`src/validation/example-item.ts`) is the single source of truth. The
  same schemas validate incoming requests _and_ carry their own documentation
  via Zod 4's native `.meta()` (descriptions, examples, and a component `id`).
- **`zod-openapi`** (`src/lib/openapi/`) walks those schemas in
  `createDocument()`, converts them to OpenAPI, and auto-registers anything with
  a `.meta({ id })` as a reusable `components/schemas` entry (so models are
  `$ref`'d, not inlined). It reads Zod's native `.meta()` directly — no
  `extendZodWithOpenApi` shim is needed on Zod 4.
- **Swagger UI** (`src/app/api-docs/route.ts`) is purely the renderer — served
  from prebuilt assets (`/swagger-ui/...`, vendored from `swagger-ui-dist` by
  `scripts/copy-swagger-ui.ts`, no third-party CDN). It reads the spec URL and
  renders the page. Swapping it for another renderer changes only the chrome,
  not the spec.

The payoff is that the schema, the validator, and the docs cannot drift: add a
field to the Zod schema and it appears in validation, the spec, and the docs at
once. The flip side is that the docs are only as correct as the schema — a
subtly wrong schema produces subtly wrong docs (which is exactly how a PATCH
default-reset bug got caught).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
