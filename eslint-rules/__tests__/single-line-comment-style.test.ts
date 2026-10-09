import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import { singleLineCommentStyle } from '../single-line-comment-style';

// RuleTester generates its own describe/it blocks - route them through Vitest.
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

/**
 * Pins the comment contract's single-line half. Every autofix output is also
 * re-parsed by RuleTester, which is what guards the inline-comment regression:
 * `fn(/* retries *\/ 3)` used to be "fixed" to `fn(// retries 3)`, commenting
 * out the rest of the line and breaking the code.
 */
ruleTester.run('single-line-comment-style', singleLineCommentStyle, {
  valid: [
    { name: 'line comment', code: '// a line comment' },
    {
      name: 'multi-line block (owned by multiline-comment-style)',
      code: '/*\n * line one\n * line two\n */',
    },
    { name: 'single-line TSDoc', code: '/** Documented. */\nconst a = 1;' },
    {
      name: 'eslint directive',
      code: '/* eslint-disable no-console */\nconsole.log(1);',
    },
    {
      name: 'typescript directive',
      code: '/* @ts-expect-error - testing */\nconst a = 1;',
    },
    {
      name: 'coverage directive',
      code: '/* istanbul ignore next */\nconst a = 1;',
    },
    {
      name: 'inline block comment followed by code on the same line',
      code: 'callSomething(/* retries */ 3);',
    },
    {
      name: 'bundler annotation before a call',
      code: 'const thing = /* @__PURE__ */ createThing();',
    },
  ],
  invalid: [
    {
      name: 'single-line block on its own line',
      code: '/* one line */\nconst a = 1;',
      output: '// one line\nconst a = 1;',
      errors: [{ messageId: 'useLineComment' }],
    },
    {
      name: 'trims padding inside the block',
      code: '/*    padded    */\nconst a = 1;',
      output: '// padded\nconst a = 1;',
      errors: [{ messageId: 'useLineComment' }],
    },
    {
      name: 'trailing block comment at the end of a line',
      code: 'const a = 1; /* trailing */',
      output: 'const a = 1; // trailing',
      errors: [{ messageId: 'useLineComment' }],
    },
  ],
});
