<p align="center">
  <img src="public/eep-logo-full.svg" alt="EEP" width="360" />
</p>

<h1 align="center">
  <img src="public/nextjs-mark.svg" alt="" width="48" valign="middle" />
  &nbsp;Next.js Template
</h1>

<p align="center">
  <a href="https://github.com/eng-enablement-platform/eep-template-next-app/actions/workflows/ci.yml">
    <img src="https://github.com/eng-enablement-platform/eep-template-next-app/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://renovateapp.com">
    <img src="https://img.shields.io/badge/renovate-enabled-brightgreen?logo=renovatebot" alt="Renovate enabled" />
  </a>
  <a href="https://github.com/gitleaks/gitleaks">
    <img src="https://img.shields.io/badge/protected_by-gitleaks-blue" alt="Protected by gitleaks" />
  </a>
  <a href="https://aquasecurity.github.io/trivy/">
    <img src="https://img.shields.io/badge/security-trivy-1904DA" alt="Trivy security scan" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT" />
  </a>
</p>

A production-grade Next.js scaffold built on [Engineering Enablement Platform
(EEP)](https://github.com/eng-enablement-platform) principles. Ships full -
authentication, database, API docs, logging, and conventions all wired and
demonstrated - so you can strip what you don't need rather than bolt on what
you do.

- **Live site:** [eep-next-template.dev](https://eep-next-template.dev/) - Feel
  free to try signing in if you like, though you will be blocked by the role gate.

- **Docs site:** [docs.eep-next-template.dev](https://docs.eep-next-template.dev/docs) - This README covers just enough to get running - everything else (architecture, conventions,
  deployment, deep dives) is in the docs (also available via `/docs` in the template)

## Using this template

Two ways to start your own project from this template:

- **CLI (recommended)** - scaffold and re-purpose interactively. _Coming soon -
  the CLI is built from this template and will handle cloning, renaming, and
  stripping the parts you don't need._
- **Manual clone** - clone and make it your own by hand (below).

### Manual clone

```bash
git clone https://github.com/eng-enablement-platform/eep-template-next-app.git my-app
cd my-app
rm -rf .git && git init        # start a fresh history that's yours
```

From here, follow the [Quick start](#quick-start) below. Strip the demo
features you don't need (counter, posts, example items) and keep the wiring you
do - see the [docs](https://docs.eep-next-template.dev) for the architecture and
conventions.

## Prerequisites

| Tool     | Version | Install                                   |
| -------- | ------- | ----------------------------------------- |
| Node.js  | ≥ 24    | `nvm install && nvm use` (reads `.nvmrc`) |
| pnpm     | ≥ 10    | `npm install -g pnpm`                     |
| Docker   | any     | Docker Desktop or Rancher Desktop         |
| Trivy    | any     | `brew install trivy` (pre-commit scan)    |
| Gitleaks | any     | `brew install gitleaks` (pre-commit scan) |

You'll also need a [Clerk](https://clerk.com) account for authentication keys.
For deployment you'll need a [Neon](https://neon.tech) account for the Postgres
database - locally, Docker handles the DB so no Neon account is needed for dev.

## Quick start

```bash
pnpm install                         # install dependencies
cp .env.local_template .env.local    # add your secrets (Clerk keys)
docker compose up -d                 # start the database
pnpm db:migrate                      # run migrations
pnpm dev                             # http://localhost:3000
```

See [Local Setup](https://docs.example.com/docs/dev-environment/local-setup)
for environment variables, database seeding, and the full command reference.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
