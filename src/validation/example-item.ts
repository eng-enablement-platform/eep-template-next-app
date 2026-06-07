import { z } from 'zod';

/**
 * Example Item Validation Schemas
 *
 * The single source of truth for `example_items` input validation. Both the
 * REST route handlers and the server actions import these schemas, so the read
 * surface and the write surface cannot validate differently. This is the
 * boundary validation the architecture mandates — untrusted input is parsed
 * here before it reaches the service layer.
 */

/**
 * Allowed lifecycle states for an example item. Kept in step with the
 * `example_item_status` pgEnum in `schema.ts`.
 */
export const exampleItemStatusValues = ['draft', 'active', 'archived'] as const;

/**
 * Validates the body for creating an example item.
 *
 * Mirrors the writable columns of `example_items` (everything except the
 * generated `id` and `createdAt`). Demonstrates required vs optional fields,
 * numeric coercion, and enum validation in one place.
 */
export const exampleItemSchema = z.object({
  name: z.string().min(1, 'name is required').max(255),
  description: z.string().max(2000).optional(),
  quantity: z.coerce.number().int().min(0).default(0),
  status: z.enum(exampleItemStatusValues).default('draft'),
});

/**
 * Validates the body for a partial update (PATCH). Every field is optional so
 * callers can send only what changed.
 */
export const exampleItemUpdateSchema = exampleItemSchema.partial();

/**
 * Parsed, validated input for creating an example item.
 */
export type ExampleItemInput = z.infer<typeof exampleItemSchema>;

/**
 * Parsed, validated input for updating an example item.
 */
export type ExampleItemUpdateInput = z.infer<typeof exampleItemUpdateSchema>;
