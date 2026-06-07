import 'server-only';

import { drizzle } from 'drizzle-orm/node-postgres';

import { queryLogger } from '@/classes/loggers/query';

import { buildPool } from './pool';
import * as schema from './schema';

/**
 * Database Module
 *
 * Sets up the Drizzle ORM database connection using the `node-postgres`
 * driver. Environment variables are loaded by Next.js's native `.env.local`
 * loader at process boot, so no explicit `dotenv.config()` call is needed in
 * the app runtime. Standalone tsx scripts (e.g. `src/db/run-migrations.ts`)
 * load `dotenv` themselves since they run outside Next's env loader.
 *
 * The full `schema` is passed so the relational query API
 * (`db.query.<table>.findMany({ with: { ... } })`) is available.
 */

function getDrizzle() {
  return drizzle(buildPool(), { logger: queryLogger, schema });
}

let dbInstance: ReturnType<typeof getDrizzle> | null = null;

/**
 * Get the singleton Drizzle database instance, lazily constructing it on
 * first call so the pool is not opened at import time.
 *
 * @throws if `DATABASE_URL` is not set.
 * @returns The configured singleton Drizzle DB.
 */
export function getDb() {
  if (!dbInstance) {
    dbInstance = getDrizzle();
  }
  return dbInstance;
}
