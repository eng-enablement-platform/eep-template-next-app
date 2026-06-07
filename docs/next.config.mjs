import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  /* docs is a standalone project nested under the root template, so pin the
     Turbopack root to this directory — otherwise Next infers the parent
     workspace root and resolves modules from the wrong tree. */
  turbopack: {
    root: import.meta.dirname,
  },
};

export default withMDX(config);
