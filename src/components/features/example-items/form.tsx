'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import type { Control, Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';

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
import type { exampleItemUpdateSchema } from '@/validation/example-item';
import {
  exampleItemSchema,
  exampleItemStatusValues,
} from '@/validation/example-item';

/*
 * Both forms share the same field shape — the create and update Zod schemas
 * differ only in which fields are required vs optional, not in field names or
 * types. A single form values type covers both, and the resolver cast is
 * applied once via the helper below.
 *
 * The `quantity` override exists because z.coerce.number() is typed as
 * `unknown` input in Zod 4, which confuses react-hook-form's type inference.
 * The browser already gives us a real number via `valueAsNumber` before Zod
 * runs, so this is a type-level fix only — no runtime impact.
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
  /** Shows labels — omitted in the compact edit row where labels add noise. */
  showLabels?: boolean;
};

export function ItemFormFields({
  control,
  showLabels = true,
}: ItemFormFieldsProps) {
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
        render={({ field }) => (
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
          </FormItem>
        )}
      />
    </>
  );
}

/*
 * Create form — handles the add-item mutation with optimistic SWR update.
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

        <ItemFormFields control={form.control} showLabels />

        {form.formState.errors.root && (
          <p className='text-destructive text-xs'>
            {form.formState.errors.root.message}
          </p>
        )}

        <Button
          type='submit'
          size='sm'
          disabled={form.formState.isSubmitting}
          className='self-start'
        >
          {form.formState.isSubmitting && <Loader2 className='animate-spin' />}
          Add item
        </Button>
      </form>
    </Form>
  );
}
