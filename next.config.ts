import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // 隱藏 Next.js 資訊
  poweredByHeader: false,
  
  // 嚴格限制圖片來源 (僅允許本機圖片)
  images: {
    remotePatterns: [],
    unoptimized: true, // 如果不需 Next.js 優化可開啟此項減少攻擊面，若需要優化請移除此行並設定 remotePatterns
  },

  // 安全性標頭
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY' // 防止 Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff' // 防止 MIME Type Sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  /* config options here */
  experimental: {
    // Tailwind v4 相關配置通常不需要特別的 next config
  },
};

export default nextConfig;
