import type { NextConfig } from "next";

const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1] ?? '';
const isUserOrOrgPage = repo.endsWith('.github.io');
const basePath = repo && !isUserOrOrgPage ? `/${repo}` : '';

const nextConfig: NextConfig = {
  output: 'export', // Enable static export
  trailingSlash: true,
  reactCompiler: true,
  // Helps Next/Turbopack resolve the correct root when multiple lockfiles exist.
  turbopack: {
    root: __dirname,
  },
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    // In production (GitHub Pages export) we must disable Next's image optimizer.
    // In dev, keep optimization enabled so images are served via localhost (helps when remote hosts are blocked).
    unoptimized: process.env.NODE_ENV === 'production',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.wikia.nocookie.net',
        pathname: '/onepiece/**',
      },
    ],
  },
};

export default nextConfig;