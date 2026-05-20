import { describe, expect, it } from 'vitest';

import { clamp } from '@/utils/clamp';

describe('clamp', () => {
  it('returns the value unchanged when inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns minimum when value is below the range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('returns maximum when value is above the range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns the bound when value sits exactly on it', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('handles negative ranges', () => {
    expect(clamp(-7, -10, -1)).toBe(-7);
    expect(clamp(-20, -10, -1)).toBe(-10);
    expect(clamp(5, -10, -1)).toBe(-1);
  });

  it('handles a degenerate range where minimum equals maximum', () => {
    expect(clamp(99, 5, 5)).toBe(5);
  });

  it('throws RangeError when minimum is greater than maximum', () => {
    expect(() => clamp(5, 10, 0)).toThrow(RangeError);
    expect(() => clamp(5, 10, 0)).toThrow(
      'clamp: minimum (10) must be <= maximum (0)',
    );
  });
});
