# AGENTS instructions

## Philosophy

We write clean, coherent, and simple code. Nothing clever or fancy — if it's
hard to read it's wrong.

We respect the codebase but don't over-engineer it. Remember that code is
simply a vehicle to get to the outcome — but we'd rather drive there in a
Ferrari than an old banger.

Move fast but always aim to keep things maintainable and scalable. When in
doubt, boring is better. Simplicity is king!

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
- Props typed as a named type above the component, never inline
- Default to `type` for all type declarations. Reach for `interface` only when
  you need declaration merging (augmenting a third-party module or global) or an
  `extends` contract. `type` is strictly more capable (unions, intersections,
  mapped/conditional types) and keeps shapes uniform — no switching from
  `interface` to `type` the day a shape needs a union.
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

- `feat:` `fix:` `refactor:` `chore:` `docs:` `BREAKING CHANGE:`

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
easier?" If yes, write it. We don't chase coverage metrics — we test what matters.

**What earns a test (test behaviour, not appearance):**

- **Pure logic** — functions, stores, validation, reducers. _Always test._ This
  is where bugs hide and tests are cheap and stable (`utils/`, `store/`,
  `validation/`).
- **Components with branches, state, or effects** — conditional rendering,
  timers, event handlers, anything that makes a _decision_. _Test the decision_
  (e.g. "selecting Dark calls `setTheme('dark')`", "the moon icon shows in dark
  mode"), not the surrounding markup. See `components/common/theme-toggle` for
  the reference shape.
- **Pure presentational components** — take props, render markup, no branching.
  _Do not test._ Asserting "the markup rendered" tests that React works; it
  catches no bugs and breaks on every cosmetic change. In this repo that means
  `error`, `page-not-found`, `toast`, `auth` get no unit test.

The one-line filter: **if you can break it by changing a branch, a prop's
effect, a timer, or state, test that; if the only thing to assert is that markup
rendered, skip it.**

**TDD where it pays off** — small isolated methods with a clear contract (pure functions, utilities, well-defined logic) get written test-first. Larger integration work doesn't — the spec is still being discovered and tests written against a moving API end up brittle.

**Co-location** — tests live next to the code they test, never in a separate
top-level folder. Use a `__tests__/` subfolder within the relevant directory,
mirroring the directory's files (this holds whether the directory contains flat
files like `utils/` or flat components like `components/common/`). e2e tests are
the exception — these live in `e2e-tests/tests/` at project root.

**Test-only exports** — grouped under a single `_forTests` export at the bottom
of the file. Never export internals individually. Never import `_forTests`
outside of `__tests__/` files.

## Quick Reference

| Type      | Location                                        |
| --------- | ----------------------------------------------- |
| Component | `components/common/__tests__/` (or `features/`) |
| Hook      | `hooks/__tests__/`                              |
| Class     | `classes/services/my-domain/__tests__/`         |
| Utility   | `utils/__tests__/`                              |
| e2e       | `e2e-tests/tests/` (project root)               |

A component's test lives in the `__tests__/` folder of the directory the
component file sits in — `components/common/auth.tsx` →
`components/common/__tests__/auth.test.tsx`. A flat component file does **not**
get its own folder just to hold a test (see Naming Rules → Components); the
shared `__tests__/` mirrors the directory, exactly like `utils/` and `store/`.

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

**Server Layer (`classes/`)** — The home for **all class definitions**, grouped
by role so there is one obvious place to look. Three buckets:

- `classes/services/<domain>/` — business logic and third-party integrations
  (HubSpot, Slack, `example-item`). **Server-only** — this is where the
  server-only guarantee actually lives. One subfolder per domain.
- `classes/errors/` — universal error types (e.g. `ApplicationError`). **Not**
  server-only: thrown from both server and client, so no `server-only` import.
- `classes/loggers/` — cross-cutting logger classes.

The server-only invariant is scoped to `services/`, not the whole folder —
`errors/` and `loggers/` are cross-cutting infra that the client may touch.

**API Layer (`app/api/`)** — Next.js route handlers only. All business logic
lives in `classes/`, not here; handlers validate input, call a service, and
shape the response. See **Read vs write paths** below for which mutations
belong here versus in `actions/`.

**Client Layer (`hooks/`, `components/`, `store/`)** — `hooks/` wraps SWR for
all data fetching, providing declarative interfaces with built-in loading/error
states. `store/` manages client state via Zustand. `components/` are purely
presentational.

**The `app/` boundary** — `app/` holds **only Next.js file-convention files**:
`page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx`, `loading.tsx`,
`route.ts`, plus `globals.css` and `favicon.ico`. These are reserved filenames
the router discovers by location, so they _must_ live here. Keep them **thin**
— a route file resolves params/wires the framework and delegates to a real
component in `components/` (e.g. `app/error.tsx` renders
`components/common/error`, `app/page.tsx` renders a feature component). Our own
components — even app-shell ones like the client root layout — never live loose
in `app/`; they belong in `components/` and are imported via `@/`.

## Patterns

### Service instantiation

Default to a **singleton** for service classes — third-party API clients
(HubSpot, Slack, BambooHR), loggers, and any stateless, app-lifetime collaborator.
These hold only config (base URL, API key, transports) that is identical for the
whole app and cannot be corrupted by one request for the next, so one instance
for the app's life is correct.

Reach for a **factory or per-request instance** only when the object carries
state that belongs to a single request — per-user/per-tenant auth (e.g. a Slack
client built from the signed-in user's OAuth token, not an app-wide token),
request/session context that must not leak between users, or a seam a test needs
to swap. App-level token → singleton. Per-user token → per-request via factory.

A factory is not an alternative to a singleton; it is how you build a
non-singleton when the rule above demands one. Do not add a DI container to
projects that do not need one.

### Singleton style

Default to the **eager** form — `export const x = new X()`. It is the right
choice when construction is trivial and side-effect-free; the `getInstance()`
ceremony would be pure noise.

Use the **lazy** form — `private constructor` + `static getInstance()` — only
when construction has side effects you must defer past import time (filesystem,
network, env reads) or you genuinely need lazy initialisation. The
`ApplicationLogger` uses this because its constructor creates `.logs/` file
transports; `QueryLogger` uses the eager form because its constructor does
nothing.

### Domain Driven Design

The three-layer split already captures the valuable 80% — logic out of handlers,
domain in `classes/`, validation at boundaries. Heavier DDD machinery
(aggregates, value objects, repositories, domain events) stays **opt-in per
project**, reached for only when a domain earns it. Do not bake it into the base.

### Integration class shape

Every third-party integration class shares one shape so an agent can scaffold a
new one by pattern-matching:

- lives in `classes/services/<domain>/`, server-only
- takes its config/secret through one constructor
- exposes only domain methods (`getContact`, `postMessage`) — never leaks the
  raw HTTP client
- throws a typed error on failure

### Read vs write paths

The default split for the data API:

- **Reads** → `GET` route handlers in `app/api/`.
- **Writes from our own UI** → Server Actions in `actions/` (`*-actions.ts`).
- **Writes from an external caller** (webhook, cron, third-party, non-browser
  client) → a route handler, validated with the **same Zod schema** the action
  uses, so the two write surfaces cannot drift.

A full-CRUD REST route (`GET`/`POST`/`PATCH`/`DELETE`) is provided at
`app/api/example-items/` as a learning reference — it is **not** the default;
use the read-route + write-action split unless an external caller forces the
REST write path. See `src/app/README.md` for the worked example.

### Input validation

Input validation schemas live in `src/validation/`, one file per domain
(`validation/example-item.ts`, `validation/invoice.ts`), mirroring how
`classes/` is organised. They parse untrusted input at the boundary, so they
belong here — not in `db/`, which only ever sees already-validated objects. The
route and the action for a domain share the **same** schema, so the read and
write surfaces cannot validate differently. Name the folder for what it is
(validation), never for the library (`zod-*`).

## Data Fetching

SWR is used for all client-side data fetching. Never use useEffect for fetching.
Hooks wrap SWR and live in `hooks/`. Each hook handles its own loading and error
state and exposes a clean interface to components.

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
classes/ # all classes grouped by role
services/ # business logic + integrations, server-only, one folder per domain
errors/ # universal error types, not server-only
loggers/ # cross-cutting logger classes
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

**Components** — name the file for the component: a single-file component is a
flat `kebab-name.tsx` (e.g. `components/common/auth.tsx`), imported as
`@/components/common/auth`. Do **not** wrap a lone component in a
folder+`index.tsx` — that is the "fold a single file" anti-pattern above, and it
fills the editor with indistinguishable `index.tsx` tabs. Promote to a
kebab-cased **folder** only once the component grows parts (sub-components in a
nested `components/`, a split `types/`, helpers); then `index.tsx` becomes the
entry barrel that curates the public surface. Same "earn the folder" threshold
as utilities and types. Component types are inline by default; extract to a
sibling `types.ts` (or a `types/` folder once split) per the Types section.

**Utility modules** — single `index.ts` until the file exceeds ~200 lines or
~3 distinct concerns, or its functions have grown dedicated test files. Count
concerns, not functions — three functions serving one cohesive concern (e.g.
HTTP response shaping) stay together; three unrelated utilities (math, error
formatting, class merging) are three concerns. Then split into kebab-named
per-function files along meaningful seams (not one-file-per-export). After splitting, `index.ts` becomes the folder's barrel
(see Barrel Exports) — consumers import from the folder, internal siblings
import directly.

**Hooks** — one file per hook, named `use-*.ts`.

**Stores** — one file per domain (e.g. `domain-store.ts`). Co-locate types
unless shared, in which case pull up to `types/`. Split the type into a data
shape and an actions shape, then intersect them — `type FooState` (data only),
`type FooActions` (behaviours only), `type FooStore = FooState & FooActions`.
Derive the `defaultFooState` from the state shape alone so defaults can't drift
from the fields they back. Use `type` throughout, never `interface` (no
declaration merging is needed here). Co-located types are the default even when
there are several — only break that for a store large enough (~200 lines, per
the utility-module threshold) that the types earn their own sibling file, or
when a type is genuinely shared (then it goes to `src/types/`, not a per-store
types file). See `src/store/counter-store.ts` for the reference shape.

**Variables** — full descriptive names, never abbreviated.

## Types

Two axes decide where a type lives: **scope** (who consumes it) and **size**
(how big it has grown). Scope sets the default home; size can override it.

**By scope:**

- **Used only by this component** → declare it **inline** at the top of the
  component file. No separate file, no ceremony.
- **Shared by 2+ siblings in the same feature/folder** → pull it up one level
  to a `types.ts` at that **feature boundary** (e.g.
  `components/features/dashboard/types.ts`). Still co-located, never duplicated.
- **Shared across unrelated features or layers** (a component _and_ a service
  _and_ a hook) → `src/types/`. Smell test: _would this type still make sense
  if I deleted the component?_ If yes (a domain concept like `User`,
  `Invoice`), it is global; if no (`ButtonProps`), it stays co-located.

**By size (overrides "inline"):** a single-consumer type stays inline until it
crosses a complexity threshold, then it moves to a sibling `types.ts` _even
though nothing else consumes it_ — so a component file never becomes majority
type declarations. Extract when **any** of:

- the file has **~3+ type declarations**, or
- a single type is **large** (>15–20 lines, nested/discriminated unions), or
- the inline types are visually drowning the component logic.

**File vs folder:** a single types file is a flat sibling `types.ts` — never a
`types/` folder wrapping one `index.ts` (that ceremony is forbidden under
Naming Rules). Promote to a `types/` **folder** only when the types themselves
split into multiple files (`types/props.ts`, `types/api.ts`), the same
threshold that splits a utility module.

Store types follow the same logic but are co-located in the store file by
default (see Naming Rules → Stores); pull up to `src/types/` only when shared.

## Barrel Exports

Use barrels only at meaningful domain or feature boundaries — never at the
top level of `components/`, `hooks/`, or `store/`.

✅ Feature level: `components/features/dashboard/index.ts`

- ✅ Domain level: `classes/services/payments/index.ts`
- ✅ Split utility/domain folder: `billing-utils/index.ts` (see Naming Rules → Utility modules)
- ❌ Never: `components/index.ts`, `hooks/index.ts`
- ❌ Never mix server and client exports in the same barrel
- ❌ Never import the barrel from a sibling file in the same folder
- Direct imports preferred for `ui/` components

## Documentation

All code documented with TSDoc. Keep it lean — focus on the _why_, not the
_what_. Contextual knowledge ("this exists because…") beats mechanical
description ("this function does X"). No verbose prose or pointless waffle.

**Methods** document purpose, business context, `@param`, and `@returns`.

**Components** follow one canonical shape — a one-line _what_, a sentence or two
of _why it exists / when to use it_, `@param` notes for any **non-obvious**
props, and one `@example`:

````tsx
/**
 * One line: what it is.
 * Why it exists / when to reach for it (the contextual bit).
 *
 * @param subtitle - Only NON-obvious props need a note; skip the self-evident.
 * @example
 * ```tsx
 * <Auth type='sign-in' />
 * ```
 */
export function Auth({ type, subtitle }: AuthProps) { ... }
````

**Never re-list props as a prose/markdown block** (`**Props:** - x: ...`). The
type is the single source of truth; a hand-maintained prose copy duplicates it
and rots the moment a prop changes. Use `@param` for the few props that need a
_why_, and let the type speak for the rest. Do not over-document types.

### Documentation Site

Full developer handbook lives in `docs/` powered by Fumadocs. Covers setup,
architecture, stack deep dives, conventions, and decisions. Every significant
technical decision gets an ADR in `decisions/`.

`/llms-full.txt` is auto-generated by Fumadocs — agents and LLMs should fetch
this for full project context before starting any significant task.

Keep README.md and agents.md lean — they reference the docs site for detail.
README covers what the project is and how to run it. agents.md covers rules only.

## Quick Reference

| Concern          | Location                              | Convention                                   |
| ---------------- | ------------------------------------- | -------------------------------------------- |
| Business logic   | `classes/services/`                   | Domain subdirectories, server-only           |
| Errors / loggers | `classes/errors/`, `classes/loggers/` | Cross-cutting classes, not server-only       |
| Route handlers   | `app/api/`                            | Reads (GET) + external writes; Zod-validated |
| Mutations        | `actions/`                            | UI writes, `*-actions.ts`, shared Zod schema |
| Validation       | `validation/`                         | Zod schemas, one file per domain             |
| UI               | `components/`                         | ui / common / features split                 |
| Data fetching    | `hooks/`                              | SWR hooks, never useEffect for fetching      |
| State management | `store/`                              | Zustand, co-located types                    |
| Shared types     | `types/`                              | Pull up when shared across siblings          |
| Third party libs | `lib/`                                | Instantiation and config only                |
| Constants        | `config/constants/`                   | App-wide constants                           |
| Scripts          | `scripts/` (root)                     | DB seeding, outside Next.js context          |
