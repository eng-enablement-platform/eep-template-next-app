import { SignIn, SignUp } from '@clerk/nextjs';
import Image from 'next/image';

import { EepLogo } from '@/components/common/eep-logo';

type AuthProps = {
  type: 'sign-in' | 'sign-up';
  title?: string;
};

/**
 * Branded sign-in / sign-up page: EEP logo, the Next.js mark and title, then
 * Clerk's prebuilt form. Mirrors the README header.
 *
 * Consumed by the catch-all `[[...sign-in]]` / `[[...sign-up]]` routes, which is
 * why Clerk's path-based routing resolves without extra config. Clerk's own
 * styling comes from `clerkAppearance` on the provider. The Next.js mark is a
 * black circle, so it gets a faint ring in dark mode to stay visible.
 *
 * @param type - Whether to render the sign-in or sign-up Clerk widget.
 * @param title - Text beside the Next.js mark. Rename when you fork the template.
 * @example
 * ```tsx
 * <Auth type='sign-in' />
 * ```
 */
export function Auth({ type, title = 'Next.js Template' }: AuthProps) {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10'>
      <EepLogo variant='full' className='w-60' />
      <div className='-mt-2 flex items-center gap-3'>
        <Image
          src='/nextjs-mark.svg'
          alt=''
          width={32}
          height={32}
          priority
          className='rounded-full dark:ring-1 dark:ring-white/30'
        />
        <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
      </div>
      {type === 'sign-up' ? (
        <SignUp signInUrl='/sign-in' />
      ) : (
        <SignIn signUpUrl='/sign-up' />
      )}
    </main>
  );
}
