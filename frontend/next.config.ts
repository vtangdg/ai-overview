import type { NextConfig } from "next";

const apiProxyTarget = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  // 使用环境变量配置API代理
  async rewrites() {

    console.log('=== 开发环境代理配置 ===');
    console.log('NEXT_PUBLIC_API_BASE_URL:', apiProxyTarget);
    console.log('==============================');
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: `${apiProxyTarget}/api/:path*`,
        },
      ];
    }
    return [
    ];
  },
};

export default nextConfig;
