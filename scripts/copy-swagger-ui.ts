import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

/**
 * Copy Swagger UI's prebuilt browser assets into `public/` so the docs page at
 * `/api-docs` can load them as plain static assets (`/swagger-ui/...`) with no
 * third-party CDN.
 *
 * Why a copy step rather than a route handler: Next's bundler tries to
 * statically analyse any file referenced from app code and chokes on these
 * pre-built vendor bundles. Serving them from `public/` sidesteps the bundler
 * entirely — they are just files on disk. The copied assets are gitignored and
 * regenerated, so this is wired to `predev` / `prebuild` in package.json.
 *
 * Source paths are resolved via `require.resolve` (not hard-coded) so this
 * works regardless of how the package manager lays out `node_modules`. Runs
 * outside Next via `tsx`.
 */

const require = createRequire(import.meta.url);

/*
 * The two assets the docs page needs: the JS bundle and the stylesheet. The
 * `swagger-ui-standalone-preset` is intentionally omitted — it adds the topbar
 * / spec-URL explorer, which we don't want for a single-spec page.
 */
const assets = ['swagger-ui-bundle.js', 'swagger-ui.css'] as const;

async function copySwaggerAssets(): Promise<void> {
  const destinationDir = path.join(process.cwd(), 'public', 'swagger-ui');
  await mkdir(destinationDir, { recursive: true });

  for (const asset of assets) {
    const source = require.resolve(`swagger-ui-dist/${asset}`);
    await copyFile(source, path.join(destinationDir, asset));
  }

  console.log(
    `Copied Swagger UI assets → public/swagger-ui/ (${assets.join(', ')})`,
  );
}

copySwaggerAssets().catch((error: unknown) => {
  console.error('Failed to copy Swagger UI assets:', error);
  process.exit(1);
});
