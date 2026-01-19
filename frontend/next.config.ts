import type { NextConfig } from "next";

const apiProxyTarget = process.env.BACKEND_API_URL || 'http://localhost:8090';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  // 使用环境变量配置API代理
  async rewrites() {

    console.log('=== 开发环境代理配置 ===');
    console.log('BACKEND_API_URL:', apiProxyTarget);
    console.log('==============================');
    return [
        // 排除前端自己的 API 路由
        {
          source: '/api/notes/:path*',
          destination: '/api/notes/:path*',
        },
        // 其他 API 请求代理到后端
        {
          source: '/api/:path*',
          destination: `${apiProxyTarget}/api/:path*`,
        }
    ];
  },
};

export default nextConfig;
