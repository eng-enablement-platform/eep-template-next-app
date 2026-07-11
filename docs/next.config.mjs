import { createMDX } from 'fumadocs-mdx/next';
import path from 'path';

const withMDX = createMDX();

/* Local only: pnpm v11 enableGlobalVirtualStore symlinks node_modules/next to
   the root .pnpm store, whose realpath lands in the repo root's .pnpm dir — not
   the docs/ dir. Turbopack can't resolve next/package.json from docs/src/app,
   so we widen turbopack.root (and the tracing root, which Turbopack requires to
   match) to the repo root, the common ancestor of docs/ and next's realpath
   (per vercel/next.js#93556).

   On Vercel we set NEITHER. The root directory is docs/, which installs an
   isolated node_modules with no cross-store symlink to chase, so Next infers
   docs/ correctly on its own. Widening the root there instead drags the root
   app's src/instrumentation.ts (and its @vercel/otel import) into the graph;
   pinning outputFileTracingRoot to docs/ trips the Turbopack monorepo
   path-doubling bug (vercel/next.js#88579, ENOENT routes-manifest). Leaving
   both unset avoids both failure modes. */
const isVercel = Boolean(process.env.VERCEL);
const repoRoot = path.resolve(import.meta.dirname, '..');

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  ...(isVercel
    ? {}
    : {
        outputFileTracingRoot: repoRoot,
        turbopack: { root: repoRoot },
      }),
};

export default withMDX(config);
