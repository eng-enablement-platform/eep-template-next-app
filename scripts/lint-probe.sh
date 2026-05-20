#!/usr/bin/env bash

# Regression test for `eslint.config.ts`. Each probe writes a tiny snippet to
# a sandboxed path, runs ESLint against it, and asserts whether the run
# passes or fails. This guards against three silent-failure modes:
#
#   1. A plugin gets dropped or its rule name changes after an upgrade.
#   2. A `files` / `ignores` glob stops matching what we think it matches.
#   3. Two config blocks fight over the same array-valued rule (the last
#      one wins in flat config — they do NOT merge).
#
# Run manually: `pnpm lint:probe`
# Wired into pre-commit gated on `eslint.config.ts` being staged.

set -uo pipefail

# Sandbox lives under `src/` so files are visible to the tsconfig and the
# typescript-eslint `projectService` doesn't reject them.
SANDBOX="src/__lint_probe__"

passed=0
failed=0
failures=()

cleanup() {
  rm -rf "$SANDBOX"
}
trap cleanup EXIT

# probe <description> <relative path under src/__lint_probe__> <pass|fail> <code>
probe() {
  local description="$1"
  local rel_path="$2"
  local expected="$3"
  local code="$4"

  local file="$SANDBOX/$rel_path"
  mkdir -p "$(dirname "$file")"
  printf '%s' "$code" > "$file"

  local output
  output=$(pnpm --silent eslint "$file" 2>&1)
  local exit_code=$?

  local actual="pass"
  if [ $exit_code -ne 0 ]; then
    actual="fail"
  fi

  if [ "$actual" = "$expected" ]; then
    printf '  \033[32m✓\033[0m %s\n' "$description"
    passed=$((passed + 1))
  else
    printf '  \033[31m✗\033[0m %s\n' "$description"
    printf '      expected=%s actual=%s\n' "$expected" "$actual"
    failures+=("$description")
    failures+=("$output")
    failed=$((failed + 1))
  fi
}

echo "Running ESLint config probes..."
echo ""

probe "import/no-default-export — fails on a normal component" \
  "foo.tsx" "fail" \
  'export default function Foo() { return null; }'

probe "import/no-default-export — exempt for app/**/page.tsx" \
  "app/blog/page.tsx" "pass" \
  'export default function Page() { return null; }'

probe "react/function-component-definition — fails on arrow component" \
  "foo.tsx" "fail" \
  'export const Foo = () => <div />;'

probe "no-restricted-syntax (useState) — fails without explicit type" \
  "foo.tsx" "fail" \
  $'import { useState } from "react";\nexport function Foo() { const [x, setX] = useState(0); return <button onClick={() => setX(x + 1)}>{x}</button>; }'

probe "no-restricted-syntax (useState) — exempt in components/ui/" \
  "components/ui/foo.tsx" "pass" \
  $'import { useState } from "react";\nexport function Foo() { const [x, setX] = useState(0); return <button onClick={() => setX(x + 1)}>{x}</button>; }'

probe "no-restricted-syntax (React namespace) — fails on import * as React" \
  "foo.tsx" "fail" \
  $'import * as React from "react";\nexport function Foo() { return <div>{React.version}</div>; }'

probe "no-restricted-syntax (React namespace) — exempt in components/ui/" \
  "components/ui/foo.tsx" "pass" \
  $'import * as React from "react";\nexport function Foo() { return <div>{React.version}</div>; }'

probe "@stylistic/multiline-comment-style — fails on stacked // comments" \
  "foo.tsx" "fail" \
  $'// line one\n// line two\nexport function Foo() { return null; }'

probe "jsdoc/require-jsdoc — fails on undocumented .ts export" \
  "util.ts" "fail" \
  $'export function double(x: number): number { return x * 2; }'

probe "jsdoc/require-jsdoc — passes with TSDoc on .ts export" \
  "util.ts" "pass" \
  $'/**\n * Doubles a number.\n *\n * @param x - the input value\n * @returns the doubled value\n */\nexport function double(x: number): number { return x * 2; }'

probe "tsdoc/syntax — fails on TSDoc spec violation (missing hyphen on @param)" \
  "util.ts" "fail" \
  $'/**\n * Doubles a number.\n *\n * @param x the input value\n * @returns the doubled value\n */\nexport function double(x: number): number { return x * 2; }'

probe "jsdoc/require-jsdoc — not enforced on .tsx (components are exempt)" \
  "foo.tsx" "pass" \
  $'export function Foo() { return null; }'

echo ""
echo "Passed: $passed   Failed: $failed"

if [ $failed -gt 0 ]; then
  echo ""
  echo "Failure output:"
  echo ""
  printf '%s\n' "${failures[@]}"
  exit 1
fi
