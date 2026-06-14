import 'server-only';

import { eq } from 'drizzle-orm';

import { getDb } from '@/db/db';
import { exampleItemsTable } from '@/db/schema';
import type { ExampleItem } from '@/db/types';
import type {
  ExampleItemInput,
  ExampleItemUpdateInput,
} from '@/validation/example-item';

/**
 * Example Item Service
 *
 * The reference domain service for the template. All `example_items` business
 * logic lives here behind a small, typed surface — routes and server actions
 * call these methods rather than touching Drizzle directly, so the data-access
 * pattern is defined in exactly one place.
 *
 * It is a stateless, app-lifetime collaborator (a configured gateway to the
 * database), so it is exported as a singleton. It resolves the Drizzle instance
 * lazily on each call via `getDb()`, so importing this module never opens a
 * connection pool at build time.
 */
class ExampleItemService {
  /**
   * Fetch every example item, newest first.
   *
   * @returns All rows in the `example_items` table.
   */
  async getAll(): Promise<ExampleItem[]> {
    return getDb().select().from(exampleItemsTable);
  }

  /**
   * Fetch a single example item by its primary key.
   *
   * @param id - The item's generated id.
   * @returns The matching row, or `null` if no row has that id.
   */
  async getById(id: number): Promise<ExampleItem | null> {
    const rows = await getDb()
      .select()
      .from(exampleItemsTable)
      .where(eq(exampleItemsTable.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  /**
   * Insert a new example item.
   *
   * @param input - Validated create input (see `exampleItemSchema`).
   * @returns The created row, including its generated `id` and `createdAt`.
   */
  async create(input: ExampleItemInput): Promise<ExampleItem> {
    const [row] = await getDb()
      .insert(exampleItemsTable)
      .values(input)
      .returning();

    return row;
  }

  /**
   * Apply a partial update to an existing example item.
   *
   * @param id - The id of the item to update.
   * @param input - Validated partial update input (see `exampleItemUpdateSchema`).
   * @returns The updated row, or `null` if no row has that id.
   */
  async update(
    id: number,
    input: ExampleItemUpdateInput,
  ): Promise<ExampleItem | null> {
    const [row] = await getDb()
      .update(exampleItemsTable)
      .set(input)
      .where(eq(exampleItemsTable.id, id))
      .returning();

    return row ?? null;
  }

  /**
   * Delete an example item by id.
   *
   * @param id - The id of the item to delete.
   * @returns `true` if a row was deleted, `false` if no row matched.
   */
  async delete(id: number): Promise<boolean> {
    const deleted = await getDb()
      .delete(exampleItemsTable)
      .where(eq(exampleItemsTable.id, id))
      .returning({ id: exampleItemsTable.id });

    return deleted.length > 0;
  }
}

/**
 * Singleton service instance. Import this throughout the app to read and
 * mutate example items.
 */
export const exampleItemService = new ExampleItemService();

// test-only exports
export const _forTests = { ExampleItemService };
