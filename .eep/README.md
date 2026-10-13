# {{projectName}}

> Bootstrapped with [create-eep](https://github.com/eng-enablement-platform/create-eep) from the [`{{templateName}}`](https://github.com/eng-enablement-platform/eep-template-next-app) template.

A production-grade Next.js app with authentication, database, API docs, logging and conventions already wired up.

## Prerequisites

| Tool     | Version | Install                                   |
| -------- | ------- | ----------------------------------------- |
| Node.js  | ≥ 24    | `nvm install && nvm use` (reads `.nvmrc`) |
| pnpm     | ≥ 10    | `npm install -g pnpm`                     |
| Docker   | any     | Docker Desktop or Rancher Desktop         |
| Trivy    | any     | `brew install trivy` (pre-commit scan)    |
| Gitleaks | any     | `brew install gitleaks` (pre-commit scan) |

You'll also need a [Clerk](https://clerk.com) account for authentication keys.
Locally, Docker runs the database - a hosted Postgres (e.g. [Neon](https://neon.tech)) is only needed for deployment.

## Quick start

create-eep installs dependencies for you. If you skipped that step (or it failed), run `pnpm install` first.

```bash
cp .env.local_template .env.local    # add your secrets (Clerk keys)
pnpm db:up                           # start the database (POSTGRES_PORT in .env.local)
pnpm db:migrate                      # run migrations
pnpm dev                             # http://localhost:3000
```

## Optional extras

Depending on what you chose when creating the project, you may also have:

- **Docs site** (`docs/`) - a Fumadocs site. Run it with `pnpm dev:docs` (http://localhost:3001), or `pnpm dev:all` for app + docs together.
- **Diagrams-as-code** (`diagrams/`) - Python scripts that generate the architecture diagrams. They describe the template's architecture - rewrite them for your own. create-eep installs their dependencies for you when [uv](https://docs.astral.sh/uv/) is installed (otherwise run `cd diagrams && uv sync`). Regenerate with `cd diagrams && uv run python main.py` (also needs Graphviz).
- **Dev container** (`.devcontainer/`) - a zero-setup environment with everything preinstalled. In VS Code: **Dev Containers: Reopen in Container**.

## Make it yours

- **Git:** create-eep sets up a repository with a first commit for you. If you skipped that step:
  `git init && git add -A && git commit -m "chore: initial commit from create-eep"`
- Strip the demo features you don't need (counter, posts, example items) and keep the wiring you do.
- Architecture, conventions and deep dives: the [template docs](https://docs.eep-next-template.dev/docs).
- Working rules for humans and AI agents - code standards, branch naming and conventional commits: [AGENTS.md](AGENTS.md).
