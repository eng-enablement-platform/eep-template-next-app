import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

/**
 * Generic 404 display, rendered by the app-level `not-found.tsx`.
 * Presentational only - keep app-specific chrome out of here.
 */
export function PageNotFound() {
  return (
    <div className='flex h-[calc(100dvh-1%)] w-full flex-col items-center justify-center text-center'>
      <FileQuestion className='text-muted-foreground mb-6 size-16' />

      <h2 className='mb-4 scroll-m-20 text-3xl font-semibold tracking-tight'>
        Page not found
      </h2>
      <p className='text-muted-foreground mb-6 max-w-prose leading-7'>
        Sorry, the page you&apos;re looking for doesn&apos;t exist or has been
        moved.
      </p>

      <Button asChild variant='outline'>
        <Link href='/'>Back to Home</Link>
      </Button>
    </div>
  );
}
