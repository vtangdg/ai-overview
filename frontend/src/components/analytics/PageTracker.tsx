'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { recordPageVisit, getPageInfo } from '../../lib/visitorStats';

/**
 * 页面访问统计追踪组件
 * 放在根布局中用于自动记录所有页面访问
 */
export function PageTracker() {
  const pathname = usePathname();

  // 记录页面访问 - 只在客户端执行
  useEffect(() => {
    // 从环境变量读取打点开关，默认为false，当值为'true'时启用分析功能
    const analyticsEnabled = process.env.NEXT_PUBLIC_TRACKING_ENABLED === 'true';
    
    // 确保在客户端且有路径时执行，排除统计页面自身，并且分析功能已启用
    if (analyticsEnabled && typeof window !== 'undefined' && pathname && !pathname.includes('/stats')) {
      const { path, name } = getPageInfo(pathname);
      recordPageVisit(path, name);
    }
  }, [pathname]);

  // 组件不需要渲染任何内容
  return null;
}