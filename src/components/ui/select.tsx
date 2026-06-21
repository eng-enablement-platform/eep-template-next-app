'use client';

import * as React from 'react';

import { cn } from '@/utils/tailwind-merge';

/**
 * Styled native select primitive, consistent with the shadcn/ui design system.
 * Forwards all standard HTML select props.
 *
 * @example
 * ```tsx
 * <Select name='status'>
 *   <option value='draft'>Draft</option>
 *   <option value='active'>Active</option>
 * </Select>
 * ```
 */
function Select({
  className,
  children,
  ...props
}: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot='select'
      className={cn(
        'border-input bg-background text-foreground focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
