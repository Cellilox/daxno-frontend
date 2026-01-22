import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const nextConfig: any = {
  output: 'standalone',

  typescript: {
    // TODO: [Tech Debt] Remove this ignore once all type errors are resolved.
    ignoreBuildErrors: true,
  },
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'daxno-files-897354.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
};

// PWA configuration
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: true, // COMPLETELY DISABLE PWA FOR NOW to fix auth issues
});

export default pwaConfig(nextConfig);
