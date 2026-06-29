import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Validated environment variable schema for the application.
 *
 * Uses T3 Env (`@t3-oss/env-nextjs`) to validate all environment variables at
 * build time using Zod. If a required variable is missing or the wrong type,
 * the build fails immediately with a clear error rather than producing a broken
 * deployment that fails at runtime.
 *
 * Variables are split into `server` (never exposed to the browser) and `client`
 * (`NEXT_PUBLIC_*` vars inlined into the client bundle at build time). Import
 * `env` from this module instead of reading `process.env` directly.
 *
 * @example
 * ```ts
 * import { env } from '@/lib/env';
 *
 * const pool = new Pool({ connectionString: env.DATABASE_URL });
 * ```
 */
export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    DATABASE_URL: z.url('DATABASE_URL must be a valid connection string URL'),
    CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
    // Optional - controls Winston verbosity floor. Defaults per NODE_ENV when unset.
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).optional(),
    // Optional - set to '1' to stream raw Drizzle SQL to the console in dev.
    DB_QUERY_LOG: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
      .string()
      .min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/'),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/'),
    // Optional - when set, a "Docs" link appears in the homepage navbar.
    NEXT_PUBLIC_DOCS_URL: z.url().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    LOG_LEVEL: process.env.LOG_LEVEL,
    DB_QUERY_LOG: process.env.DB_QUERY_LOG,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL,
  },
  /*
   * Skip validation during:
   * - `next build` static analysis (NEXT_PHASE=phase-production-build): runtime
   *   secrets are not available; real validation fires at server startup.
   * - Vitest test runs: jsdom registers as a client environment so T3 Env blocks
   *   access to server vars. Server-layer modules (loggers, services) are tested
   *   under the server-only stub already; env validation is a build/runtime concern.
   */
  skipValidation:
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.VITEST === 'true',
});
