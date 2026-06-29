/*
 * Importing `zod-openapi` for its side effect: it augments Zod's `.meta()`
 * type so the OpenAPI-specific keys (`id`, `param`, `example`, ...) used below
 * type-check. No runtime behaviour is added by the import.
 */
import 'zod-openapi';

import { z } from 'zod';

/**
 * Example Item Validation Schemas
 *
 * The single source of truth for `example_items` input validation. Both the
 * REST route handlers and the server actions import these schemas, so the read
 * surface and the write surface cannot validate differently. This is the
 * boundary validation the architecture mandates - untrusted input is parsed
 * here before it reaches the service layer.
 *
 * The `.meta()` annotations make these schemas double as the OpenAPI contract:
 * `src/lib/openapi` feeds them to `createDocument`, so the docs, the validator,
 * and the column shape all derive from this one file and cannot drift.
 */

/**
 * Allowed lifecycle states for an example item. Kept in step with the
 * `example_item_status` pgEnum in `schema.ts`.
 */
export const exampleItemStatusValues = ['draft', 'active', 'archived'] as const;

/**
 * The writable columns of `example_items`, with **no defaults applied**.
 *
 * This is the shared base both the create and update schemas are built from.
 * Keeping it default-free is deliberate: the update (PATCH) schema is
 * `.partial()` of this base, and in Zod a `.default()` still fills an *absent*
 * key on parse - so a default on the base would silently reappear on a partial
 * update (e.g. `PATCH { status }` would reset `quantity` to 0). Defaults are
 * layered back on only for the create schema below, where filling an omitted
 * field is the desired behaviour.
 */
const exampleItemFields = z.object({
  name: z
    .string()
    .min(1, 'name is required')
    .max(255)
    .meta({ description: 'Display name for the item.', example: 'First item' }),
  description: z.string().max(2000).optional().meta({
    description: 'Optional free-text description.',
    example: 'A draft example',
  }),
  quantity: z.coerce
    .number()
    .int()
    .min(0)
    .meta({ description: 'Non-negative stock count.', example: 5 }),
  status: z
    .enum(exampleItemStatusValues)
    .meta({ description: 'Lifecycle status.', example: 'active' }),
  expiresAt: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'expiresAt must be a date in YYYY-MM-DD format',
    )
    .optional()
    .meta({
      description:
        'Optional expiry date in YYYY-MM-DD format. Stored as a plain calendar date - no timezone conversion applied.',
      example: '2027-12-29',
    }),
});

/**
 * Validates the body for creating an example item.
 *
 * Mirrors the writable columns of `example_items` (everything except the
 * generated `id` and `createdAt`). Layers create-time defaults onto the shared
 * base: an omitted `quantity` becomes `0` and an omitted `status` becomes
 * `'draft'`. Demonstrates required vs optional fields, numeric coercion, and
 * enum validation in one place.
 */
export const exampleItemSchema = exampleItemFields
  .extend({
    quantity: exampleItemFields.shape.quantity.default(0),
    status: exampleItemFields.shape.status.default('draft'),
  })
  .meta({
    id: 'ExampleItemInput',
    description: 'Body for creating an example item.',
  });

/**
 * Validates the body for a partial update (PATCH). Every field is optional so
 * callers can send only what changed. Built from the **default-free** base, so
 * an omitted field is genuinely left untouched rather than reset to a default.
 */
export const exampleItemUpdateSchema = exampleItemFields.partial().meta({
  id: 'ExampleItemUpdateInput',
  description: 'Body for a partial update - send only the fields that changed.',
});

/**
 * The full, materialised `example_items` row as returned by the API, including
 * the database-generated `id` and `createdAt`. This is the API's output
 * contract - kept here so the request schemas (above) and the response schema
 * share one home and one OpenAPI registration.
 */
export const exampleItemEntitySchema = z
  .object({
    id: z
      .number()
      .int()
      .meta({ description: 'Generated primary key.', example: 1 }),
    name: z.string().meta({ example: 'First item' }),
    description: z.string().nullable().meta({
      description: 'Null when no description was set.',
      example: 'A draft example',
    }),
    quantity: z.number().int().meta({ example: 5 }),
    status: z.enum(exampleItemStatusValues).meta({ example: 'active' }),
    createdAt: z.string().meta({
      description: 'ISO 8601 creation timestamp.',
      example: '2026-06-08T20:18:41.952Z',
    }),
    expiresAt: z.string().nullable().meta({
      description: 'Expiry date as YYYY-MM-DD, or null if not set.',
      example: '2027-12-29',
    }),
  })
  .meta({
    id: 'ExampleItem',
    description: 'A fully materialised example item row.',
  });

/**
 * Parsed, validated input for creating an example item.
 */
export type ExampleItemInput = z.infer<typeof exampleItemSchema>;

/**
 * Parsed, validated input for updating an example item.
 */
export type ExampleItemUpdateInput = z.infer<typeof exampleItemUpdateSchema>;
