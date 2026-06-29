// Validate env vars at build time - fails fast with a clear error if anything is missing.
import './src/lib/env';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // config options here
};

export default nextConfig;
