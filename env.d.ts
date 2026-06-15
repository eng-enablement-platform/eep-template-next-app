/**
 * Global Environment Variable Declarations
 *
 * This file extends the global ProcessEnv interface to include
 * type definitions for custom environment variables used in the project.
 * It ensures type safety and autocompletion when accessing process.env.
 *
 */

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'production' | 'development' | 'test';
    DATABASE_URL: string;

    // Logging. Winston verbosity floor; defaults per env when unset.
    LOG_LEVEL?: 'error' | 'warn' | 'info' | 'http' | 'debug';
    // Set to '1' to stream Drizzle query/param output in dev. Off by default.
    DB_QUERY_LOG?: string;

    // Clerk Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;

    // Docs site URL. When set, a "Docs" link appears in the homepage header.
    NEXT_PUBLIC_DOCS_URL?: string;
  }
}
