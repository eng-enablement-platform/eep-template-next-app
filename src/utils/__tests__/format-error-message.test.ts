import { describe, expect, it } from 'vitest';

import { formatErrorMessage } from '@/utils/format-error-message';

describe('formatErrorMessage', () => {
  it('returns the message from an Error instance', () => {
    expect(formatErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('falls back to a generic message for an unknown value', () => {
    expect(formatErrorMessage(null)).toBe('An unknown error occurred');
  });
});
