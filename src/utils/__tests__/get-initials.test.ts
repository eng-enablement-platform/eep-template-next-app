import { describe, expect, it } from 'vitest';

import { getInitials } from '@/utils/get-initials';

describe('getInitials', () => {
  it('uses first and last name initials', () => {
    expect(getInitials({ firstName: 'ada', lastName: 'Lovelace' })).toBe('AL');
  });

  it('uses just the first name when there is no last name', () => {
    expect(getInitials({ firstName: 'Ada', lastName: null })).toBe('A');
  });

  it('falls back to the email when names are blank', () => {
    expect(
      getInitials({
        firstName: '  ',
        lastName: '',
        email: 'grace@example.com',
      }),
    ).toBe('G');
  });

  it('returns ? when nothing is usable', () => {
    expect(getInitials({})).toBe('?');
  });
});
