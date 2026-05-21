import type { NextConfig } from "next";

const isProd = process.env.BUILD_TARGET === "desktop";

const nextConfig: NextConfig = {
  output: isProd ? "export" : undefined,
  images: {
    unoptimized: isProd ? true : undefined,
  },
};

export default nextConfig;