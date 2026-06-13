'use client';

import { ErrorDisplay } from '@/components/common/error-display';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Next.js segment error boundary (reserved filename). Thin shell only — the UI
 * lives in `components/common/error-display` (shared with our client
 * `ErrorBoundary`); this just forwards the framework's error message to it.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default function Error({ error }: ErrorProps) {
  return (
    <ErrorDisplay
      errorMessage={error?.message || 'An unknown error occurred'}
    />
  );
}
