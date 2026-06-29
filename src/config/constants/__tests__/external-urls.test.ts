import { describe, expect, it } from 'vitest';

import {
  JSONPLACEHOLDER_BASE_URL,
  JSONPLACEHOLDER_POSTS_KEY,
} from '../external-urls';

/**
 * Sanity tests for external-urls constants.
 *
 * These are not network calls — they guard against the two constants
 * drifting apart (e.g. base URL updated but the composed key forgotten).
 */

describe('external-urls', () => {
  it('JSONPLACEHOLDER_POSTS_KEY is built from JSONPLACEHOLDER_BASE_URL', () => {
    expect(JSONPLACEHOLDER_POSTS_KEY.startsWith(JSONPLACEHOLDER_BASE_URL)).toBe(
      true,
    );
  });
});
