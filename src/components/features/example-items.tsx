'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import {
  createExampleItem,
  deleteExampleItem,
  updateExampleItem,
} from '@/actions/example-item-actions';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { ExampleItem } from '@/db/types';
import { useExampleItems } from '@/hooks/use-example-items';
import { formatDate, parseDateSafe } from '@/utils/dates';
import type {
  ExampleItemInput,
  ExampleItemUpdateInput,
} from '@/validation/example-item';
import {
  exampleItemSchema,
  exampleItemStatusValues,
  exampleItemUpdateSchema,
} from '@/validation/example-item';

/*
 * The shared Zod schema uses `z.coerce.number()` for `quantity` so it can
 * accept raw strings from FormData (server action path). Zod 4 types this
 * field's input as `unknown` rather than `number`, which confuses
 * react-hook-form's type checking.
 *
 * In practice the browser input already gives us a real number via `valueAsNumber`
 * before Zod ever runs, so there is no actual problem — just a TypeScript mismatch.
 *
 * We define local form types with `quantity: number`
 * and cast the resolver to match them.
 */
type CreateFormValues = Omit<ExampleItemInput, 'quantity'> & {
  quantity: number;
};
type UpdateFormValues = Omit<ExampleItemUpdateInput, 'quantity'> & {
  quantity: number;
};

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
 *
 * @example
 * ```tsx
 * <ExampleItems />
 * ```
 */
export function ExampleItems() {
  const { items, isLoading, error, mutate } = useExampleItems();

  return (
    <div className='flex flex-col gap-6'>
      <CreateForm mutate={mutate} />
      <ItemList
        items={items}
        isLoading={isLoading}
        error={error}
        mutate={mutate}
      />
    </div>
  );
}

/*
 * ---------------------------------------------------------------------------
 * Mutate type alias
 * ---------------------------------------------------------------------------
 */

type MutateFn = ReturnType<typeof useExampleItems>['mutate'];

/*
 * ---------------------------------------------------------------------------
 * Create form
 * ---------------------------------------------------------------------------
 */

type CreateFormProps = { mutate: MutateFn };

function CreateForm({ mutate }: CreateFormProps) {
  const form = useForm<CreateFormValues>({
    /*
     * Cast needed because of the Zod 4 coerce mismatch explained above.
     * This is a type-level fix only — behaviour is unchanged.
     */
    resolver: zodResolver(exampleItemSchema) as Resolver<CreateFormValues>,
    defaultValues: {
      name: '',
      description: '',
      quantity: 0,
      status: 'draft',
      expiresAt: undefined,
    },
  });

  async function onSubmit(values: CreateFormValues) {
    await mutate(
      async (current) => {
        const result = await createExampleItem(values);
        if (!result.ok) {
          form.setError('root', { message: result.error });
          return current;
        }
        return {
          exampleItems: [...(current?.exampleItems ?? []), result.data],
        };
      },
      { revalidate: true },
    );

    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-4'
      >
        <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
          Add item
        </p>

        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Item name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder='Optional description' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex gap-3'>
          <FormField
            control={form.control}
            name='quantity'
            render={({ field }) => (
              <FormItem className='w-28'>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='status'
            render={({ field }) => (
              <FormItem className='flex-1'>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select {...field}>
                    {exampleItemStatusValues.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='expiresAt'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry date</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder='Pick an expiry date (optional)'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className='text-destructive text-xs'>
            {form.formState.errors.root.message}
          </p>
        )}

        <Button
          type='submit'
          size='sm'
          disabled={form.formState.isSubmitting}
          className='self-end'
        >
          {form.formState.isSubmitting && <Loader2 className='animate-spin' />}
          Add item
        </Button>
      </form>
    </Form>
  );
}

/*
 * ---------------------------------------------------------------------------
 * Item list
 * ---------------------------------------------------------------------------
 */

type ItemListProps = {
  items: ExampleItem[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: MutateFn;
};

function ItemList({ items, isLoading, error, mutate }: ItemListProps) {
  if (isLoading) {
    return (
      <div className='flex flex-col gap-2'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='bg-muted animate-pulse rounded-lg p-3'>
            <div className='bg-muted-foreground/20 mb-2 h-3 w-1/3 rounded' />
            <div className='bg-muted-foreground/20 h-3 w-2/3 rounded' />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className='text-destructive text-sm'>
        Failed to load items: {error.message}
      </p>
    );
  }

  if (!items?.length) {
    return (
      <p className='text-muted-foreground text-sm'>
        No items yet — add one above.
      </p>
    );
  }

  return (
    <ul className='flex flex-col gap-2'>
      {items.map((item) => (
        <ItemRow key={item.id} item={item} mutate={mutate} />
      ))}
    </ul>
  );
}

/*
 * ---------------------------------------------------------------------------
 * Individual item row — view and inline edit modes
 * ---------------------------------------------------------------------------
 */

type ItemRowProps = { item: ExampleItem; mutate: MutateFn };

function ItemRow({ item, mutate }: ItemRowProps) {
  const [editing, setEditing] = useState<boolean>(false);

  if (editing) {
    return (
      <EditRow item={item} mutate={mutate} onCancel={() => setEditing(false)} />
    );
  }

  return (
    <ViewRow item={item} mutate={mutate} onEdit={() => setEditing(true)} />
  );
}

// -- View mode --------------------------------------------------------------

type ViewRowProps = { item: ExampleItem; mutate: MutateFn; onEdit: () => void };

function ViewRow({ item, mutate, onEdit }: ViewRowProps) {
  const [isPending, setIsPending] = useState<boolean>(false);

  async function handleDelete() {
    setIsPending(true);

    await mutate(
      async (current) => {
        const result = await deleteExampleItem(item.id);
        if (!result.ok) return current;
        return {
          exampleItems: (current?.exampleItems ?? []).filter(
            (i) => i.id !== item.id,
          ),
        };
      },
      {
        optimisticData: (current) => ({
          exampleItems: (current?.exampleItems ?? []).filter(
            (i) => i.id !== item.id,
          ),
        }),
        rollbackOnError: true,
        revalidate: false,
      },
    );

    setIsPending(false);
  }

  return (
    <li className='border-border bg-muted/30 flex items-center gap-3 rounded-lg border px-3 py-2.5'>
      <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
        <span className='text-foreground truncate text-sm font-medium'>
          {item.name}
        </span>
        <span className='text-muted-foreground text-xs'>
          qty {item.quantity} · {item.status}
          {item.expiresAt && (
            <>
              {' · expires '}
              {formatDate(parseDateSafe(item.expiresAt)!, 'display')}
            </>
          )}
        </span>
      </div>
      <div className='flex shrink-0 gap-1'>
        <Button
          size='icon-sm'
          variant='ghost'
          onClick={onEdit}
          aria-label='Edit item'
        >
          <Pencil />
        </Button>
        <Button
          size='icon-sm'
          variant='ghost'
          onClick={handleDelete}
          disabled={isPending}
          aria-label='Delete item'
          className='text-destructive hover:text-destructive'
        >
          {isPending ? <Loader2 className='animate-spin' /> : <Trash2 />}
        </Button>
      </div>
    </li>
  );
}

// -- Edit mode --------------------------------------------------------------

type EditRowProps = {
  item: ExampleItem;
  mutate: MutateFn;
  onCancel: () => void;
};

function EditRow({ item, mutate, onCancel }: EditRowProps) {
  const form = useForm<UpdateFormValues>({
    // Same Zod 4 coerce/resolver interop cast as CreateForm above.
    resolver: zodResolver(
      exampleItemUpdateSchema,
    ) as Resolver<UpdateFormValues>,
    defaultValues: {
      name: item.name,
      description: item.description ?? '',
      quantity: item.quantity,
      status: item.status,
      expiresAt: item.expiresAt ?? undefined,
    },
  });

  async function onSubmit(values: UpdateFormValues) {
    const optimisticItem: ExampleItem = {
      ...item,
      ...values,
      // The form uses '' for an empty description; the DB type is string | null.
      description: values.description || null,
      expiresAt: values.expiresAt ?? null,
    };

    await mutate(
      async (current) => {
        const result = await updateExampleItem(item.id, values);
        if (!result.ok) {
          form.setError('root', { message: result.error });
          return current;
        }
        return {
          exampleItems: (current?.exampleItems ?? []).map((i) =>
            i.id === item.id ? result.data : i,
          ),
        };
      },
      {
        optimisticData: (current) => ({
          exampleItems: (current?.exampleItems ?? []).map((i) =>
            i.id === item.id ? optimisticItem : i,
          ),
        }),
        rollbackOnError: true,
        revalidate: false,
      },
    );

    onCancel();
  }

  return (
    <li className='border-border bg-muted/30 rounded-lg border px-3 py-2.5'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col gap-3'
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder='Description (optional)' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex gap-2'>
            <FormField
              control={form.control}
              name='quantity'
              render={({ field }) => (
                <FormItem className='w-24'>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormControl>
                    <Select {...field}>
                      {exampleItemStatusValues.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='expiresAt'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='Expiry date (optional)'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p className='text-destructive text-xs'>
              {form.formState.errors.root.message}
            </p>
          )}

          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              size='sm'
              variant='ghost'
              onClick={onCancel}
              disabled={form.formState.isSubmitting}
            >
              <X />
              Cancel
            </Button>
            <Button
              type='submit'
              size='sm'
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className='animate-spin' />
              )}
              Save
            </Button>
          </div>
        </form>
      </Form>
    </li>
  );
}
