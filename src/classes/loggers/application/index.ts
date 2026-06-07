import 'server-only';

import winston, { type Logger } from 'winston';

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
      level: 'info',
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

  public getLogger(logSource: string): Logger {
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
 * @param logSource - Source of the logs e.g. API | DB
 * @returns - Logger instance
 *
 * @example
 * ```ts
 * const logger = rootLogger('some-service-name')
 *
 * logger.info({message: 'Oops', detail: 'Something is going wrong'})
 * logger.warn('Very wrong...')
 * logger.error('Yep, we messed up!!')
 * ```
 */
export const rootLogger = (logSource: string): Logger => {
  return ApplicationLogger.getInstance().getLogger(logSource);
};
