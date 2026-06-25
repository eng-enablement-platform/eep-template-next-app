'use client';

import { Loader2, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  deleteExampleItem,
  updateExampleItem,
} from '@/actions/example-item-actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import type { ExampleItem } from '@/db/types';
import type { useExampleItems } from '@/hooks/use-example-items';
import { useTimezoneStore } from '@/store/timezone-store';
import { formatDate, parseDateSafe } from '@/utils/dates';
import { exampleItemUpdateSchema } from '@/validation/example-item';

import type { ItemFormValues } from './form';
import { createResolver, ItemFormFields } from './form';

type MutateFn = ReturnType<typeof useExampleItems>['mutate'];

/*
 * Item list — renders loading skeletons, error state, empty state, or the
 * list of item rows.
 */

type ItemListProps = {
  items: ExampleItem[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: MutateFn;
};

export function ItemList({ items, isLoading, error, mutate }: ItemListProps) {
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
 * Individual item row — switches between view and inline edit mode.
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

/*
 * View mode — displays item details with edit and delete actions.
 * Delete opens a confirmation dialog before executing the mutation.
 */

type ViewRowProps = { item: ExampleItem; mutate: MutateFn; onEdit: () => void };

function ViewRow({ item, mutate, onEdit }: ViewRowProps) {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const selectedTimezone = useTimezoneStore((state) => state.selectedTimezone);

  async function handleDelete() {
    setIsPending(true);

    await mutate(
      async (current) => {
        const result = await deleteExampleItem(item.id);
        if (!result.ok) {
          toast.error('Failed to delete item', {
            description: `Could not delete "${item.name}".`,
          });
          return current;
        }
        toast.success('Item deleted', {
          description: `"${item.name}" was removed.`,
        });
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
    setShowDeleteDialog(false);
  }

  return (
    <>
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
                {formatDate(
                  parseDateSafe(item.expiresAt)!,
                  'display',
                  selectedTimezone,
                )}
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
            onClick={() => setShowDeleteDialog(true)}
            disabled={isPending}
            aria-label='Delete item'
            className='text-destructive hover:text-destructive'
          >
            {isPending ? <Loader2 className='animate-spin' /> : <Trash2 />}
          </Button>
        </div>
      </li>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className='text-foreground font-medium'>
                &ldquo;{item.name}&rdquo;
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowDeleteDialog(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending && <Loader2 className='animate-spin' />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/*
 * Edit mode — inline edit form with optimistic SWR update and rollback.
 */

type EditRowProps = {
  item: ExampleItem;
  mutate: MutateFn;
  onCancel: () => void;
};

function EditRow({ item, mutate, onCancel }: EditRowProps) {
  const form = useForm<ItemFormValues>({
    resolver: createResolver(exampleItemUpdateSchema),
    defaultValues: {
      name: item.name,
      description: item.description ?? '',
      quantity: item.quantity,
      status: item.status,
      expiresAt: item.expiresAt ?? undefined,
    },
  });

  async function onSubmit(values: ItemFormValues) {
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
          toast.error('Failed to update item', { description: result.error });
          return current;
        }
        toast.success('Item updated', {
          description: `"${result.data.name}" was saved.`,
        });
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
          <ItemFormFields control={form.control} showLabels={false} />

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
