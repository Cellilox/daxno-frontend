import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev;`
          }
        ]
      }
    ];
  }
};

export default nextConfig;
