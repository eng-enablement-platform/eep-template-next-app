import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/* The build script pins `next build --webpack`. Next 16 defaults to Turbopack,
   whose production build writes .next/routes-manifest-deterministic.json;
   Vercel's Next adapter lstats the classic routes-manifest.json and fails with
   ENOENT (vercel/next.js#88579). Webpack writes the classic manifest and
   resolves `next` without the turbopack.root widening this nested-in-repo docs
   package needed under Turbopack, so no root config is required here. */

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
};

export default withMDX(config);
