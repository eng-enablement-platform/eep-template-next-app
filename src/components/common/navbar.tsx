'use client';

import { EepLogo } from '@/components/common/eep-logo';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { TimezoneSelector } from '@/components/common/timezone-selector';
import { UserMenu } from '@/components/common/user-menu';
import { env } from '@/lib/env';

/**
 * Application navbar - rendered on every authenticated page via `RootLayoutClient`.
 *
 * Holds the logo, the user menu (which carries the docs links) and the theme
 * and timezone controls. Extracted from page.tsx so it doesn't need to be
 * repeated per-page and so page content doesn't bleed under an
 * absolutely-positioned header.
 *
 * @example
 * ```tsx
 * <Navbar />
 * ```
 */
export function Navbar() {
  return (
    <header className='border-border bg-background/80 sticky top-0 z-10 flex w-full items-center justify-between border-b px-4 py-4 backdrop-blur-sm'>
      <EepLogo variant='nav' className='w-30' />
      <div className='flex items-center gap-4'>
        <UserMenu docsUrl={env.NEXT_PUBLIC_DOCS_URL} />
        <ThemeToggle />
        <TimezoneSelector />
      </div>
    </header>
  );
}
