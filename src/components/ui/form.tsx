'use client';

import { Slot } from 'radix-ui';
import * as React from 'react';
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import { Controller, FormProvider, useFormContext } from 'react-hook-form';

import { Label } from '@/components/ui/label';
import { cn } from '@/utils/tailwind-merge';

/*
 * ---------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------------
 */

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = { name: TName };

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

type FormItemContextValue = { id: string };

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

/*
 * ---------------------------------------------------------------------------
 * Hook
 * ---------------------------------------------------------------------------
 */

/**
 * Returns the ids and aria attributes needed to wire a form field, item,
 * label, description, and message together accessibly.
 */
function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField must be used within a <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

/*
 * ---------------------------------------------------------------------------
 * Components
 * ---------------------------------------------------------------------------
 */

/** Root form context provider — wrap your `<form>` with this. */
const Form = FormProvider;

/**
 * Registers a single field with react-hook-form via `<Controller>` and
 * provides the field name through context so child `<FormItem>` components
 * can resolve their own aria attributes.
 */
function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

/**
 * Container for a single form field — provides the item `id` used by label,
 * input, description, and message to build matching `htmlFor` / `aria-*`
 * attribute chains.
 */
function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot='form-item'
        className={cn('flex flex-col gap-1.5', className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

/**
 * Label bound to the field via `htmlFor`. Automatically marks itself
 * `data-error` when the field has an error so you can style invalid labels.
 */
function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot='form-label'
      data-error={!!error}
      className={cn('data-error:text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

/**
 * Passes the correct `id`, `aria-describedby`, and `aria-invalid` directly
 * onto its single child input via Radix `Slot`. The child must accept and
 * forward standard HTML attributes.
 */
function FormControl({ ...props }: React.ComponentProps<typeof Slot.Root>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot.Root
      data-slot='form-control'
      id={formItemId}
      aria-describedby={
        !error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

/**
 * Optional helper text shown below the input when there is no error.
 */
function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot='form-description'
      id={formDescriptionId}
      className={cn('text-muted-foreground text-xs', className)}
      {...props}
    />
  );
}

/**
 * Validation error message for the field. Renders nothing when the field is
 * valid — no need to conditionally render it yourself.
 */
function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? '') : props.children;

  if (!body) return null;

  return (
    <p
      data-slot='form-message'
      id={formMessageId}
      className={cn('text-destructive text-xs', className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
