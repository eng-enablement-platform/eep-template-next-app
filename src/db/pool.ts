import { Pool } from 'pg';

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
 * @throws if `DATABASE_URL` is not set.
 * @returns A new pool ready to accept queries. The caller owns its lifecycle:
 *   keep it alive as a singleton for the long-running app, or call `.end()`
 *   for short-lived scripts.
 */
export function buildPool(): Pool {
  const { DATABASE_URL } = process.env;

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. See env.local_template.');
  }

  return new Pool({ connectionString: DATABASE_URL });
}
