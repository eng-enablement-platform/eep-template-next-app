/**
 * Checks the error received and formats it into
 * an appropriate message
 *
 * @param error - The error that occurred
 * @returns - A string formatted representation of the error
 */
export function formatErrorMessage(error: unknown): string {
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
}
