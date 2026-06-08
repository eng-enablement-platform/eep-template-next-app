import { describe, expect, it } from 'vitest';

import {
  exampleItemSchema,
  exampleItemUpdateSchema,
} from '@/validation/example-item';

/**
 * These tests pin the create-vs-update default behaviour. The create schema
 * must fill omitted defaulted fields; the update (PATCH) schema must leave
 * omitted fields untouched. The latter is a regression guard for a real bug:
 * building the update schema from a base that carried `.default()` caused
 * `PATCH { status }` to silently reset `quantity` to 0.
 */

describe('exampleItemSchema (create)', () => {
  it('applies defaults for omitted quantity and status', () => {
    const parsed = exampleItemSchema.parse({ name: 'New item' });

    expect(parsed.quantity).toBe(0);
    expect(parsed.status).toBe('draft');
  });

  it('coerces a numeric string quantity to a number', () => {
    const parsed = exampleItemSchema.parse({ name: 'New item', quantity: '7' });

    expect(parsed.quantity).toBe(7);
  });

  it('rejects an empty name', () => {
    const result = exampleItemSchema.safeParse({ name: '' });

    expect(result.success).toBe(false);
  });
});

describe('exampleItemUpdateSchema (PATCH)', () => {
  it('does not inject a default quantity when only status is sent', () => {
    const parsed = exampleItemUpdateSchema.parse({ status: 'archived' });

    /* The regression: quantity must be absent, not reset to 0. */
    expect(parsed).toStrictEqual({ status: 'archived' });
    expect('quantity' in parsed).toBe(false);
  });

  it('does not inject a default status when only quantity is sent', () => {
    const parsed = exampleItemUpdateSchema.parse({ quantity: 3 });

    expect(parsed).toStrictEqual({ quantity: 3 });
    expect('status' in parsed).toBe(false);
  });

  it('still coerces quantity when it is provided', () => {
    const parsed = exampleItemUpdateSchema.parse({ quantity: '5' });

    expect(parsed.quantity).toBe(5);
  });

  it('accepts an empty body (no fields changed)', () => {
    const parsed = exampleItemUpdateSchema.parse({});

    expect(parsed).toStrictEqual({});
  });
});
