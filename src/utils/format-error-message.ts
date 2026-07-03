/**
 * Normalise any thrown value into a display string.
 *
 * `catch` clauses type their argument as `unknown`, so callers have to handle
 * `Error`, plain strings, and arbitrary objects. This does that once so nothing
 * else has to.
 *
 * @param error - The value from a `catch` clause.
 * @returns A human-readable string, never throws.
 * @example
 * ```ts
 * try { ... } catch (err) {
 *   toast.error(formatErrorMessage(err));
 * }
 * ```
 */
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    return String((error as { message: unknown }).message);
  } else {
    return 'An unknown error occurred';
  }
};
