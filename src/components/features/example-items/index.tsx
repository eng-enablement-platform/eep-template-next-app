'use client';

import { useExampleItems } from '@/hooks/use-example-items';

import { CreateForm } from './form';
import { ItemList } from './item-row';

/**
 * EXAMPLE COMPONENT
 *
 * Full CRUD demonstration wired to the real database. Shows the complete
 * react-hook-form + Zod + server action loop in one place: form validation
 * client-side via the shared Zod schema → server action → service → DB →
 * SWR optimistic update → UI reflects the change instantly.
 *
 * Patterns demonstrated:
 * - react-hook-form with `zodResolver` sharing the same schema as the server action
 * - SWR optimistic updates via `mutate` with `rollbackOnError`
 * - Field-level error rendering via shadcn `<Form>` primitives
 * - Inline edit mode per row
 * - Feature folder split: form.tsx / item-row.tsx / index.tsx
 *
 * @example
 * ```tsx
 * <ExampleItems />
 * ```
 */
export function ExampleItems() {
  const { items, isLoading, error, mutate } = useExampleItems();

  return (
    <div className='grid grid-cols-2 gap-4'>
      <div className='border-border bg-muted/20 rounded-lg border p-4'>
        <p className='text-muted-foreground mb-4 text-xs font-medium tracking-wide uppercase'>
          Item form
        </p>
        <CreateForm mutate={mutate} />
      </div>
      <div className='border-border bg-muted/20 rounded-lg border p-4'>
        <p className='text-muted-foreground mb-4 text-xs font-medium tracking-wide uppercase'>
          Items
        </p>
        <ItemList
          items={items}
          isLoading={isLoading}
          error={error}
          mutate={mutate}
        />
      </div>
    </div>
  );
}
