import { config } from 'dotenv';

config({ path: '.env.local' });

import { exampleItemService } from '@/classes/services/example-item';

/**
 * EXAMPLE UTILITY
 *
 * Reference exploration script demonstrating how to call a `server-only`
 * service class directly from the command line.
 *
 * @example
 * ```bash
 * pnpm explore:service
 * ```
 */
async function main() {
  const items = await exampleItemService.getAll();
  console.log('items:', JSON.stringify(items, null, 2));
}

main().catch(console.error);
