import {
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * Database Tables
 *
 * This file stores all of the tables / data models used throughout the project.
 *
 * Uses the public schema by default.
 */

// ############ ENUMS ###################

/**
 * Lifecycle status for an example item.
 *
 * Demonstrates the `pgEnum` pattern - a database-level enum that pairs with a
 * matching Zod enum in `validation.ts` so the column and its validator cannot
 * drift apart.
 */
export const exampleItemStatus = pgEnum('example_item_status', [
  'draft',
  'active',
  'archived',
]);

// ############ TABLES ###################

/**
 * Represents the example `example_items` table.
 *
 * This is the template's reference data model - deliberately named so it is
 * obviously demo data, not production domain. Its field shape is chosen to
 * exercise every pattern the template teaches: a generated primary key, a
 * required string, an optional/nullable string, an integer, an enum, and a
 * defaulted timestamp.
 *
 * @remarks
 * Columns:
 * - id: number - primary key, auto-generated identity
 * - name: string - required, max 255 chars
 * - description: string | null - optional free text
 * - quantity: number - integer, defaults to 0
 * - status: 'draft' | 'active' | 'archived' - defaults to 'draft'
 * - createdAt: Date - timestamp, defaults to now()
 * - expiresAt: string | null - optional calendar date (YYYY-MM-DD). Stored as
 *   a SQL `date` column (no time, no timezone) so the value is always a plain
 *   date string on the way out, never shifted by the DB server's timezone.
 */
export const exampleItemsTable = pgTable('example_items', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  quantity: integer().notNull().default(0),
  status: exampleItemStatus().notNull().default('draft'),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  expiresAt: date(),
});
