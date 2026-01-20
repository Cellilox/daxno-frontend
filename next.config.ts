import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    // TODO: [Tech Debt] Remove this ignore once all lint errors are resolved.
    ignoreDuringBuilds: true,
  },
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
  disable: process.env.NODE_ENV === 'development', // Disable in dev for easier debugging
  sw: 'sw.js',
});

export default pwaConfig(nextConfig);
