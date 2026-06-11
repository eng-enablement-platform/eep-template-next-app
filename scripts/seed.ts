import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';

import { buildPool } from '../src/db/pool';
import { exampleItemsTable } from '../src/db/schema';
import type { NewExampleItem } from '../src/db/types';

/**
 * Database Seed Script
 *
 * Populates the `example_items` table with a small, deterministic dataset so
 * the REST routes, server actions, and Swagger docs all have live data to
 * exercise against.
 *
 * Run with `pnpm db:seed`. Safe to re-run: it clears the table first.
 */

config({ path: '.env.local' });

const seedItems: NewExampleItem[] = [
  { name: 'First item', description: 'A draft example', quantity: 1 },
  {
    name: 'Second item',
    description: 'An active example',
    quantity: 5,
    status: 'active',
  },
  {
    name: 'Third item',
    description: 'An archived example',
    quantity: 0,
    status: 'archived',
  },
];

async function seed(): Promise<void> {
  const pool = buildPool();
  try {
    const db = drizzle(pool, { schema: { exampleItemsTable } });

    await db.delete(exampleItemsTable);
    const inserted = await db
      .insert(exampleItemsTable)
      .values(seedItems)
      .returning({ id: exampleItemsTable.id });

    console.log(`Seeded ${inserted.length} example items`);
  } finally {
    await pool.end();
  }
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
