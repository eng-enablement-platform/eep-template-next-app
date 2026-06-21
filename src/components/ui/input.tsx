import * as React from 'react';

import { cn } from '@/utils/tailwind-merge';

/**
 * Styled text input primitive, consistent with the shadcn/ui design system.
 * Drop-in replacement for a native `<input>` — all standard HTML input props
 * are forwarded unchanged.
 *
 * @example
 * ```tsx
 * <Input name='email' type='email' placeholder='you@example.com' />
 * ```
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
