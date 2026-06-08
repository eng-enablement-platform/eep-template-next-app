import { NextResponse } from 'next/server';

import { getOpenApiDocument } from '@/lib/openapi';

/**
 * Serve the OpenAPI 3.1 spec for the data API as JSON.
 *
 * The Swagger UI at `/api-docs` fetches this document to render the
 * documentation, and external tooling (Postman, codegen, SDK builders) can
 * consume it directly. The spec is derived from the Zod schemas, so it is
 * always in step with what the routes validate.
 *
 * @returns 200 with the OpenAPI document.
 *
 * @example
 * // GET http://localhost:3000/api/openapi
 */
export function GET(): NextResponse {
  return NextResponse.json(getOpenApiDocument());
}
