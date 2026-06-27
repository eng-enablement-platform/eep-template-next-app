'use client';

import { useClerk } from '@clerk/nextjs';
import { LockKeyhole } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * Access restricted screen for signed-in users without the Admin role.
 *
 * Shown after `proxy.ts` has confirmed the user is authenticated but not an
 * admin — this deployment is a private testing environment, not a public
 * product. Provides a sign-out action to clear the session cleanly.
 *
 * @example
 * ```tsx
 * <Restricted />
 * ```
 */
export function Restricted() {
  const { signOut } = useClerk();

  return (
    <div className='flex min-h-screen w-full flex-col items-center justify-center text-center'>
      <LockKeyhole className='mb-6 size-16 text-red-500' />

      <h2 className='mb-4 scroll-m-20 text-3xl font-semibold tracking-tight'>
        Access restricted
      </h2>
      <p className='text-muted-foreground mb-6 max-w-prose leading-7'>
        Thanks for signing in — but this is a private testing deployment of the
        EEP Next.js template and isn&apos;t open for general access. If you
        think you should have access, get in touch with the owner.
      </p>

      <Button
        variant='outline'
        onClick={() => signOut({ redirectUrl: '/sign-in' })}
      >
        Sign out
      </Button>
    </div>
  );
}
