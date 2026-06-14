import 'server-only';

import winston, { type Logger } from 'winston';

/**
 * The layer a log line originated from. Sources are the architectural layers
 * (not concerns like `auth` or `db`) so that `logSource` always maps 1:1 to a
 * folder. Follow a layer in the logs with
 * e.g. `grep '"logSource":"action"' .logs/winston-combined.log`.
 *
 * For the specific module or concern, pass a free-form field on the log call
 * itself (e.g. `logger.error({ scope: 'auth', ... })`) rather than inventing a
 * new source.
 */
export const LOG_SOURCE = {
  /** `app/api/` route handlers. */
  API: 'api',
  /** `actions/` server actions. */
  ACTION: 'action',
  /** `classes/services/<domain>/` business logic. */
  SERVICE: 'service',
} as const;

export type LogSource = (typeof LOG_SOURCE)[keyof typeof LOG_SOURCE];

/**
 * Resolve the winston level floor. An explicit `LOG_LEVEL` always wins;
 * otherwise the default is per-env so prod stays quiet, dev is verbose, and
 * tests don't spew. Flip verbosity for a single run with `LOG_LEVEL=debug`.
 *
 * @returns The winston level name to use as the logger's floor.
 */
const resolveLogLevel = (): string => {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL;
  }

  switch (process.env.NODE_ENV) {
    case 'development':
      return 'debug';
    case 'test':
      return 'warn';
    default:
      return 'info';
  }
};

/**
 * Custom logger class for the backend application
 * using winston
 */
class ApplicationLogger {
  private static instance: ApplicationLogger;
  private logger: Logger;

  private constructor() {
    const logDirectory =
      process.env.NODE_ENV === 'production' ? '/tmp/.logs' : '.logs';

    const errorLogsTransport: winston.transport = new winston.transports.File({
      filename: `${logDirectory}/winston-error.log`,
      level: 'error',
    });

    const combinedLogsTransport: winston.transport =
      new winston.transports.File({
        filename: `${logDirectory}/winston-combined.log`,
      });

    const defaultFormat: Logger['format'] = winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    );
    /**
     * Development: Pretty print and colorize the logs
     * Production: Default format as this can affect downstream consumers of the logs
     */
    const logsFormat =
      process.env.NODE_ENV === 'development'
        ? winston.format.combine(
            winston.format.prettyPrint(),
            winston.format.colorize({ all: true }),
          )
        : defaultFormat;

    const allLogsTransport: winston.transport = new winston.transports.Console({
      format: logsFormat,
    });

    this.logger = winston.createLogger({
      level: resolveLogLevel(),
      format: defaultFormat,
      transports: [
        errorLogsTransport,
        combinedLogsTransport,
        ...(process.env.NODE_ENV !== 'test' ? [allLogsTransport] : []),
      ],
    });
  }

  public static getInstance(): ApplicationLogger {
    if (!ApplicationLogger.instance) {
      ApplicationLogger.instance = new ApplicationLogger();
    }
    return ApplicationLogger.instance;
  }

  public getLogger(logSource: LogSource): Logger {
    /**
     * During build time, return a no-op logger
     * This stops all of the noise when committing and building
     * the app
     */
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return winston.createLogger({
        silent: true,
        format: winston.format.simple(),
        transports: [new winston.transports.Console()],
      });
    }
    return this.logger.child({ logSource });
  }
}
/**
 * This logger is designed to be used for any backend service.
 *
 * @param logSource - The architectural layer the log came from. Constrained to
 * the {@link LOG_SOURCE} set so casing and the source list can't drift — pass a
 * `scope` field on the log call for the specific module/concern.
 * @returns - Logger instance
 *
 * @example
 * ```ts
 * const logger = rootLogger(LOG_SOURCE.ACTION)
 *
 * logger.info({ message: 'Item created', id })
 * logger.error({ message: 'Create failed', scope: 'example-items', error })
 * ```
 */
export const rootLogger = (logSource: LogSource): Logger => {
  return ApplicationLogger.getInstance().getLogger(logSource);
};
