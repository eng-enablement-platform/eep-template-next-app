// Must be the first import - loads .env files (with ${VAR} expansion) first.
import './src/lib/env/load-env-files';

import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Configuration Module
 *
 * This module defines the Drizzle ORM configuration for database management.
 * It loads environment variables and sets up the necessary parameters for
 * Drizzle to interact with the PostgreSQL database.
 *
 */

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
