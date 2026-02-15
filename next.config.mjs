import createNextIntlPlugin from 'next-intl/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TS errors due to Next.js 16 + Turbopack issue
  },
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  compress: true,
  // 安全头配置
  async headers() {
    const securityHeaders = [
      {
        // 应用到所有路由
        source: '/:path*',
        headers: [
          // 防止点击劫持攻击
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // 防止 MIME 类型嗅探
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // XSS 保护（现代浏览器已内置，但保留以兼容旧浏览器）
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // 控制 Referrer 信息
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // 权限策略（限制浏览器功能）
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
        ],
      },
    ];

    // 仅在生产环境添加 HSTS
    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      });
    }

    return securityHeaders;
  },
}

export default withBundleAnalyzer(withNextIntl(nextConfig));
