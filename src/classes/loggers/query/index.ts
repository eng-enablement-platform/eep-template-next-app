import 'server-only';

import { type Logger } from 'drizzle-orm/logger';

/**
 * Custom logger class for Drizzle ORM queries.
 * This class implements the Logger interface from drizzle-orm and provides
 * custom logging functionality for database queries.
 */
class QueryLogger implements Logger {
  /**
   * Logs a database query with its parameters.
   *
   * @param query - The SQL query string to be logged.
   * @param params - An array of parameter values used in the query.
   */
  logQuery(query: string, params: unknown[]): void {
    // Skip logging during build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return;
    }

    console.debug('___QUERY___');
    console.debug(query);
    console.debug(params);
    console.debug('___END_QUERY___');
  }
}

/**
 * Singleton instance of QueryLogger.
 * Use this exported constant to access the logger throughout the application.
 */
export const queryLogger = new QueryLogger();
