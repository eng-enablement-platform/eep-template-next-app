import { createMDX } from 'fumadocs-mdx/next';
import path from 'path';

const withMDX = createMDX();

/* pnpm v11 enableGlobalVirtualStore symlinks node_modules/next to the root
   .pnpm store, whose realpath lands in the repo root's .pnpm dir — not the
   docs/ dir. Turbopack therefore can't resolve next/package.json from
   docs/src/app. The fix (per vercel/next.js#93556) is to set turbopack.root
   to the common ancestor of this package dir and the realpath of next —
   which is the repo root. */
const repoRoot = path.resolve(import.meta.dirname, '..');

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  turbopack: {
    root: repoRoot,
  },
};

export default withMDX(config);
