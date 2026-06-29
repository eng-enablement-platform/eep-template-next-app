'use client';

import { BookOpen, FileText } from 'lucide-react';
import Image from 'next/image';

import { ThemeToggle } from '@/components/common/theme-toggle';
import { TimezoneSelector } from '@/components/common/timezone-selector';
import { HomeProfile } from '@/components/features/home-profile';
import { Button } from '@/components/ui/button';
import { env } from '@/lib/env';

/**
 * Application navbar - rendered on every authenticated page via `RootLayoutClient`.
 *
 * Contains the primary nav links (docs, API docs) and the user profile/theme
 * toggle. Extracted from page.tsx so it doesn't need to be repeated per-page
 * and so page content doesn't bleed under an absolutely-positioned header.
 *
 * @example
 * ```tsx
 * <Navbar />
 * ```
 */
export function Navbar() {
  return (
    <header className='border-border bg-background/80 sticky top-0 z-10 flex w-full items-center justify-between border-b px-4 py-4 backdrop-blur-sm'>
      <div className='flex items-center gap-4'>
        <Image
          src='/eep-logo-nav.svg'
          alt='EEP'
          width={120}
          height={40}
          priority
        />
        <div className='flex items-center gap-1'>
          {env.NEXT_PUBLIC_DOCS_URL && (
            <Button asChild variant='link' className='text-muted-foreground'>
              <a
                href={env.NEXT_PUBLIC_DOCS_URL}
                target='_blank'
                rel='noopener noreferrer'
              >
                <FileText />
                Repo Docs
              </a>
            </Button>
          )}
          <Button asChild variant='link' className='text-muted-foreground'>
            <a
              href='/api-docs'
              target='_blank'
              rel='noopener noreferrer'
              title='Requires the Admin role - others get a 403'
            >
              <BookOpen />
              API docs
            </a>
          </Button>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <HomeProfile />
        <ThemeToggle />
        <TimezoneSelector />
      </div>
    </header>
  );
}
