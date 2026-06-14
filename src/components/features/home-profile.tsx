'use client';

import { UserButton, useUser } from '@clerk/nextjs';

/**
 * This is an EXAMPLE component.
 *
 * Signed-in welcome card for the home page
 *
 * @example
 * ```tsx
 * <HomeProfile />
 * ```
 */
export function HomeProfile() {
  const { user } = useUser();

  const displayName =
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress ??
    'your account';

  return (
    <div className='border-border bg-card/50 flex items-center gap-3 rounded-full border py-1.5 pr-4 pl-1.5 shadow-md backdrop-blur-sm'>
      <UserButton />
      <span className='text-muted-foreground text-sm'>
        Signed in as{' '}
        <span className='text-foreground font-medium'>{displayName}</span>
      </span>
    </div>
  );
}
