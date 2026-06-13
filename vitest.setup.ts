import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

/*
 * Global test setup. Registers jest-dom matchers (toBeInTheDocument, etc.) and
 * unmounts React trees after each test so component tests don't leak DOM into
 * one another.
 */
afterEach(() => {
  cleanup();
});
