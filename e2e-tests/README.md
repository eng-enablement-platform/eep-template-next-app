# E2E Tests

Playwright + Chromium against the local dev server. Standard Playwright
layout — tests live under `tests/`, config in `playwright.config.ts`,
no extra scaffolding until something actually needs it.

## First-time setup

```bash
pnpm install
pnpm exec playwright install chromium
```

## Scripts

| Command            | What it does                                              |
| ------------------ | --------------------------------------------------------- |
| `pnpm e2e`         | Run the suite headless                                    |
| `pnpm e2e:ui`      | Open the visual debugger UI (best for authoring)          |
| `pnpm e2e:codegen` | Record a new test by clicking through the app             |
| `pnpm e2e:report`  | Open the HTML report from the last run                    |
| `pnpm e2e:debug`   | Run with the Playwright Inspector attached (step-through) |

Playwright will auto-start `pnpm dev` if nothing is listening on `:3000`;
otherwise it reuses what's already running. Leaving `pnpm dev` warm in a
second terminal makes subsequent runs noticeably faster.

## Troubleshooting

Seeing `Process from config.webServer exited early`, a 60s/180s webServer
timeout, or `next-server` / `kernel_task` pegging your CPU? There's a full
postmortem + diagnostic checklist in the [root README's Troubleshooting
section](../README.md#troubleshooting). TL;DR: the spike is almost always
the cold compile of `/` in `next dev`, not Playwright — let it complete
once, and leave `pnpm dev` warm in another terminal between runs.

## When the suite grows

Add scaffolding lazily, not up front:

- **Page Objects** — create `page-objects/` and one file per page when
  selectors start repeating across tests.
- **Fixtures** — create `fixtures/` when you need a custom `test` that
  layers on auth state, seeded data, or shared setup.
- **Helpers** — create `helpers/` for non-UI utilities (test-data
  factories, custom assertions). Page interactions belong in page objects.
- **Global setup/teardown** — wire `globalSetup` / `globalTeardown` into
  the config when you have cross-suite bootstrap (e.g. Clerk auth
  storageState via `@clerk/testing/playwright`).
