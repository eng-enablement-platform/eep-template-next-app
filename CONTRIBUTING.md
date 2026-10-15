# Contributing

Thanks for contributing back to the template! Just a few simple things
for guidance.

Clone it:

```bash
git clone https://github.com/eng-enablement-platform/eep-template-next-app.git
```

> [!NOTE]
> The `.eep/` folder tells the [create-eep](https://github.com/eng-enablement-platform/create-eep) CLI how to turn the template into a project
> (starter README, optional extras etc.). If you add or rename something it
> references - e.g. a `docs` script or the `diagrams/` folder, update
> `.eep/template.json` too.

## Branches

```
<type>/<issue-number>-<brief-description>

feat/EEP-123-user-invitations
fix/EEP-456-session-expiry
```

- `feat/` - new features
- `fix/` - bug fixes
- `docs/` - documentation-only changes
- `chore/` - tooling, dependencies, config
- Ad-hoc (no issue): `fix/<brief-description>` is fine for small isolated fixes

The branch prefix mirrors the [commit type](#commits) - use `docs/` for a
docs-only change, `chore/` for a dependency bump, and so on.

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

## Releases

Template releases are automated with [release-please](https://github.com/googleapis/release-please) - never edit `CHANGELOG.md` or `version.txt` by hand.

1. Merge PRs to `main` with conventional commits - `fix:` means a patch release, `feat:` a minor one, and `docs:` / `chore:` / `ci:` / `test:` don't trigger a release.
2. release-please keeps a single **Release PR** open with the next version and changelog, updating it on every merge.
3. Merge the Release PR to release: it tags the commit (`vX.Y.Z`) and creates a GitHub Release.
