import { createMDX } from 'fumadocs-mdx/next';
import path from 'path';

const withMDX = createMDX();

/* pnpm v11 enableGlobalVirtualStore symlinks node_modules/next to the root
   .pnpm store, whose realpath lands in the repo root's .pnpm dir — not the
   docs/ dir. Turbopack therefore can't resolve next/package.json from
   docs/src/app. The local fix (per vercel/next.js#93556) is to set
   turbopack.root to the common ancestor of this package dir and the realpath
   of next — the repo root.

   On Vercel the root directory is set to docs/, which installs an isolated
   node_modules with no cross-store symlink to chase. Widening turbopack.root
   to the repo root there instead pulls the root app's src/ (and its
   @vercel/otel instrumentation) into the module graph, breaking the build.
   So only widen the root outside Vercel.

   Next also derives outputFileTracingRoot independently; on Vercel it picks
   the mounted repo root (/vercel/path0). When it disagrees with turbopack.root
   Next discards turbopack.root and uses the wider tracing root, re-widening the
   graph and dragging src/instrumentation.ts back in. Pin both to the same value
   so they can never diverge. */
const isVercel = Boolean(process.env.VERCEL);
const turbopackRoot = isVercel
  ? import.meta.dirname
  : path.resolve(import.meta.dirname, '..');

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  outputFileTracingRoot: turbopackRoot,
  turbopack: {
    root: turbopackRoot,
  },
};

export default withMDX(config);
