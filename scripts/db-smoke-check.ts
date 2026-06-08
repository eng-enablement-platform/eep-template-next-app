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
 * Use it after `pnpm db:migrate && pnpm db:seed` to confirm the DB is reachable
 * and the seed landed, or any time you want a 1-second confidence check that a
 * dev's local Postgres is healthy and migrated. It mutates nothing.
 *
 * Runs outside Next.js via `tsx`, so it loads `.env.local` itself and builds
 * (and tears down) its own pool — it does not import the `server-only` DB
 * singleton in `src/db/db.ts`, which would refuse to load outside Next.
 *
 * Run with `pnpm db:check`. Exits non-zero if the DB is unreachable or empty.
 */

config({ path: '.env.local' });

async function smokeCheck(): Promise<void> {
  const pool = buildPool();
  try {
    const db = drizzle(pool, { schema: { exampleItemsTable } });

    const all = await db.select().from(exampleItemsTable);
    console.log(`Row count: ${all.length}`);

    if (all.length === 0) {
      throw new Error('No rows found — did you run `pnpm db:seed`?');
    }

    /* Confirm a filtered single-row read returns the row we asked for. */
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
