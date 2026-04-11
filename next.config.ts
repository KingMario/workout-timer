import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // site is served under /workout-timer
  basePath: '/workout-timer',
  assetPrefix: '/workout-timer/',
  // Use redirects only in development for convenience
  ...(process.env.NODE_ENV === 'development' && {
    async redirects() {
      return [
        {
          source: '/',
          destination: '/workout-timer',
          basePath: false,
          permanent: false,
        },
      ];
    },
  }),
};

export default nextConfig;
