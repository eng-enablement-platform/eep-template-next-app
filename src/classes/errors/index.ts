import 'server-only';

import { formatErrorMessage } from '@/utils/format-error-message';

// Structured context attached to every `ApplicationError`.
type ErrorContext = {
  scope: string;
  function: string;
  originalError?: unknown;
};

/**
 * Structured error for deliberate, domain-level failures.
 *
 * Reach for this when *your* code decides something is wrong - a third-party
 * call returns a non-ok response, a required credential is missing, a domain
 * invariant is broken.
 *
 * @example
 * ```ts
 * throw new ApplicationError('Marketplace request failed', {
 *   scope: 'marketplace',
 *   function: 'MarketplaceService.getListing',
 *   originalError: `${response.status} ${response.statusText}`,
 * });
 * ```
 */
export class ApplicationError extends Error {
  /**
   * Creates an instance of ApplicationError.
   *
   * @param message - The error message.
   * @param context - Structured context: the `scope`, the originating
   *   `function`, and an optional `originalError` (normalised to a string).
   */
  constructor(
    message: string,
    public readonly context: ErrorContext,
  ) {
    super(message);
    this.name = 'ApplicationError';

    /*
     * Ensures the prototype chain is set up correctly so `instanceof
     * ApplicationError` works after transpilation.
     */
    Object.setPrototypeOf(this, ApplicationError.prototype);

    /*
     * Normalise the original error to a string (or null) up front so consumers
     * never have to re-handle an `unknown` when reading the context.
     */
    this.context.originalError = this.context.originalError
      ? formatErrorMessage(this.context.originalError)
      : null;
  }
}
