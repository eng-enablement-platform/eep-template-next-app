import { z } from 'zod';
import { createDocument } from 'zod-openapi';

import {
  exampleItemEntitySchema,
  exampleItemSchema,
  exampleItemUpdateSchema,
} from '@/validation/example-item';

/**
 * OpenAPI Document Builder
 *
 * Assembles the OpenAPI 3.1 spec for the `example_items` REST surface from the
 * very same Zod schemas the routes validate against (`@/validation/example-item`).
 * Because the request bodies, the response entity, and the validator all come
 * from one place, the published docs cannot drift from what the API accepts.
 *
 * The document is built once at module load and reused. `getOpenApiDocument`
 * returns it for the `/api/openapi` route, which the Swagger UI at `/api-docs`
 * renders.
 */

// The list endpoint wraps rows in `{ exampleItems: [...] }`.
const exampleItemListSchema = z
  .object({ exampleItems: z.array(exampleItemEntitySchema) })
  .meta({ id: 'ExampleItemList' });

// Single-resource responses wrap the row in `{ exampleItem: {...} }`.
const exampleItemEnvelopeSchema = z
  .object({ exampleItem: exampleItemEntitySchema })
  .meta({ id: 'ExampleItemEnvelope' });

// 400 body shape from `validationErrorResponse` in app/api/lib/utils.
const validationErrorSchema = z
  .object({
    error: z.string().meta({ example: 'Validation failed' }),
    fieldErrors: z.record(z.string(), z.array(z.string())).meta({
      description: 'Per-field rejection messages, keyed by field name.',
    }),
  })
  .meta({ id: 'ValidationError' });

// 404 / generic single-message error body.
const messageErrorSchema = z
  .object({ error: z.string().meta({ example: 'Example item not found' }) })
  .meta({ id: 'MessageError' });

const jsonContent = <T>(schema: T) => ({ 'application/json': { schema } });

// Path param shared by the single-resource operations.
const idParam = z.object({
  id: z
    .string()
    .meta({ description: 'Numeric id of the example item.', example: '1' }),
});

const validationErrorResponse = {
  description: 'Invalid request body.',
  content: jsonContent(validationErrorSchema),
};

const notFoundResponse = {
  description: 'No example item with that id.',
  content: jsonContent(messageErrorSchema),
};

const document = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'Example Items API',
    version: '1.0.0',
    description:
      'Full-CRUD REST reference for the `example_items` table. The spec is ' +
      'derived from the Zod schemas in `src/validation/example-item.ts`, the ' +
      'same schemas the route handlers validate against.',
  },
  servers: [{ url: '/', description: 'This server' }],
  paths: {
    '/api/example-items': {
      get: {
        operationId: 'listExampleItems',
        summary: 'List every example item',
        tags: ['Example Items'],
        responses: {
          '200': {
            description: 'All example items.',
            content: jsonContent(exampleItemListSchema),
          },
        },
      },
      post: {
        operationId: 'createExampleItem',
        summary: 'Create a new example item',
        tags: ['Example Items'],
        requestBody: { content: jsonContent(exampleItemSchema) },
        responses: {
          '201': {
            description: 'The created example item.',
            content: jsonContent(exampleItemEnvelopeSchema),
          },
          '400': validationErrorResponse,
        },
      },
    },
    '/api/example-items/{id}': {
      get: {
        operationId: 'getExampleItem',
        summary: 'Fetch a single example item by id',
        tags: ['Example Items'],
        requestParams: { path: idParam },
        responses: {
          '200': {
            description: 'The requested example item.',
            content: jsonContent(exampleItemEnvelopeSchema),
          },
          '400': {
            description: 'The id was not a positive integer.',
            content: jsonContent(messageErrorSchema),
          },
          '404': notFoundResponse,
        },
      },
      patch: {
        operationId: 'updateExampleItem',
        summary: 'Partially update an example item',
        tags: ['Example Items'],
        requestParams: { path: idParam },
        requestBody: { content: jsonContent(exampleItemUpdateSchema) },
        responses: {
          '200': {
            description: 'The updated example item.',
            content: jsonContent(exampleItemEnvelopeSchema),
          },
          '400': validationErrorResponse,
          '404': notFoundResponse,
        },
      },
      delete: {
        operationId: 'deleteExampleItem',
        summary: 'Delete an example item by id',
        tags: ['Example Items'],
        requestParams: { path: idParam },
        responses: {
          '204': { description: 'Deleted. No content.' },
          '400': {
            description: 'The id was not a positive integer.',
            content: jsonContent(messageErrorSchema),
          },
          '404': notFoundResponse,
        },
      },
    },
  },
});

/**
 * Return the prebuilt OpenAPI document for the data API.
 *
 * @returns The OpenAPI 3.1 document object, ready to serialise as JSON.
 */
export function getOpenApiDocument() {
  return document;
}
