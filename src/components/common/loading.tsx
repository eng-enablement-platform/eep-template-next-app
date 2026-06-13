'use client';

import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type SpinnerProps = {
  isLoading: boolean;
  showStepper?: boolean;
};

// Time durations in milliseconds
const MEDIUM_DURATION = 3000; // 3 seconds
const LONG_DURATION = 8000; // 8 seconds

// Loading messages
const INITIAL_MESSAGE = 'Processing your request...';
const MEDIUM_DURATION_MESSAGE = 'Still working on the request...';
const LONG_DURATION_MESSAGE =
  'The request is taking longer than expected but still processing...';

/**
 * Full-screen loading overlay shown while `isLoading` is true.
 *
 * With the stepper on (default) it escalates its message the longer a load
 * runs, so a slow request reassures rather than looks frozen; turn the stepper
 * off for a bare spinner.
 *
 * @param showStepper - Show the timed reassurance messages (default true).
 * @example
 * ```tsx
 * <Spinner isLoading={isPending} />
 * ```
 */
export function Spinner({ isLoading, showStepper = true }: SpinnerProps) {
  const [message, setMessage] = useState<string>(INITIAL_MESSAGE);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    /*
     * Escalate the message the longer a load runs. On each fresh load we reset
     * to the initial message (a prior load may have escalated it), then a timer
     * advances it past the medium/long thresholds.
     */
    const startTime = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset on each load start; the interval below drives the rest
    setMessage(INITIAL_MESSAGE);

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= LONG_DURATION) {
        setMessage(LONG_DURATION_MESSAGE);
      } else if (elapsed >= MEDIUM_DURATION) {
        setMessage(MEDIUM_DURATION_MESSAGE);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading]);

  if (!isLoading) return null;

  // Simple spinner without stepper
  if (!showStepper) {
    return (
      <div
        id='spinner'
        className='bg-background/80 absolute inset-0 z-50 flex items-center justify-center'
      >
        <LoaderCircle className='text-muted-foreground size-12 animate-spin' />
      </div>
    );
  }

  // Spinner with stepper and messages
  return (
    <div
      id='spinner'
      className='bg-background/80 absolute inset-0 z-50 flex flex-col items-center justify-center'
    >
      <div className='bg-background flex max-w-md flex-col items-center space-y-4 rounded-lg p-6 shadow-lg'>
        <LoaderCircle className='text-muted-foreground mb-2 size-12 animate-spin' />

        <p className='text-foreground text-center font-medium'>{message}</p>
      </div>
    </div>
  );
}
