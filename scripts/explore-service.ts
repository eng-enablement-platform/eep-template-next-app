import { config } from 'dotenv';

/*
 * Load .env.local before any src/ imports — env vars must be present
 * before service constructors run (DB connection strings, API keys etc.).
 * Run with: pnpm explore:service
 */
config({ path: '.env.local' });

import { exampleItemService } from '@/classes/services/example-item';

/**
 * EXAMPLE UTILITY
 *
 * Reference exploration script demonstrating how to call a `server-only`
 * service class directly from the command line, without spinning up Next.js.
 *
 * The `--conditions=react-server` Node flag (set via NODE_OPTIONS in
 * package.json) satisfies the `server-only` export condition check — the same
 * signal Next.js sends internally when running server components.
 *
 * Copy this file, rename it, swap the service import and the logic inside
 * `main()`, then delete it when you're done exploring.
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
