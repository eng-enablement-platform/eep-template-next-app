# AGENTS instructions

Rules only. This is how we work - follow it.

## Philosophy

Clean, coherent, simple. Boring beats clever - if it's hard to read it's wrong.
Move fast, stay maintainable. North star: could another dev or agent pick this
up and work confidently without asking anyone?

## Code Standards

- DRY, readable, boring - no clever solutions
- Error handling and edge cases are first-class, not afterthoughts
- Import aliases (`@/`), never relative paths
- `import type` for type-only imports - never mix types and values
- Named `react` imports, never `import * as React` (exception: `components/ui/` shadcn primitives)
- Named exports everywhere - default only where Next.js requires
- Components are function declarations; utilities/callbacks/handlers are arrow functions
- Props typed as a named type above the component, never inline
- `type` by default; `interface` only for declaration merging or `extends`
- No arbitrary dependencies - check native TS/JS first
- Comment the _why_, not the _what_ - only for non-obvious code
- `//` for commentary (never single-line `/* */`); `/** */` TSDoc only directly above the symbol it documents
- TSDoc on all `.ts` files (pre-commit enforced)
- Disabling a lint rule requires a comment saying why
- Tailwind only for styles

## Git

- Branch: `<type>/<ticket>-<desc>` - `feat/`, `fix/` (ad-hoc `fix/<desc>`, no ticket)
- Conventional commits: `feat:` `fix:` `refactor:` `chore:` `docs:` `BREAKING CHANGE:`

## Git Hooks

- **Pre-commit** is the first line of defence: Trivy (on dep changes), ESLint config probe (on `eslint.config.ts`), lint-staged, and on `.ts/.tsx`/config changes the full `tsc --noEmit` + tests + build
- **Escape hatch** `SKIP_CHECKS=1 git commit` - WIP/TDD-red only; lint, Trivy, style still run. Never to bypass failing tests on shippable code
- **CI** runs integration + e2e only

## Testing

Test behaviour, not appearance. Filter: if you can break it by changing a
branch, a prop's effect, a timer, or state - test that; if the only assertion is
"markup rendered" - skip it.

- **Pure logic** (utils, stores, validation, reducers) - always test
- **Components with branches/state/effects** - test the decision, not the markup
- **Pure presentational components** - do not test
- TDD for small isolated units with a clear contract; not for exploratory integration work
- Co-locate tests in a `__tests__/` subfolder mirroring the directory (e2e is the exception - `e2e-tests/tests/`)
- Test-only exports grouped under one `_forTests` export; never import it outside `__tests__/`

| Type      | Location                                        |
| --------- | ----------------------------------------------- |
| Component | `components/common/__tests__/` (or `features/`) |
| Hook      | `hooks/__tests__/`                              |
| Class     | `classes/services/my-domain/__tests__/`         |
| Utility   | `utils/__tests__/`                              |
| e2e       | `e2e-tests/tests/` (project root)               |

## Architecture

Three layers, strictly separated:

- **Server (`classes/`)** - all class definitions, `server-only`. `services/<domain>/` (business logic + integrations), `errors/` (structured error types), `loggers/` (Winston). Client never imports from here.
- **API (`app/api/`)** - route handlers only: validate input, call a service, shape the response. No business logic.
- **Client (`hooks/`, `components/`, `store/`)** - SWR hooks fetch data, Zustand holds state, components are presentational.
- **`app/`** holds only Next.js file-convention files (`page`, `layout`, `error`, `not-found`, `loading`, `route`, `globals.css`). Keep them thin - delegate to a real component in `components/`.

## Patterns

- **Service instantiation** - singleton by default (app-level config/token); factory or per-request only for per-user/per-tenant state
- **Singleton style** - eager `export const x = new X()`; lazy `getInstance()` only when construction has deferred side effects
- **DDD** - three-layer split is enough; heavier machinery is opt-in per project
- **Integration classes** - live in `classes/services/<domain>/`, take config via one constructor, expose only domain methods, throw a typed error
- **Read vs write** - reads → `GET` handlers; UI writes → server actions (`*-actions.ts`); external writes → route handlers, sharing the same Zod schema as the action
- **Validation** - Zod schemas in `src/validation/`, one file per domain, shared by route + action
- **Logging** - `rootLogger` from `classes/loggers/application`; `logSource` = layer (`API`/`ACTION`/`SERVICE`), `scope` = concern; log once at the write boundary, not in the service. Verbosity via `LOG_LEVEL`; DB firehose via `DB_QUERY_LOG=1`

## Data Fetching

SWR for all client fetching. Never `useEffect` for fetching. Hooks wrap SWR in
`hooks/`, each handling its own loading/error state.

## Naming

- **Folders** - kebab-case
- **index.ts** - only for a meaningful grouping/domain; never to wrap a single file
- **Components** - flat `kebab-name.tsx`; promote to a folder + `index.tsx` barrel only once it grows parts
- **Utility modules** - single `index.ts` until ~200 lines or ~3 concerns, then split into kebab-named files with a barrel
- **Hooks** - one file per hook, `use-*.ts`
- **Stores** - one file per domain; split `FooState & FooActions`, derive defaults from state; co-locate types
- **Variables** - full descriptive names, never abbreviated

## Types

Scope sets the home; size can override to a file:

- Single-consumer → inline (unless ~3+ types, one large type, or drowning the logic → sibling `types.ts`)
- Shared by siblings → `types.ts` at the feature boundary
- Shared across features/layers → `src/types/`
- Flat `types.ts` first; promote to a `types/` folder only when it splits into multiple files

## Barrel Exports

Only at domain/feature boundaries. Never `components/index.ts` or `hooks/index.ts`,
never mix server + client exports, never import a barrel from a sibling. Direct
imports for `ui/`.

## Documentation

- TSDoc on all code - lean, the _why_ not the _what_
- Example/reference files open TSDoc with `EXAMPLE <TYPE>` (e.g. `EXAMPLE COMPONENT`) - the only approved form
- Methods/hooks/utilities: purpose, `@param`, `@returns` (enforced), one `@example`
- Components: one-line what, why/when, `@param` for non-obvious props, one `@example`
- Never re-list props as prose - the type is the source of truth

## Quick Reference

| Concern          | Location            | Convention                                   |
| ---------------- | ------------------- | -------------------------------------------- |
| Business logic   | `classes/services/` | Domain subdirectories, server-only           |
| Errors           | `classes/errors/`   | `server-only` - server-side observability    |
| Loggers          | `classes/loggers/`  | `server-only` - Winston, filesystem writes   |
| Route handlers   | `app/api/`          | Reads (GET) + external writes; Zod-validated |
| Mutations        | `actions/`          | UI writes, `*-actions.ts`, shared Zod schema |
| Validation       | `validation/`       | Zod schemas, one file per domain             |
| UI               | `components/`       | ui / common / features split                 |
| Data fetching    | `hooks/`            | SWR hooks, never useEffect for fetching      |
| State management | `store/`            | Zustand, co-located types                    |
| Shared types     | `types/`            | Pull up when shared across siblings          |
| Third party libs | `lib/`              | Instantiation and config only                |
| Constants        | `config/constants/` | App-wide constants                           |
| Scripts          | `scripts/` (root)   | DB seeding, outside Next.js context          |
