import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';
import { Pool } from 'pg';
import { z } from 'zod';

config({ path: '.env.local' });

/**
 * Run Drizzle migrations against the database described by `DATABASE_URL`.
 *
 * Only `DATABASE_URL` is validated here - deliberately not `@/lib/env` (via
 * `buildPool`), which also requires the Clerk keys. Migrations only need the
 * database, so they can run before `.env.local` exists (e.g. automatically on
 * devcontainer start). Tears the pool down before exit so the process
 * terminates cleanly.
 */
export async function runMigrations() {
  const databaseUrl = z
    .url('DATABASE_URL must be a valid connection string URL')
    .parse(process.env.DATABASE_URL);
  const pool = new Pool({ connectionString: databaseUrl });
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
