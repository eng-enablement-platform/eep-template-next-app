'use client';

import { ChevronDown } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cn } from '../lib/cn';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

/**
 * A numbered step that can be expanded or collapsed.
 * Mirrors the visual style of Fumadocs' `<Step>` component but adds
 * a clickable trigger on the heading so the body can be hidden.
 */
export interface CollapsibleStepProps {
  /** Step heading shown in the trigger bar. */
  title: string;
  children: ReactNode;
  /** Open by default. Defaults to true. */
  defaultOpen?: boolean;
}

export function CollapsibleStep({
  title,
  children,
  defaultOpen = true,
}: CollapsibleStepProps) {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  return (
    <div className='fd-step'>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className='group flex w-full items-center gap-2 text-left'>
          <span className='flex-1 font-medium'>{title}</span>
          <ChevronDown
            className={cn(
              'text-fd-muted-foreground size-4 shrink-0 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className='mt-3'>{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/**
 * Wrapper that sets up the CSS step counter, matching Fumadocs' `<Steps>`.
 * Use with `<CollapsibleStep>` children instead of `<Step>`.
 */
export function CollapsibleSteps({ children }: { children: ReactNode }) {
  return <div className='fd-steps'>{children}</div>;
}
