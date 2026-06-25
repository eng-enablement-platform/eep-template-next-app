import { describe, expect, it } from 'vitest';

import { formatDate, parseDateSafe } from '@/utils/dates';

/*
 * These tests run under three timezones via `pnpm test:tz`:
 *   TZ=America/Denver    (UTC-7)
 *   TZ=America/New_York  (UTC-5)
 *   TZ=Pacific/Auckland  (UTC+12)
 *
 * The core invariant: a date-only ISO string (YYYY-MM-DD) must parse to the
 * same calendar date regardless of the host timezone. Native `new Date('2027-12-29')`
 * fails this — it parses as UTC midnight, which rolls back to Dec 28 in any
 * negative-offset timezone. parseDateSafe() must parse as local midnight instead.
 */

describe('parseDateSafe', () => {
  describe('date-only ISO strings (YYYY-MM-DD)', () => {
    it('returns the correct calendar date regardless of host timezone', () => {
      const result = parseDateSafe('2027-12-29');

      expect(result).not.toBeNull();
      /*
       * These assertions use local date methods intentionally — the whole point
       * is that the parsed date reflects the correct calendar date in local time.
       */
      expect(result!.getFullYear()).toBe(2027);
      expect(result!.getMonth()).toBe(11); // 0-indexed
      expect(result!.getDate()).toBe(29);
    });

    it('parses as local midnight, not UTC midnight', () => {
      const result = parseDateSafe('2027-12-29');

      expect(result).not.toBeNull();
      expect(result!.getHours()).toBe(0);
      expect(result!.getMinutes()).toBe(0);
    });
  });

  describe('datetime strings', () => {
    it('falls back to native Date parsing for full ISO datetime strings', () => {
      const result = parseDateSafe('2027-12-29T10:30:00Z');

      expect(result).not.toBeNull();
      // Full datetime strings include time and timezone — native parsing is correct here
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('invalid input', () => {
    it('returns null for an invalid date string', () => {
      expect(parseDateSafe('not-a-date')).toBeNull();
    });

    it('returns null for an empty string', () => {
      expect(parseDateSafe('')).toBeNull();
    });
  });
});

describe('formatDate', () => {
  // Use a date constructed via parseDateSafe to guarantee local midnight
  const date = parseDateSafe('2027-12-29')!;

  it('formats to a human-readable display string', () => {
    expect(formatDate(date, 'display')).toBe('29 Dec 2027');
  });

  it('formats to an ISO date-only string', () => {
    expect(formatDate(date, 'iso')).toBe('2027-12-29');
  });
});
