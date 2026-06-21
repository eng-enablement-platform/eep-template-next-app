import type { exampleItemsTable } from './schema';

/**
 * Database Types
 *
 * Inferred row types for the schema tables. Drizzle derives these directly
 * from the table definitions in `schema.ts`, so they stay in lockstep with the
 * columns
 *
 */

/**
 * A fully-materialised `example_items` row as returned by a `SELECT`,
 * including database-generated columns (`id`, `createdAt`).
 */
export type ExampleItem = typeof exampleItemsTable.$inferSelect;

/**
 * The shape required to `INSERT` a new `example_items` row. Database-generated
 * and defaulted columns are optional here.
 */
export type NewExampleItem = typeof exampleItemsTable.$inferInsert;
