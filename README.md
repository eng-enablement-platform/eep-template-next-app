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

## Authentication (Clerk)

Auth is handled by [Clerk](https://clerk.com). Two things are worth knowing
before you build for anything other than Vercel — both are candidates for fuller
write-ups on the docs site.

### Request gating lives in `proxy.ts`, not `middleware.ts`

Next.js 16 renamed the root `middleware.ts` convention to `proxy.ts` (it now
runs on the Node.js runtime and makes the network boundary explicit). Our Clerk
route gate lives in `src/proxy.ts` — same logic as the old middleware, default
export, `config.matcher` unchanged. Keep this layer to lightweight network
checks (redirects, rewrites, reading session claims). Heavier auth (DB lookups,
full session validation) belongs in the Data Access Layer or Route Handlers —
the proxy is not a security boundary on its own.

### The `NEXT_PUBLIC` publishable key is a BUILD-time value

`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (like all `NEXT_PUBLIC_*` vars) is **inlined
into the client bundle at `next build`**, not read at runtime. On Vercel this is
fine — each environment builds with its own env vars present.

It breaks if you build **one Docker image and promote it across environments**
(or inject env only at `docker run` / k8s deploy time): the key is frozen at
build time, so a runtime-provided value never reaches the bundle. The fix is to
serve the key from a server route that reads a non-`NEXT_PUBLIC` env var at
request time and mount `<ClerkProvider publishableKey={...}>` once it resolves.
The full reasoning and the runtime-fetch recipe are documented inline in
`src/app/clerk-client-wrapper.tsx`. This template defaults to the build-time
path because it targets Vercel.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
