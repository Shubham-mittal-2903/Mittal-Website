import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  eslint: {
    // Don't let a stray lint rule fail the production/Vercel build.
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/leads/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
