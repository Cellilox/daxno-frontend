import type { NextConfig } from "next";

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
};

export default nextConfig;
