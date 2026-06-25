import { format, isValid, parse } from 'date-fns';

/*
 * Regex for detecting ISO date-only strings (YYYY-MM-DD). These must be
 * parsed differently from full datetime strings — see parseDateSafe below.
 */
const ISO_DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The output format for `formatDate`.
 *
 * - `'display'` — human-readable, e.g. "29 Dec 2027"
 * - `'iso'`     — date-only ISO string, e.g. "2027-12-29"
 */
export type DateFormat = 'display' | 'iso';

/**
 * Safely parse a date string into a `Date` object.
 *
 * Handles the JS UTC-midnight gotcha: `new Date('2027-12-29')` parses as UTC
 * midnight per the ECMAScript spec, which rolls the date back by one day for
 * users in negative-offset timezones (e.g. UTC-7 sees Dec 28). This function
 * detects date-only strings and parses them as **local midnight** instead,
 * keeping the calendar date correct regardless of the user's timezone.
 *
 * Full datetime strings (e.g. `'2027-12-29T10:30:00Z'`) are passed to the
 * native `Date` constructor — they include explicit timezone info so native
 * parsing is correct.
 *
 * @param value - Any date string, typically `YYYY-MM-DD` or a full ISO datetime.
 * @returns A `Date` at local midnight for date-only strings, a native `Date`
 *   for datetime strings, or `null` if the string is empty or unparseable.
 * @example
 * ```ts
 * parseDateSafe('2027-12-29');
 * // → Date at local midnight Dec 29 2027, correct in all timezones
 *
 * parseDateSafe('not-a-date');
 * // → null
 * ```
 */
export const parseDateSafe = (value: string): Date | null => {
  if (!value) return null;

  if (ISO_DATE_ONLY_REGEX.test(value)) {
    /*
     * parse() from date-fns interprets the string in local time, producing
     * local midnight — not UTC midnight. This is the safe path for calendar
     * dates that represent a day, not a moment in time.
     */
    const parsed = parse(value, 'yyyy-MM-dd', new Date());
    return isValid(parsed) ? parsed : null;
  }

  // Full datetime string — carries its own timezone offset (Z, +05:30 etc.) so native parsing is correct
  const native = new Date(value);
  return isValid(native) ? native : null;
};

/**
 * Format a `Date` into either a human-readable display string or an ISO
 * date-only string.
 *
 * Always use this alongside `parseDateSafe` — formatting a `Date` that was
 * parsed via native `new Date('YYYY-MM-DD')` will still produce wrong results
 * in negative-offset timezones. The two functions are designed to work together.
 *
 * When `timezone` is provided, the date is formatted as it would appear in
 * that IANA timezone (e.g. `'America/Denver'`). This is used by the dev
 * timezone demo to show how the same UTC moment displays differently across
 * timezones. Omit for production use — it falls back to local time.
 *
 * @param date - The date to format.
 * @param dateFormat - `'display'` for "29 Dec 2027", `'iso'` for "2027-12-29".
 * @param timezone - Optional IANA timezone string. When provided, formats the
 *   date as it appears in that timezone rather than local time.
 * @returns A formatted date string.
 * @example
 * ```ts
 * const date = parseDateSafe('2027-12-29')!;
 * formatDate(date, 'display');                      // '29 Dec 2027' (local)
 * formatDate(date, 'display', 'America/Denver');    // timezone-aware display
 * formatDate(date, 'iso');                          // '2027-12-29'
 * ```
 */
export const formatDate = (
  date: Date,
  dateFormat: DateFormat,
  timezone?: string,
): string => {
  if (dateFormat === 'iso') {
    // ISO output is always calendar-date only — timezone doesn't apply
    return format(date, 'yyyy-MM-dd');
  }

  if (timezone) {
    /*
     * Use Intl.DateTimeFormat to render the date as it appears in the given
     * IANA timezone. Native, no extra dependency.
     */
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: timezone,
    }).format(date);
  }

  return format(date, 'dd MMM yyyy');
};
