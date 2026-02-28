import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enable static export
  reactCompiler: true,
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.wikia.nocookie.net',
        pathname: '/onepiece/**',
      },
    ],
  },
  // If deploying to a subdirectory, uncomment and set your repo name:
  // basePath: '/op-connections',
  // trailingSlash: true,
};

export default nextConfig;