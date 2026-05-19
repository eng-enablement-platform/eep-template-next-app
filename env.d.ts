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
    DB_URL: string;

    // Clerk Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;
  }
}
