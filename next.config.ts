import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Disable prerendering to avoid Auth.js error page issues
  output: 'standalone',
};

export default nextConfig;
