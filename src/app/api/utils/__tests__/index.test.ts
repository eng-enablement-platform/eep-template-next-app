import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { parseId, validationErrorResponse } from '@/app/api/utils';

describe('parseId', () => {
  it('returns the integer for a valid positive id', () => {
    expect(parseId('1')).toBe(1);
    expect(parseId('42')).toBe(42);
  });

  it('returns null for zero', () => {
    expect(parseId('0')).toBeNull();
  });

  it('returns null for a negative number', () => {
    expect(parseId('-1')).toBeNull();
  });

  it('returns null for a float', () => {
    expect(parseId('1.5')).toBeNull();
  });

  it('returns null for a non-numeric string', () => {
    expect(parseId('abc')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(parseId('')).toBeNull();
  });
});

describe('validationErrorResponse', () => {
  it('returns a 400 response', async () => {
    const result = z.object({ name: z.string() }).safeParse({ name: 123 });
    expect(result.success).toBe(false);
    if (result.success) return;

    const response = validationErrorResponse(result.error);
    expect(response.status).toBe(400);
  });

  it('includes fieldErrors in the response body', async () => {
    const result = z.object({ name: z.string() }).safeParse({ name: 123 });
    expect(result.success).toBe(false);
    if (result.success) return;

    const response = validationErrorResponse(result.error);
    const body = await response.json();

    expect(body.error).toBe('Validation failed');
    expect(body.fieldErrors).toHaveProperty('name');
  });
});
