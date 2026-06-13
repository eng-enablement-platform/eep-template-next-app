import path from 'node:path';
import { fileURLToPath } from 'node:url';

import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import jsdoc from 'eslint-plugin-jsdoc';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tsdoc from 'eslint-plugin-tsdoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Next.js file conventions that *must* default-export. Everywhere else we
 * enforce named exports via `import/no-default-export`.
 *
 * See: https://nextjs.org/docs/app/api-reference/file-conventions
 */
const NEXT_DEFAULT_EXPORT_FILES = [
  '**/app/**/page.tsx',
  '**/app/**/layout.tsx',
  '**/app/**/route.ts',
  '**/app/**/error.tsx',
  '**/app/**/loading.tsx',
  '**/app/**/not-found.tsx',
  // Root proxy (formerly middleware) must default-export per Next.js convention.
  'src/proxy.ts',
];

/*
 * Config files at the repo root that are expected to default-export (their
 * loader requires it — `next.config.ts`, `vitest.config.ts`, `eslint.config.ts`,
 * `prettier.config.js`, etc.).
 */
const CONFIG_FILE_DEFAULT_EXPORT_FILES = [
  '*.config.{ts,mts,cts,js,mjs,cjs}',
  'eslint.config.{ts,mts,cts,js,mjs,cjs}',
];

export default defineConfig([
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'docs/**',
      'e2e-tests/**',
      'out/**',
      'build/**',
      'dist/**',
      'next-env.d.ts',
      /*
       * Vendored static assets (e.g. swagger-ui bundle copied in by
       * scripts/copy-swagger-ui.ts) are not ours to lint.
       */
      'public/**',
    ],
  },

  ...nextVitals,
  ...nextTs,

  {
    languageOptions: {
      parserOptions: {
        /*
         * `projectService` lets typescript-eslint discover the nearest
         * tsconfig on demand — needed for type-aware rules without
         * hand-maintaining a `project` array.
         *
         * ⚠️  Footgun: every file ESLint lints must live inside the tsconfig
         * project. Do NOT add lintable paths under `src/` to
         * `tsconfig.json`'s `exclude` array — doing so causes ESLint to fail
         * with "file not found by the project service". If you need a path
         * excluded from tsc but linted by ESLint, configure
         * `projectService.allowDefaultProject` instead.
         */
        projectService: {
          allowDefaultProject: ['*.mjs', '*.cjs', '*.js'],
        },
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      '@stylistic': stylistic,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: false },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/no-default-export': 'error',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-declaration',
          unnamedComponents: 'arrow-function',
        },
      ],
      /*
       * Enforce AGENTS.md: multi-line comments must use `/* ... *\/` block
       * syntax, never stacked `//` lines. Single-line `//` comments are
       * still fine. This rule is auto-fixable via `eslint --fix`.
       */
      '@stylistic/multiline-comment-style': ['error', 'starred-block'],
    },
  },

  /*
   * TSDoc syntax + JSDoc presence enforcement on `.ts` files only.
   * `.tsx` is handled separately below — components don't need
   * `require-jsdoc`-style enforcement.
   *
   * Why both plugins? They cover non-overlapping concerns:
   *   - `eslint-plugin-jsdoc`  → presence & structure
   *       (`require-jsdoc`, `require-param`, `require-returns`, …)
   *   - `eslint-plugin-tsdoc`  → syntax only, one rule: `tsdoc/syntax`
   *       (validates that comments which exist follow the TSDoc spec)
   *
   * Using tsdoc alone gives you nothing on undocumented code — it only
   * lints comments that already exist. We turn off jsdoc's own syntax
   * checks (`check-tag-names`, `check-param-names`) so they don't fight
   * tsdoc's stricter TSDoc-spec validation.
   */
  {
    files: ['**/*.ts'],
    plugins: {
      jsdoc,
      tsdoc,
    },
    settings: {
      jsdoc: { mode: 'typescript' },
    },
    rules: {
      'tsdoc/syntax': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
        },
      ],
      'jsdoc/tag-lines': 'off',
      'jsdoc/check-tag-names': 'off',
      'jsdoc/require-param': ['error', { checkDestructured: false }],
      'jsdoc/check-param-names': 'off',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns-type': 'off',
    },
  },

  /*
   * Hand-authored `.tsx` conventions:
   *   1. `useState` must carry an explicit type annotation.
   *   2. No `import * as React from "react"` — use named imports
   *      (`import { useState, type ReactNode } from "react"`) so tree-shaking
   *      and `import type` work properly.
   */
  {
    files: ['**/*.tsx'],
    /**
     * Shadcn primitives are vendored, not authored.
     * So we ignore them from some rules.
     */
    ignores: ['**/components/ui/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "VariableDeclarator[init.type='CallExpression'][init.callee.name='useState']:not([init.typeArguments])",
          message:
            'useState must have an explicit type annotation. Use: const [state, setState] = useState<Type>(initialValue)',
        },
        {
          selector:
            "ImportDeclaration[source.value='react'] > ImportNamespaceSpecifier",
          message:
            "Do not namespace-import React. Use named imports instead: import { useState, type ReactNode } from 'react'.",
        },
      ],
    },
  },

  /*
   * Next.js file conventions require default exports — opt these specific
   * files out of the global named-export rule.
   */
  {
    files: NEXT_DEFAULT_EXPORT_FILES,
    rules: {
      'import/no-default-export': 'off',
    },
  },

  /*
   * Tool config files at the repo root must default-export (loader requirement).
   */
  {
    files: CONFIG_FILE_DEFAULT_EXPORT_FILES,
    rules: {
      'import/no-default-export': 'off',
    },
  },
]);
