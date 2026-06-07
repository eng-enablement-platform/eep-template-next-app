'use server';

import { revalidatePath } from 'next/cache';

import { exampleItemService } from '@/classes/example-item';
import { rootLogger } from '@/classes/loggers/application';
import type { ExampleItem } from '@/db/types';
import {
  exampleItemSchema,
  exampleItemUpdateSchema,
} from '@/validation/example-item';

/**
 * Example Item Server Actions
 *
 * The template's recommended write path: mutations triggered from our own UI go
 * through these `'use server'` actions rather than the REST route handlers.
 * They share the exact Zod schemas the routes use (`@/validation/example-item`), so the
 * two write surfaces can never validate differently.
 *
 * Each action returns a discriminated `ActionResult` so a client can branch on
 * success vs validation failure (e.g. with `useActionState`) without throwing.
 */

const logger = rootLogger('action');

/**
 * Field-level validation errors keyed by field name, as produced by Zod's
 * `flatten().fieldErrors`.
 */
type FieldErrors = Record<string, string[] | undefined>;

/**
 * The outcome of a mutation action: either the resulting data or a structured
 * error a form can render.
 */
export type ActionResult<TData> =
  | { ok: true; data: TData }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

/**
 * Create an example item.
 *
 * @param input - Raw, untrusted create input; validated by `exampleItemSchema`.
 * @returns The created item, or a validation error result.
 */
export async function createExampleItem(
  input: unknown,
): Promise<ActionResult<ExampleItem>> {
  const parsed = exampleItemSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = await exampleItemService.create(parsed.data);
  logger.info({ message: 'Example item created via action', id: data.id });

  revalidatePath('/');

  return { ok: true, data };
}

/**
 * Update an example item.
 *
 * @param id - The id of the item to update.
 * @param input - Raw, untrusted partial input; validated by `exampleItemUpdateSchema`.
 * @returns The updated item, a validation error, or a not-found error.
 */
export async function updateExampleItem(
  id: number,
  input: unknown,
): Promise<ActionResult<ExampleItem>> {
  const parsed = exampleItemUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = await exampleItemService.update(id, parsed.data);

  if (data === null) {
    return { ok: false, error: 'Example item not found' };
  }

  logger.info({ message: 'Example item updated via action', id });

  revalidatePath('/');

  return { ok: true, data };
}

/**
 * Delete an example item.
 *
 * @param id - The id of the item to delete.
 * @returns A success result, or a not-found error.
 */
export async function deleteExampleItem(
  id: number,
): Promise<ActionResult<{ id: number }>> {
  const deleted = await exampleItemService.delete(id);

  if (!deleted) {
    return { ok: false, error: 'Example item not found' };
  }

  logger.info({ message: 'Example item deleted via action', id });

  revalidatePath('/');

  return { ok: true, data: { id } };
}
