import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // site is served under /workout-timer
  basePath: '/workout-timer',
  assetPrefix: '/workout-timer/',
};

export default nextConfig;
