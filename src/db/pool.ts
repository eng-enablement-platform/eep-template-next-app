import { Pool } from 'pg';

import { env } from '@/lib/env';

/**
 * Construct a `pg.Pool` from the `DATABASE_URL` connection string.
 *
 * The `node-postgres` (`pg`) driver talks to any Postgres over the wire, so
 * the same pool serves a local Docker container in dev and a hosted provider
 * (e.g. Neon) in production — only the `DATABASE_URL` value changes between
 * environments.
 *
 * This module intentionally omits the `server-only` guard: the app's DB
 * singleton (`db.ts`) carries it, while standalone `tsx` scripts (migrations,
 * seed) import `buildPool` directly and run outside Next's module graph.
 *
 * @returns A new pool ready to accept queries. The caller owns its lifecycle:
 *   keep it alive as a singleton for the long-running app, or call `.end()`
 *   for short-lived scripts. `DATABASE_URL` is validated at startup by T3 Env
 *   (`src/lib/env`) — a missing or malformed URL fails the build before this runs.
 */
export function buildPool(): Pool {
  return new Pool({ connectionString: env.DATABASE_URL });
}
