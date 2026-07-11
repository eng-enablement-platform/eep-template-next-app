# Contributing

Thanks for contributing back to the template! Just a few simple things
for guidance.

## Branches

```
<type>/<issue-number>-<brief-description>

feat/EEP-123-user-invitations
fix/EEP-456-session-expiry
```

- `feat/` - new features
- `fix/` - bug fixes
- Ad-hoc (no issue): `fix/<brief-description>` is fine for small isolated fixes

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/). Every
message starts with one of:

```
feat:      new feature
fix:       bug fix
refactor:  neither fixes a bug nor adds a feature
chore:     tooling, dependencies, config
docs:      documentation only
BREAKING CHANGE: incompatible API change
```

## Pull requests

- **Fill out the PR template.** GitHub pre-fills it from
  `.github/pull_request_template.md` - describe the problem, the solution, how
  to verify, and any AI/agent assistance used.
- **Self-review before publishing.** Resolve conflicts, confirm nothing's
  broken, and check the change actually works.
- **Keep it small and in scope.** Don't bundle unrelated work or touch code
  outside the task. If you must, say so in the description. For large changes,
  stack PRs rather than opening one giant diff.
- **Stay on it after it's up.** Once threads are resolved and approvals are in,
  merge promptly.

## Pre-commit hook

Heads up, the hook is intentionally aggressive - a full `tsc --noEmit`, test suite, and
build run on every commit touching `.ts`/`.tsx` or config. This is the guardrail
that keeps the codebase (and agentic workflows) from quietly drifting.

For intentional WIP or a TDD red phase only:

```bash
SKIP_CHECKS=1 git commit -m "wip: rough sketch"
```

Lint, Trivy, and style still run even with `SKIP_CHECKS=1`. Never use it to
bypass failing tests on shippable code.
