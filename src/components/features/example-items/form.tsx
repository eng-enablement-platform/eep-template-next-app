'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import type { Control, Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { createExampleItem } from '@/actions/example-item-actions';
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
import type { useExampleItems } from '@/hooks/use-example-items';
import { DEMO_LOCALES, useTimezoneStore } from '@/store/timezone-store';
import type { exampleItemUpdateSchema } from '@/validation/example-item';
import {
  exampleItemSchema,
  exampleItemStatusValues,
} from '@/validation/example-item';

/*
 * Both forms share the same field shape - the create and update Zod schemas
 * differ only in which fields are required vs optional, not in field names or
 * types. A single form values type covers both, and the resolver cast is
 * applied once via the helper below.
 *
 * The `quantity` override exists because z.coerce.number() is typed as
 * `unknown` input in Zod 4, which confuses react-hook-form's type inference.
 * The browser already gives us a real number via `valueAsNumber` before Zod
 * runs, so this is a type-level fix only - no runtime impact.
 */
export type ItemFormValues = {
  name: string;
  description?: string;
  quantity: number;
  status: 'draft' | 'active' | 'archived';
  expiresAt?: string;
};

/*
 * Wraps zodResolver and applies the ItemFormValues cast once so neither form
 * needs to repeat the cast + comment inline.
 */
export const createResolver = (
  schema: typeof exampleItemSchema | typeof exampleItemUpdateSchema,
): Resolver<ItemFormValues> => zodResolver(schema) as Resolver<ItemFormValues>;

/*
 * The 5 field blocks shared between CreateForm and EditRow. Accepts the
 * react-hook-form `control` from whichever form is rendering it.
 */

type ItemFormFieldsProps = {
  control: Control<ItemFormValues>;
  /** Shows labels - omitted in the compact edit row where labels add noise. */
  showLabels?: boolean;
};

export function ItemFormFields({
  control,
  showLabels = true,
}: ItemFormFieldsProps) {
  const selectedTimezone = useTimezoneStore((state) => state.selectedTimezone);
  return (
    <>
      <FormField
        control={control}
        name='name'
        render={({ field }) => (
          <FormItem>
            {showLabels && <FormLabel>Name</FormLabel>}
            <FormControl>
              <Input placeholder='Item name' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name='description'
        render={({ field }) => (
          <FormItem>
            {showLabels && <FormLabel>Description</FormLabel>}
            <FormControl>
              <Input placeholder='Optional description' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className={showLabels ? 'flex gap-3' : 'flex gap-2'}>
        <FormField
          control={control}
          name='quantity'
          render={({ field }) => (
            <FormItem className={showLabels ? 'w-28' : 'w-24'}>
              {showLabels && <FormLabel>Quantity</FormLabel>}
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
          control={control}
          name='status'
          render={({ field }) => (
            <FormItem className='flex-1'>
              {showLabels && <FormLabel>Status</FormLabel>}
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
        control={control}
        name='expiresAt'
        render={({ field }) => {
          /*
           * Build a noon-UTC Date so the hint shows locale/format differences
           * rather than the midnight rollback. The rollback demo lives in the
           * item list - here we want to demonstrate formatting conventions only.
           */
          const noonUtc = field.value
            ? new Date(`${field.value}T12:00:00Z`)
            : null;

          const localeFormats = noonUtc
            ? DEMO_LOCALES.map((loc) => ({
                ...loc,
                formatted: new Intl.DateTimeFormat(loc.value, {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  timeZone: selectedTimezone,
                }).format(noonUtc),
              }))
            : null;

          return (
            <FormItem>
              {showLabels && <FormLabel>Expiry date</FormLabel>}
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={
                    showLabels
                      ? 'Pick an expiry date (optional)'
                      : 'Expiry date (optional)'
                  }
                />
              </FormControl>
              <FormMessage />
              {showLabels && field.value && localeFormats && (
                <div className='border-border bg-muted/30 rounded-md border p-3 text-xs'>
                  <div className='mb-2.5 flex items-center justify-between'>
                    <span className='text-muted-foreground font-medium tracking-wide uppercase'>
                      Date format preview
                    </span>
                    <span className='text-muted-foreground/60 font-mono'>
                      {selectedTimezone}
                    </span>
                  </div>
                  <div className='mb-2.5 flex items-center justify-between'>
                    <span className='text-muted-foreground'>Stored in DB</span>
                    <span className='text-foreground font-mono font-medium'>
                      {field.value}
                    </span>
                  </div>
                  <div className='border-border border-t pt-2.5'>
                    <p className='text-muted-foreground mb-1.5 font-medium'>
                      Locale formats
                    </p>
                    <table className='w-full'>
                      <thead>
                        <tr className='text-muted-foreground/60'>
                          <th className='pb-1 text-left font-normal'>Locale</th>
                          <th className='pb-1 text-left font-normal'>
                            Convention
                          </th>
                          <th className='pb-1 text-right font-normal'>
                            Formatted
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-border divide-y'>
                        {localeFormats.map((loc) => (
                          <tr key={loc.value} className='text-muted-foreground'>
                            <td className='py-1 font-mono'>{loc.label}</td>
                            <td className='py-1 font-mono text-xs opacity-60'>
                              {loc.format}
                            </td>
                            <td className='py-1 text-right font-mono'>
                              {loc.formatted}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className='text-muted-foreground/60 mt-2 leading-relaxed'>
                      ⚠ en-US swaps day and month - sending a date string to an
                      external API without normalising to YYYY-MM-DD first is
                      how invalid dates silently corrupt data.
                    </p>
                  </div>
                </div>
              )}
            </FormItem>
          );
        }}
      />
    </>
  );
}

/*
 * Create form - handles the add-item mutation with optimistic SWR update.
 */

type MutateFn = ReturnType<typeof useExampleItems>['mutate'];

type CreateFormProps = { mutate: MutateFn };

export function CreateForm({ mutate }: CreateFormProps) {
  const form = useForm<ItemFormValues>({
    resolver: createResolver(exampleItemSchema),
    defaultValues: {
      name: '',
      description: '',
      quantity: 0,
      status: 'draft',
      expiresAt: undefined,
    },
  });

  async function onSubmit(values: ItemFormValues) {
    await mutate(
      async (current) => {
        const result = await createExampleItem(values);
        if (!result.ok) {
          form.setError('root', { message: result.error });
          toast.error('Failed to create item', { description: result.error });
          return current;
        }
        toast.success('Item created', {
          description: `"${result.data.name}" was added successfully.`,
        });
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
        <ItemFormFields control={form.control} showLabels />

        {form.formState.errors.root && (
          <p className='text-destructive text-xs'>
            {form.formState.errors.root.message}
          </p>
        )}

        <div className='flex justify-between'>
          <Button
            type='button'
            size='sm'
            variant='destructive'
            onClick={() => form.reset()}
            disabled={form.formState.isSubmitting}
          >
            Reset
          </Button>
          <Button
            type='submit'
            size='sm'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className='animate-spin' />
            )}
            Add item
          </Button>
        </div>
      </form>
    </Form>
  );
}
