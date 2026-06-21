import { BookOpen, FileText } from 'lucide-react';

import { ThemeToggle } from '@/components/common/theme-toggle';
import { Counter } from '@/components/features/counter';
import { HomeProfile } from '@/components/features/home-profile';
import { Posts } from '@/components/features/posts';
import { Button } from '@/components/ui/button';

/**
 * EXAMPLE ENTRY POINT
 *
 * Replace this with your real landing page.
 */
export default function Home() {
  return (
    <div className='bg-background relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6'>
      <div
        aria-hidden
        className='bg-foreground/3 pointer-events-none absolute top-1/2 left-1/2 -z-10 size-160 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl'
      />

      <header className='absolute inset-x-0 top-0 flex items-center justify-between p-4'>
        {/* Left nav — external links that open in new tabs. Both /api-docs
            (Swagger UI) and the docs site are separate documents, not App
            Router pages; navigating the SPA to them and back unmounts Clerk's
            client and leaves the auth gate stuck on a dead spinner. */}
        <div className='flex items-center gap-1'>
          {process.env.NEXT_PUBLIC_DOCS_URL && (
            <Button asChild variant='link' className='text-muted-foreground'>
              <a
                href={process.env.NEXT_PUBLIC_DOCS_URL}
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
              title='Requires the Admin role — others get a 403'
            >
              <BookOpen />
              API docs
            </a>
          </Button>
          {/* DOCS LINK — rendered only when NEXT_PUBLIC_DOCS_URL is set.
           */}
        </div>
        <div className='flex items-center gap-3'>
          <HomeProfile />
          <ThemeToggle />
        </div>
      </header>

      <main className='flex w-full max-w-xl flex-col items-center gap-8 text-center'>
        <div className='flex flex-col items-center gap-4'>
          <span className='border-border bg-muted/50 text-muted-foreground inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide'>
            Next.js Template
          </span>
          <h1 className='text-foreground text-5xl font-bold tracking-tight text-balance sm:text-6xl'>
            Ready to build
          </h1>
          <p className='text-muted-foreground max-w-md text-lg leading-relaxed text-pretty'>
            A working scaffold with auth and state wired in. Replace this page
            to make it yours.
          </p>
        </div>

        <div className='border-border bg-card/50 mt-2 w-full rounded-xl border p-8 shadow-md backdrop-blur-sm'>
          <Counter />
        </div>

        <div className='border-border bg-card/50 w-full rounded-xl border p-8 shadow-md backdrop-blur-sm'>
          <p className='text-muted-foreground mb-4 text-xs font-medium tracking-wide uppercase'>
            Recent posts (SWR example)
          </p>
          <Posts />
        </div>
      </main>
    </div>
  );
}
