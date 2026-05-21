# AGENTS instructions

## Philosophy

We write clean, coherent, and simple code. Nothing clever or fancy — if it's
hard to read it's wrong.

We respect the codebase but don't over-engineer it. Remember that code is
simply a vehicle to get to the outcome — but we'd rather drive there in a
Ferrari than an old banger.

Move fast but always aim to keep things maintainable and scalable. When in
doubt, boring is better.

**The north star:** could a developer or an agent pick this up and work
confidently without asking anyone?

## Code Standards

- DRY, readable, boring — avoid clever solutions
- Error handling and edge cases are first class concerns, not afterthoughts
- Use import aliases (`@/`) never relative paths
- Always use `import type` for type-only imports — never mix types and values
  in the same import
- Use named imports from `react` — never `import * as React from 'react'`.
  Namespace imports break tree-shaking and prevent `import type` from working
  cleanly. Exception: shadcn primitives in `src/components/ui/` are vendored
  and may keep their upstream namespace imports.
- Named exports everywhere — default exports only where Next.js requires
- Components declared as function declarations, never const arrow functions
- Arrow functions for utilities, callbacks, and inline handlers
- Props typed as a named interface above the component, never inline
- Do not add dependencies arbitrarily — check if native TS/JS can do it first
- Comments required for anything non-obvious — explain the why, not the what
- Multi-line comments must always use /\* \*/ block syntax, never consecutive
  // single-line comments. Single // is fine for single line inline comments only.
- TSDoc on all `.ts` files — pre-commit will enforce this
- If disabling a lint rule, leave a comment explaining why
- Tailwind only for styles, no exceptions

## Git & Branching

Branch format: `<type>/<ticket-number>-<brief-description>`

- `feat/` — new features
- `fix/` — bug fixes
- Ad-hoc: `fix/<brief-description>` (no ticket needed)

Commit messages must follow conventional commits — at least one of:

- `feat:` `fix:` `chore:` `docs:` `BREAKING CHANGE:`

## Git Hooks

**Pre-commit** — full guardrail suite on every commit. Designed to be strict
enough to constrain both human and agentic contributors.

- Trivy security scan (only when `package.json` / `pnpm-lock.yaml` changed) —
  system binary, install with `brew install trivy` (macOS) or see
  [aquasecurity/trivy](https://github.com/aquasecurity/trivy)
- ESLint config probe (only when `eslint.config.ts` changed)
- lint-staged — lint + prettier on staged files only
- On `.ts/.tsx` or config changes: full `tsc --noEmit`, test suite, and build
- On config file changes (`.mjs`, `.cjs`, `next.config.*`): build only
- No relevant changes: skips heavy checks automatically

**Escape hatch** — for intentional WIP or TDD red phase only:
`SKIP_CHECKS=1 git commit -m "..."` — lint, Trivy, and style still run.
Never use this to bypass failing tests on shippable code.

**CI** — integration and e2e tests only. The pre-commit hook is the
first line of defence, not CI.

## Testing & QA

We work in a QA orientated manner — no regressions, no silly bugs, no shortcuts.

Before writing a test ask: "Would this prevent future bugs or make refactoring
easier?" If yes, write it. We don't chase coverage metrics — we test what matters

**Co-location** — tests live next to the code they test, never in a separate
top-level folder. Use a `__tests__/` subfolder within the relevant directory.
e2e tests are the exception — these live in `e2e/` at project root.

**Test-only exports** — grouped under a single `_forTests` export at the bottom
of the file. Never export internals individually. Never import `_forTests`
outside of `__tests__/` files.

## Quick Reference

| Type      | Location                                      |
| --------- | --------------------------------------------- |
| Component | `components/features/my-component/__tests__/` |
| Hook      | `hooks/__tests__/`                            |
| Class     | `classes/my-domain/__tests__/`                |
| Utility   | `utils/__tests__/`                            |
| e2e       | `e2e/` (project root)                         |

<!-- TODO: MOVE THE EXAMPLES TO FUMADOCS -->

## Testing Exports

Test-only exports are grouped under a single `_forTests` named export at the
bottom of the file. Never export internal classes or utilities individually
for test purposes — keep the public API clean.

```typescript
// public API
export const myService = new MyService();

// test-only exports
export const _forTests = { MyService };
```

The `_` prefix signals to developers and agents that this export is not part
of the public API and should never be imported outside of test files.

## Architecture

Three layers, strictly separated:

**Server Layer (`classes/`)** — Business logic and external service interactions.
Server-only. Organised by domain subdirectories.

**API Layer (`app/api/`)** — Next.js route handlers only. GET requests via
RESTful endpoints. All external service logic lives in `classes/`, not here.

**Client Layer (`hooks/`, `components/`, `store/`)** — `hooks/` wraps SWR for
all data fetching, providing declarative interfaces with built-in loading/error
states. `store/` manages client state via Zustand. `components/` are purely
presentational.

## Data Fetching

SWR is used for all client-side data fetching. Never use useEffect for fetching.
Hooks wrap SWR and live in `hooks/`. Each hook handles its own loading and error
state and exposes a clean interface to components.

## Folder Structure

<!-- TODO: Cursor can re-write this once done -->

## Folder Structure

project-root/
docs/ # Fumadocs site — full developer handbook
content/
getting-started/ # setup, running locally, env vars
architecture/ # system design, layers, patterns
stack/ # deep dives on each technology used
conventions/ # coding standards, naming, patterns
decisions/ # ADRs — what was chosen and why
scripts/ # DB seeding and utility scripts, runs outside Next.js
src/
app/ # Next.js routing only — routes, layouts, pages, globals.css
(root)/ # main app routes and layout
api/ # Next.js route handlers only
classes/ # business logic, domain subdirectories, server-only
components/
ui/ # shadcn primitives — never edit
common/ # reusable components shared across features
features/ # feature-specific components
config/
constants/ # app-wide constants
hooks/ # SWR-based data fetching hooks
lib/ # third party instantiation (db, auth, swr config)
utils/ # shared utility functions
store/ # zustand stores
types/ # shared global types only
.env
.eslintrc
package.json
tsconfig.json
env.d.ts # TypeScript env var declarations, must stay at root

## Naming Rules

**Folders** — always kebab-case.

**index.ts / index.tsx** — only use when a folder represents a meaningful
grouping or domain. Do not create a folder + index.ts just to wrap a single
file — name the file directly instead (e.g. `this-class.ts`, `this-component.tsx`).

**Components** — each in its own kebab-cased folder with `index.tsx` as entry
point. Sub-components go in a nested `components/` folder. Component-specific
types go in a `types/` folder alongside the component.

**Utility modules** — single `index.ts` until the file exceeds ~200 lines or
~3 distinct concerns, or its functions have grown dedicated test files. Then
split into kebab-named per-function files along meaningful seams (not
one-file-per-export). After splitting, `index.ts` becomes the folder's barrel
(see Barrel Exports) — consumers import from the folder, internal siblings
import directly.

**Hooks** — one file per hook, named `use-*.ts`.

**Stores** — one file per domain (e.g. `domain-store.ts`). Co-locate types
unless shared, in which case pull up to `types/`.

**Variables** — full descriptive names, never abbreviated.

## Types

Global shared types live in `src/types/`. Component-scoped types live in a
`types/` folder next to the component. Store types are co-located in the store
file unless shared. Pull types up one level when two or more siblings need them
— never duplicate.

## Barrel Exports

Use barrels only at meaningful domain or feature boundaries — never at the
top level of `components/`, `hooks/`, or `store/`.

✅ Feature level: `components/features/dashboard/index.ts`

- ✅ Domain level: `classes/payments/index.ts`
- ✅ Split utility/domain folder: `billing-utils/index.ts` (see Naming Rules → Utility modules)
- ❌ Never: `components/index.ts`, `hooks/index.ts`
- ❌ Never mix server and client exports in the same barrel
- ❌ Never import the barrel from a sibling file in the same folder
- Direct imports preferred for `ui/` components

## Documentation

All code documented with TSDoc. Methods include purpose, business context,
`@param` and `@returns`. Components document props, purpose, and a usage example.

### Documentation Site

Full developer handbook lives in `docs/` powered by Fumadocs. Covers setup,
architecture, stack deep dives, conventions, and decisions. Every significant
technical decision gets an ADR in `decisions/`.

`/llms-full.txt` is auto-generated by Fumadocs — agents and LLMs should fetch
this for full project context before starting any significant task.

Keep README.md and agents.md lean — they reference the docs site for detail.
README covers what the project is and how to run it. agents.md covers rules only.

## Quick Reference

| Concern          | Location            | Convention                              |
| ---------------- | ------------------- | --------------------------------------- |
| Business logic   | `classes/`          | Domain subdirectories, server-only      |
| Route handlers   | `app/api/`          | Next.js route handlers, GET only        |
| Mutations        | `actions/`          | `*-actions.ts` naming                   |
| UI               | `components/`       | ui / common / features split            |
| Data fetching    | `hooks/`            | SWR hooks, never useEffect for fetching |
| State management | `store/`            | Zustand, co-located types               |
| Shared types     | `types/`            | Pull up when shared across siblings     |
| Third party libs | `lib/`              | Instantiation and config only           |
| Constants        | `config/constants/` | App-wide constants                      |
| Scripts          | `scripts/` (root)   | DB seeding, outside Next.js context     |
