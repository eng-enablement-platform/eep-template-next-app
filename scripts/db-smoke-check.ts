import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { buildPool } from '../src/db/pool';
import { exampleItemsTable } from '../src/db/schema';

/**
 * Database Smoke Check
 *
 * A fast, read-only sanity check that the full data path is wired correctly:
 * `DATABASE_URL` → `pg.Pool` → Drizzle → the real `example_items` table. It
 * exercises a list query, a `getById`-style filtered query, and reports the row
 * count and the set of `status` values present.
 *
 * Run with `pnpm db:check`. Exits non-zero if the DB is unreachable or empty.
 */

config({ path: '.env.local' });

/*
 * Parse the host out of DATABASE_URL so it's obvious which DB is being hit.
 * Catches the classic footgun of pointing at a cloud DB (e.g. Neon) while
 * expecting to hit local Docker Postgres, or vice versa.
 */
function getDatabaseHost(): string {
  const url = process.env.DATABASE_URL;
  if (!url) return 'unknown (DATABASE_URL not set)';
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown (could not parse DATABASE_URL)';
  }
}

async function smokeCheck(): Promise<void> {
  const host = getDatabaseHost();
  const isLocal =
    host === 'localhost' || host === '127.0.0.1' || host === 'postgres';
  console.log(
    `Connecting to: ${host} ${isLocal ? '(local)' : '(remote — make sure this is intentional)'}`,
  );

  const pool = buildPool();
  try {
    const db = drizzle(pool, { schema: { exampleItemsTable } });

    const all = await db.select().from(exampleItemsTable);
    console.log(`Row count: ${all.length}`);

    if (all.length === 0) {
      throw new Error('No rows found — did you run `pnpm db:seed`?');
    }

    // Confirm a filtered single-row read returns the row we asked for.
    const [first] = all;
    const byId = await db
      .select()
      .from(exampleItemsTable)
      .where(eq(exampleItemsTable.id, first.id))
      .limit(1);

    console.log(`getById returns matching row: ${byId[0]?.id === first.id}`);
    console.log(`Statuses present: ${all.map((row) => row.status).join(', ')}`);
    console.log('DB smoke check passed');
  } finally {
    await pool.end();
  }
}

smokeCheck().catch((error: unknown) => {
  console.error('DB smoke check failed:', error);
  process.exit(1);
});
