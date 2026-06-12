import { describe, expect, it } from 'vitest';

import { sum } from '@/utils/sum';

describe('sum', () => {
  it('adds two positive numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });

  it('adds a positive and a negative number', () => {
    expect(sum(5, -2)).toBe(3);
  });

  it('adds two negative numbers', () => {
    expect(sum(-4, -6)).toBe(-10);
  });

  it('returns the other addend when adding zero', () => {
    expect(sum(7, 0)).toBe(7);
    expect(sum(0, 7)).toBe(7);
  });
});
