# TODOs

## Tech docs (Fumadocs)

Every tool in the stack needs a proper write-up in the Fumadocs `stack/` section.

- [ ] **Winston** — backend logging. Document `rootLogger(logSource)` usage, the
      lazy vs eager singleton split (`ApplicationLogger` vs `QueryLogger`), the
      build-time no-op behaviour, and the `.logs/` transport layout.
- [ ] **Drizzle ORM** — the committed ORM. Document the `node-postgres` driver
      choice (one driver for local Docker dev + Neon prod), `getDb()` lazy
      singleton, `schema.ts` table definitions, and the migration flow
      (`db:generate` / `db:migrate`).
- [ ] **Postgres + Docker** — local dev DB. Document `docker compose up -d`, the
      `DATABASE_URL` convention, and the dev (Docker) vs prod (Neon) split.

## Example vertical follow-ups

The `example_item` reference vertical is built (schema, validation, service,
full-CRUD REST routes, server action, seed). Outstanding:

- [x] **Swagger / OpenAPI** over `app/api/example-items/` — done. Spec derived
      from the Zod schemas via `zod-openapi` (`.meta()` annotations + an output
      entity schema in `src/validation/example-item.ts`), assembled in
      `src/lib/openapi/`, served as JSON at `/api/openapi`, and rendered as an
      interactive Scalar UI at `/api-docs` (live "Test Request" against seeded
      data). All five methods verified via curl + browser.
- [ ] **Fumadocs page** for the data API — teach the read-route vs write-action
      split using the worked `example_item` example (mirror `src/app/README.md`).
- [ ] **Service + route tests** — `exampleItemService` unit tests and a route
      integration test against the seeded DB.

- [x] **PATCH resets defaulted fields** — fixed. Validation now derives both
      schemas from a default-free base (`exampleItemFields`): the create schema
      layers defaults back on, the update (PATCH) schema uses the base directly
      so omitted fields are left untouched. Regression test at
      `src/validation/__tests__/example-item.test.ts`; verified live (`PATCH`
      status-only keeps quantity, coercion still works).

## Parked — pick up next session

- [ ] **Mount `<Providers>` in `layout.tsx`** — `src/components/providers/index.tsx`
      exists but nothing renders it, so SWR's global fetcher is **not active yet**.
      Until mounted, `useSWR('/api/foo')` with no fetcher arg silently fails. Wire
      `<Providers>` around `children` in the root layout.
- [ ] **Fix stale TSDoc in `src/components/providers/swr.tsx`** — the comment says
      "Mounted in the root layout", which isn't true until the task above is done.
      Either soften the wording or let mounting make it true.
- [x] **Run the Drizzle vertical live** — done. `container-pg` was already
      stopped so 5432 was free; brought up the template compose, generated +
      ran the migration, seeded 3 rows, and verified reads through Drizzle.
      Added `pnpm db:check` (`scripts/db-smoke-check.ts`) as a reusable
      read-only sanity check of the full DATABASE_URL → pool → Drizzle path.
      Endpoints exercised live (POST/GET/PATCH/DELETE/400/404 all correct).
- [ ] **Make the template compose safe-to-copy** — `docker-compose.yml` hardcodes
      `container_name: next-template-postgres` (a global name) and volume
      `postgres_data`. Two scaffolded apps using these verbatim cannot run at once.
      Parameterise or drop the hardcoded container name and scope the volume name
      per-project before this gets copied widely.

## Decisions made

- **API write-path seam**: reads → GET routes; UI writes → server actions; external
  writes (webhook/cron/3rd-party) → routes. Both write paths share one Zod schema.
  Full-CRUD REST route kept at `app/api/example-items/` as a reference, not the default.
- **Example data**: table `example_items` / route `example-items` — named to be
  obviously demo data (replaced the original `users` test route).

- **Drizzle is the committed ORM** (not optional). Base uses the `pg` /
  `node-postgres` driver so the same `db.ts` serves local Docker in dev and
  Neon in prod — only `DATABASE_URL` changes. `neon-http` (edge/serverless)
  stays a per-project opt-in, documented later. Standardized on `DATABASE_URL`
  (Drizzle/Neon/Vercel convention) over the old `DB_URL`.

### OTHER...

- Docs site + README Structure
- Drizzle + Postgres (local docker & Neon)
- Docker
- Dev Container
- Full docs and deep dive write up on all tech and tools in `/docs`/
- Gtihub CI/CD
- Tidy AGENTS.md up (needs trimmign and refning), mke sure to emtion not verbosity in docs, good wuality notes on the why not jsut the how
- Think about testing hooks and checking if api routes they call get removed (had that issue before where i deleted an api route but it never got flagged even though the hook was using it)
