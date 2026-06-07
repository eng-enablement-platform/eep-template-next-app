import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Configuration Module
 *
 * This module defines the Drizzle ORM configuration for database management.
 * It loads environment variables and sets up the necessary parameters for
 * Drizzle to interact with the PostgreSQL database.
 *
 */

config({ path: '.env.local' });

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  schemaFilter: ['public'],
});
