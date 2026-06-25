import { Counter } from '@/components/features/counter';
import { ExampleItems } from '@/components/features/example-items';
import { Posts } from '@/components/features/posts';

/**
 * EXAMPLE ENTRY POINT
 *
 * Replace this with your real landing page.
 */
export default function Home() {
  return (
    <div className='bg-background relative flex flex-1 flex-col items-center overflow-hidden px-6 py-12'>
      <div
        aria-hidden
        className='bg-foreground/3 pointer-events-none absolute top-1/2 left-1/2 -z-10 size-160 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl'
      />

      <main className='flex w-full max-w-6xl flex-col gap-8'>
        <div className='flex flex-col items-center gap-4 text-center'>
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

        <div className='grid w-full grid-cols-1 items-start gap-4 md:grid-cols-1'>
          <div className='border-border bg-card/50 rounded-xl border p-8 shadow-md backdrop-blur-sm'>
            <p className='text-muted-foreground mb-4 text-center text-xs font-medium tracking-wide uppercase'>
              Example items (full CRUD)
            </p>
            <ExampleItems />
          </div>
          <div className='border-border bg-card/50 rounded-xl border p-8 shadow-md backdrop-blur-sm'>
            <p className='text-muted-foreground mb-4 text-left text-xs font-medium tracking-wide uppercase'>
              Recent posts (SWR · external API)
            </p>
            <Posts />
          </div>
        </div>
      </main>
    </div>
  );
}
