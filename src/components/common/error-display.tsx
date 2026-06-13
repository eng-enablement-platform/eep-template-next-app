'use client';

import { CircleAlert } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

type ErrorDisplayProps = {
  errorMessage?: string;
};

/*
 * This is the shared error UI — NOT the Next.js error boundary. There are two
 * separate triggers that both render it, which is why this lives apart from
 * `app/error.tsx`:
 *   1. `app/error.tsx` — Next's reserved segment boundary, fired when a routed
 *      segment throws during render/hydration. It's a thin shell that just
 *      forwards the framework's error message here.
 *   2. `ErrorBoundary` (./error-boundary) — our client boundary for errors
 *      thrown AFTER hydration, which Next's boundary misses. Uses this as its
 *      default fallback.
 * Keeping the UI here (rather than inline in app/error.tsx) is what stops those
 * two triggers from duplicating the markup.
 */

/**
 * Generic full-screen error display. Presentational only — a message and a way
 * back home, nothing more.
 *
 * @param errorMessage - Optional detail surfaced to the user. Omit in
 *   production-facing paths where raw messages should not leak.
 */
export function ErrorDisplay({ errorMessage }: ErrorDisplayProps) {
  return (
    <div className='flex h-[calc(100dvh-1%)] w-full flex-col items-center justify-center text-center'>
      <CircleAlert className='text-destructive mb-6 size-16' />

      <h2 className='mb-4 text-xl font-semibold'>Oops! An error occurred.</h2>
      <p className='mb-4 max-w-prose'>
        The system ran into a problem during your request. Our team has been
        notified and is working to fix it.
      </p>

      {errorMessage && (
        <div className='border-destructive bg-destructive/10 text-destructive mb-6 max-w-xl rounded-md border px-4 py-3'>
          <strong className='mb-1 block'>Error details:</strong>
          <code className='text-sm break-words'>{errorMessage}</code>
        </div>
      )}

      <Button asChild variant='outline'>
        <Link href='/'>Back to Home</Link>
      </Button>
    </div>
  );
}
