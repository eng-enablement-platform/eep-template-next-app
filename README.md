# EEP Next.js Template

A production-grade Next.js scaffold built on [Engineering Enablement Platform
(EEP)](https://github.com/your-org/eep) principles. Ships full - authentication,
database, API docs, logging, and conventions all wired and demonstrated - so you
can strip what you don't need rather than bolt on what you do.

## Architecture

Three strict layers — Client (`components/`, `hooks/`, `store/`), API (`app/api/`, `actions/`), and Server (`classes/`) — with Zod schemas as the shared validation surface between them. Auth is handled externally by Clerk; the database is Postgres via Drizzle ORM (Docker locally, Neon in production).

See the [Architecture docs](http://localhost:3001/docs/architecture) for the full diagram and layer breakdown.

## Prerequisites

- Node.js ≥ 24 (see `.nvmrc`)
- [pnpm](https://pnpm.io) ≥ 10
- Docker (for local Postgres) - [Docker Desktop](https://www.docker.com/products/docker-desktop/) or [Rancher Desktop](https://rancherdesktop.io/) both work

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
| `pnpm dev`      | App only - `http://localhost:3000`     |
| `pnpm dev:docs` | Docs only - `http://localhost:3001`    |
| `pnpm dev:all`  | Both concurrently, colour-coded output |

```bash
# Most common - just the app
pnpm dev

# Full environment - app + docs side-by-side
pnpm dev:all

# Docs site only (e.g. writing content without the app overhead)
pnpm dev:docs
```

> The docs site is a separate Fumadocs workspace (`docs/`). It runs its own
> Next.js process and does not share the app's env vars or database.

> **Docs site Turbopack errors / read-only filesystem in devcontainer:** If the
> docs dev server spams `Read-only file system` errors or Turbopack panics in a
> loop, it means `docs/.next/` was built on the host machine and then mounted
> into the container where the `vscode` user can't write to it. Fix:
>
> ```bash
> rm -rf docs/.next && pnpm dev:docs
> ```
>
> This is a one-time issue - once `.next` is rebuilt inside the container it
> stays writable across restarts.

## Local database

Local dev runs Postgres in Docker; production points the same driver at a hosted
provider (e.g. Neon) by changing only `DATABASE_URL`.

```bash
docker compose up -d     # start Postgres on :5432
docker compose down      # stop (keeps data volume)
docker compose down -v   # stop and wipe data
pnpm db:generate         # generate SQL migration from src/db/schema.ts
pnpm db:migrate          # apply migrations (idempotent - safe to re-run)
pnpm db:seed             # reset example_items to 3 fixed demo rows
pnpm db:check            # read-only sanity check of the full data path
```

> **Port conflict:** if Postgres is already running elsewhere on `:5432` (e.g. a
> standalone container or another project), `docker compose up -d` will fail.
> Note that `docker compose down` only stops containers it started itself - if
> the container was started from a different directory or session it won't touch
> it. To stop it directly:
>
> ```bash
> # Find what's running
> docker ps
>
> # Stop by name (this repo's container is called next-template-postgres)
> docker stop next-template-postgres && docker rm next-template-postgres
>
> # Or stop anything bound to :5432 regardless of name
> docker stop $(docker ps -q --filter "publish=5432")
> ```

`pnpm db:check` (`scripts/db-smoke-check.ts`) is a fast, mutation-free probe of
the full `DATABASE_URL → pg.Pool → Drizzle → example_items` path - useful after
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
# Terminal 1 - leave running
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

- **Interactive UI:** http://localhost:3000/api-docs - live "Try it out" console
- **Raw spec (JSON):** http://localhost:3000/api/openapi - for Postman, codegen, SDK builders

Requires the **Admin role** - others receive a 403. See Authentication below.

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
lightweight checks (redirects, session-claim reads) - heavier auth belongs in
route handlers or the DAL.

### The publishable key is a build-time value

`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is inlined into the client bundle at
`next build`, not read at runtime. Fine on Vercel (each env builds separately).
Breaks if you build one Docker image and promote it across envs - the runtime
value never reaches the bundle. Fix: serve the key from a server route and mount
`<ClerkProvider publishableKey={...}>` once it resolves. This template defaults
to the Vercel path.

### Granting Admin access

Admin-only routes (`/admin/*`, `/api-docs/*`) are gated in `src/proxy.ts` via
`sessionClaims.metadata.role`. Two steps required - missing either gives a
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
403, the claim is missing from the JWT - step 2 wasn't applied, or the session
is stale.

## Regenerating the diagram

The architecture diagram (`diagrams/architecture.png`) is generated from Python
code using the [Diagrams](https://diagrams.mingrammer.com/) library and
[Graphviz](https://graphviz.org/). The PNG is committed so you never need Python
just to view it - only to regenerate it after changes.

### Prerequisites

```bash
brew install graphviz   # macOS - Graphviz must be on PATH for Diagrams to render
```

Python deps are managed with [uv](https://docs.astral.sh/uv/) (faster, safer
alternative to pip+venv). Install it once:

```bash
brew install uv         # macOS
# or
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Regenerate

```bash
cd diagrams
uv run python main.py   # outputs architecture.png in diagrams/
```

`uv run` automatically creates an isolated virtualenv and installs deps from
`pyproject.toml` on first run - no manual `pip install` needed.

### How the icons work

The diagram uses two icon sources:

**Real logos** (React, Next.js, Vercel, Docker) come from the `diagrams` library's
built-in node catalogue - these just work out of the box.

**Custom icons** use `diagrams.custom.Custom`, which takes any PNG file. We pull
icons from two sources:

- **[Material Icon Theme](https://github.com/PKief/vscode-material-icon-theme)** -
  the same icon set used in VS Code. SVGs are fetched from the GitHub repo at
  `icons/folder-*.svg` and converted to PNG via `cairosvg`. This gives folder
  nodes the exact icons you'd see in the VS Code sidebar for `hooks/`, `store/`,
  `api/`, etc.
- **[Simple Icons](https://simpleicons.org/)** - brand SVGs for services not in
  the diagrams library (Clerk, Neon). Fetched from `cdn.simpleicons.org` and
  composited onto an appropriate background colour before converting to PNG.

Generated PNGs land in `diagrams/icons/material-png/` (gitignored - they're
reproducible). The `main.py` script regenerates any missing icons automatically
on each run via Pillow, so a fresh clone only needs Graphviz + uv installed.

## Deploy

The simplest deployment target is [Vercel](https://vercel.com/new). Set the same
env vars from `.env.local` in the Vercel project settings and deploy from `main`.

For other targets, note the `NEXT_PUBLIC_*` build-time caveat above.

## Dev Containers

The repo ships a [Dev Container](https://code.visualstudio.com/docs/devcontainers/containers) for a zero-setup environment - clone, open in VS Code or Cursor, and everything is ready to go. No manual Node, pnpm, Python, or database setup required.

### Prerequisites

You need a Docker-compatible runtime. Either works:

- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** - the standard option
- **[Rancher Desktop](https://rancherdesktop.io/)** - free alternative (use the `dockerd (moby)` container engine)

Make sure whichever you choose is running before opening the container.

### What it spins up

The devcontainer uses Docker Compose under the hood - it starts two services side-by-side:

| Service      | What it is                                             | Port   |
| ------------ | ------------------------------------------------------ | ------ |
| **app**      | Your dev environment (Node 24, pnpm, Python 3.14, Zsh) | -      |
| **postgres** | Postgres 17 (matches `docker-compose.yml`)             | `5432` |

Inside the `app` container you get:

- **Node 24** + **pnpm** (matches `.nvmrc` and `engines` field)
- **Python 3.14** + **uv** + **Graphviz** - ready to regenerate the architecture diagram (`cd diagrams && uv run python main.py`)
- **Zsh** + Oh My Zsh with autosuggestions, syntax highlighting, and history substring search
- **VS Code extensions** pre-installed: ESLint, Prettier, Tailwind CSS IntelliSense, Playwright, Vitest, GitLens, Python/Ruff, Material Icon Theme, Error Lens
- **`pnpm install`** already run - deps are ready immediately
- **`DATABASE_URL`** auto-wired to the Postgres service (no manual change needed)
- **`.env.local`** auto-sourced in your terminal on start (Clerk keys and other vars picked up automatically once the file exists)

### Setup

1. Make sure Docker Desktop or Rancher Desktop is running
2. Open the repo in VS Code or Cursor
3. Open the Command Palette (`Cmd+Shift+P`) → **Dev Containers: Reopen in Container**
4. Wait for the build (first time only - subsequent opens are instant)
5. Copy `.env.local_template` → `.env.local` and fill in your Clerk keys
6. Run migrations (idempotent - safe to re-run, skips already-applied ones):

```bash
pnpm db:migrate
```

Optionally seed demo data (resets `example_items` to 3 fixed rows - skip if you already have data you want to keep):

```bash
pnpm db:seed
```

7. Start the dev server:

```bash
pnpm dev        # app on :3000
pnpm dev:all    # app + docs on :3000 and :3001
```

> **Note:** After changing `.devcontainer/devcontainer.json`, run **Dev Containers: Rebuild Container** from the Command Palette to pick up the changes.

> **Full docs:** The dev container setup is covered in depth in the docs site (`pnpm dev:docs`), including architecture decisions, troubleshooting common issues (Rancher Desktop quirks, sudo behaviour, port conflicts), and how to extend the environment.

## OTHER THINGS (scratch notes - not done)

- Think about testing hooks and checking if api routes they call get removed (had that issue before where i deleted an api route but it never got flagged even though the hook was using it)
- add https://storybook.js.org/ or https://ladle.dev/docs/setup
- ~~diagrams library~~ ✅
- dev containers
- base components + design system (optional strip-out)
- AGENTS.md refinement
- docs content (EEP philosophy, architecture, decisions per layer)
