# EEP Next.js Template

A production-grade Next.js scaffold built on [Engineering Enablement Platform
(EEP)](https://github.com/your-org/eep) principles. Ships full — authentication,
database, API docs, logging, and conventions all wired and demonstrated — so you
can strip what you don't need rather than bolt on what you do.

## Prerequisites

- Node.js ≥ 20
- [pnpm](https://pnpm.io) ≥ 9
- Docker (for local Postgres)

## Setup

```bash
pnpm install
cp env.local_template .env.local   # fill in your secrets
```

## Dev servers

The repo contains two apps: the **Next.js app** (`:3000`) and the **docs site**
(`:3001`). Run them independently or together.

| Command         | What starts                            |
| --------------- | -------------------------------------- |
| `pnpm dev`      | App only — `http://localhost:3000`     |
| `pnpm dev:docs` | Docs only — `http://localhost:3001`    |
| `pnpm dev:all`  | Both concurrently, colour-coded output |

```bash
# Most common — just the app
pnpm dev

# Full environment — app + docs side-by-side
pnpm dev:all

# Docs site only (e.g. writing content without the app overhead)
pnpm dev:docs
```

> The docs site is a separate Fumadocs workspace (`docs/`). It runs its own
> Next.js process and does not share the app's env vars or database.

## Local database

Local dev runs Postgres in Docker; production points the same driver at a hosted
provider (e.g. Neon) by changing only `DATABASE_URL`.

```bash
docker compose up -d     # start Postgres on :5432
pnpm db:generate         # generate SQL migration from src/db/schema.ts
pnpm db:migrate          # apply migrations
pnpm db:seed             # insert demo rows
pnpm db:check            # read-only sanity check of the full data path
```

`pnpm db:check` (`scripts/db-smoke-check.ts`) is a fast, mutation-free probe of
the full `DATABASE_URL → pg.Pool → Drizzle → example_items` path — useful after
a fresh clone or when a local DB is misbehaving.

## Builds

```bash
pnpm build        # app only
pnpm build:docs   # docs site only
pnpm build:all    # both
```

## Testing

```bash
pnpm test          # unit tests (Vitest)
pnpm test:watch    # watch mode
pnpm typecheck     # TypeScript, no emit
pnpm lint          # ESLint
```

### End-to-end

```bash
# Terminal 1 — leave running
pnpm dev

# Terminal 2
pnpm e2e         # headless
pnpm e2e:ui      # Playwright UI mode
pnpm e2e:debug   # step-through debugger
```

## Logging

Backend logs go through Winston; every line carries a `logSource` (the
architectural layer: `api`, `action`, `service`) so you can follow one source
while debugging.

```bash
LOG_LEVEL=debug pnpm dev              # see all levels (default: info in prod, debug in dev)
DB_QUERY_LOG=1 pnpm dev              # stream raw Drizzle SQL + params to the console
LOG_LEVEL=debug DB_QUERY_LOG=1 pnpm dev  # both
```

Structured logs are also written to `.logs/` (`winston-combined.log`,
`winston-error.log`). Grep by source:

```bash
grep '"logSource":"action"' .logs/winston-combined.log
```

See `AGENTS.md` → Logging for the source/scope conventions.

## API docs (OpenAPI + Swagger UI)

With the dev server running:

- **Interactive UI:** http://localhost:3000/api-docs — live "Try it out" console
- **Raw spec (JSON):** http://localhost:3000/api/openapi — for Postman, codegen, SDK builders

Requires the **Admin role** — others receive a 403. See Authentication below.

### How it works

```
Zod schema (.meta)  →  zod-openapi createDocument()  →  OpenAPI JSON  →  Swagger UI
  validation + docs      converts + registers $refs       /api/openapi      /api-docs
```

Zod (`src/validation/`) is the single source of truth. The same schemas validate
requests and carry their documentation via Zod 4's native `.meta()`. Adding a
route to the spec: annotate its schema with `.meta({ id })` and add a `paths`
entry in `src/lib/openapi/index.ts`. Full steps in `src/app/README.md`.

## Authentication (Clerk)

### Route gating lives in `proxy.ts`

Next.js 16 renamed `middleware.ts` to `proxy.ts` (Node.js runtime, explicit
network boundary). Our Clerk gate lives in `src/proxy.ts`. Keep this layer to
lightweight checks (redirects, session-claim reads) — heavier auth belongs in
route handlers or the DAL.

### The publishable key is a build-time value

`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is inlined into the client bundle at
`next build`, not read at runtime. Fine on Vercel (each env builds separately).
Breaks if you build one Docker image and promote it across envs — the runtime
value never reaches the bundle. Fix: serve the key from a server route and mount
`<ClerkProvider publishableKey={...}>` once it resolves. This template defaults
to the Vercel path.

### Granting Admin access

Admin-only routes (`/admin/*`, `/api-docs/*`) are gated in `src/proxy.ts` via
`sessionClaims.metadata.role`. Two steps required — missing either gives a
silent 403.

**1. Set public metadata.** Clerk Dashboard → Users → pick user → Metadata →
Public:

```json
{ "role": "Admin" }
```

**2. Map it into the session token.** Clerk Dashboard → Configure → Sessions →
Customize session token → Edit:

```json
{ "metadata": "{{user.public_metadata}}" }
```

Save, then sign out and back in so a fresh token is minted. If you still get a
403, the claim is missing from the JWT — step 2 wasn't applied, or the session
is stale.

## Deploy

The simplest deployment target is [Vercel](https://vercel.com/new). Set the same
env vars from `.env.local` in the Vercel project settings and deploy from `main`.

For other targets, note the `NEXT_PUBLIC_*` build-time caveat above.

## OTHER THINGS (scratch notes — not done)

- Think about testing hooks and checking if api routes they call get removed (had that issue before where i deleted an api route but it never got flagged even though the hook was using it)
- add https://storybook.js.org/ or https://ladle.dev/docs/setup
- diagrams library
- dev containers
- base components + design system (optional strip-out)
- AGENTS.md refinement
- docs content (EEP philosophy, architecture, decisions per layer)
