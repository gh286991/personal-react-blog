import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  experimental: {
    // Tailwind v4 相關配置通常不需要特別的 next config
  },
};

export default nextConfig;
