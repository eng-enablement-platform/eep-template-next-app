// Must be the first import - loads .env files before @/lib/env validates.
import '@/lib/env/load-env-files';

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
