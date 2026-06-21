'use client';

import * as React from 'react';

import { cn } from '@/utils/tailwind-merge';

/**
 * Styled label primitive, consistent with the shadcn/ui design system.
 * Forwards all standard HTML label props.
 *
 * @example
 * ```tsx
 * <Label htmlFor='email'>Email address</Label>
 * ```
 */
function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot='label'
      className={cn(
        'text-foreground flex items-center gap-2 text-sm leading-none font-medium select-none group-data-disabled:pointer-events-none group-data-disabled:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Label };
