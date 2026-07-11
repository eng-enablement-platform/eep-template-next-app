<p align="center">
  <img src="public/eep-logo-full.svg" alt="EEP" width="360" />
</p>

<h1 align="center">Next.js Template</h1>

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

**Full docs live at [docs.example.com](https://docs.example.com).** This README
covers just enough to get running - everything else (architecture, conventions,
deployment, deep dives) is in the docs.

## Prerequisites

| Tool     | Version | Install                                   |
| -------- | ------- | ----------------------------------------- |
| Node.js  | ≥ 24    | `nvm install && nvm use` (reads `.nvmrc`) |
| pnpm     | ≥ 10    | `npm install -g pnpm`                     |
| Docker   | any     | Docker Desktop or Rancher Desktop         |
| Trivy    | any     | `brew install trivy` (pre-commit scan)    |
| Gitleaks | any     | `brew install gitleaks` (pre-commit scan) |

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
