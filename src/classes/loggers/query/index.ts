import 'server-only';

import { type Logger } from 'drizzle-orm/logger';

import { env } from '@/lib/env';

/**
 * Custom logger class for Drizzle ORM queries.
 *
 * This is a developer diagnostic, not part of the structured `logSource`
 * contract - it dumps raw SQL and params to the console so you can watch
 * queries and mutations live while building.
 *
 * It is intentionally noisy, so it is off by default and
 * only fires when `DB_QUERY_LOG=1`.
 */
class QueryLogger implements Logger {
  /**
   * Logs a database query with its parameters when query logging is enabled.
   *
   * @param query - The SQL query string to be logged.
   * @param params - An array of parameter values used in the query.
   */
  logQuery(query: string, params: unknown[]): void {
    // Skip logging during build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return;
    }

    // Opt-in firehose: silent unless explicitly switched on for a dev session.
    if (env.DB_QUERY_LOG !== '1') {
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
