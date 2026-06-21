import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';

import { buildPool } from './pool';

config({ path: '.env.local' });

/**
 * Run Drizzle migrations against the database described by `DATABASE_URL`.
 *
 * Constructs an explicit `pg.Pool` (via `buildPool`) and tears it down before
 * exit so the process terminates cleanly.
 *
 */
export async function runMigrations() {
  const pool = buildPool();
  try {
    const db = drizzle(pool);
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'drizzle'),
    });
    console.log('DB migrations completed');
  } finally {
    await pool.end();
  }
}

runMigrations();
