'use client';

import { Counter } from '@/components/features/counter';
import { ExampleItems } from '@/components/features/example-items';
import { Posts } from '@/components/features/posts';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/**
 * EXAMPLE COMPONENT
 *
 * Collapsible accordion wrappers for the landing page demo components.
 *
 * Keeps the page tidy by default — visitors can expand only what they're
 * interested in. Each item maps to one of the three scaffold demo features:
 * the Zustand counter, the SWR-fetched posts list, and the full-CRUD example
 * items panel.
 *
 * @example
 * ```tsx
 * <DemoAccordions />
 * ```
 */
export function DemoAccordions() {
  return (
    <Accordion
      type='multiple'
      className='border-border bg-card/50 w-full rounded-xl border shadow-md backdrop-blur-sm'
    >
      <AccordionItem value='counter' className='px-8 not-last:border-b'>
        <AccordionTrigger className='text-sm font-medium'>
          <span className='flex flex-col gap-0.5'>
            <span>Counter</span>
            <span className='text-muted-foreground text-xs font-normal tracking-normal normal-case'>
              Zustand · client state
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className='h-auto!'>
          <Counter />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value='posts' className='px-8 not-last:border-b'>
        <AccordionTrigger className='text-sm font-medium'>
          <span className='flex flex-col gap-0.5'>
            <span>Recent posts</span>
            <span className='text-muted-foreground text-xs font-normal tracking-normal normal-case'>
              SWR · external API
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className='h-auto!'>
          <Posts />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value='example-items' className='px-8'>
        <AccordionTrigger className='text-sm font-medium'>
          <span className='flex flex-col gap-0.5'>
            <span>Example items</span>
            <span className='text-muted-foreground text-xs font-normal tracking-normal normal-case'>
              Full CRUD · Drizzle + Postgres
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className='h-auto!'>
          <ExampleItems />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
