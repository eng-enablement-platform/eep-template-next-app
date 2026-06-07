import { formatErrorMessage } from '@/utils/format-error-message';

type ErrorSource = 'INTEGRATION_CLIENT' | 'API' | 'DB' | 'UI' | 'UTIL_FUNCTION';

/**
 * Custom error class for all application-related errors.
 * This class extends the built-in Error class and adds context-specific information.
 *
 */
export class ApplicationError extends Error {
  /**
   * Creates an instance of ApplicationError.
   *
   * @param  message - The error message.
   * @param context - The context object containing additional error information.
   *
   * @example
   * throw new ApplicationError("Failed to fetch user data", \{
   *   source: "API",
   *   function: "getUserData",
   *   originalError: error
   * \});
   */
  constructor(
    message: string,
    public readonly context: {
      source: ErrorSource;
      function: string;
      originalError?: unknown;
    },
  ) {
    super(message);
    this.name = 'ApplicationError';

    /**
     * Ensures correct prototype chain setup.
     * Important for proper inheritance and type checking.
     */
    Object.setPrototypeOf(this, ApplicationError.prototype);

    // Format the original error message if it exists else set it to null
    if (this.context.originalError) {
      this.context.originalError = formatErrorMessage(
        this.context.originalError,
      );
    } else {
      this.context.originalError = null;
    }
  }
}
