/**
 * 访客统计工具函数
 */

interface VisitorStatsData {
  pagePath: string;
  pageName: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  referrer?: string;
}

/**
 * 生成唯一的sessionId
 * @returns 唯一的sessionId字符串
 */
const generateSessionId = (): string => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
};

/**
 * 获取或生成sessionId
 * 使用localStorage持久化存储，确保同一浏览器会话中sessionId保持一致
 * @returns sessionId字符串
 */
const getSessionId = (): string => {
  // 确保在浏览器环境中运行
  if (typeof window !== 'undefined') {
    const sessionStorageKey = 'ai_overview_session_id';
    const sessionExpiryKey = 'ai_overview_session_expiry';
    const now = Date.now();
    const sessionTimeoutMs = 30 * 60 * 1000; // 30分钟会话超时
    
    try {
        // 获取存储的sessionId和过期时间
        const sessionId = localStorage.getItem(sessionStorageKey);
        const expiryTime = localStorage.getItem(sessionExpiryKey);
      
      // 检查sessionId是否存在且未过期
      if (sessionId && expiryTime && parseInt(expiryTime, 10) > now) {
        // 更新过期时间
        localStorage.setItem(sessionExpiryKey, (now + sessionTimeoutMs).toString());
        return sessionId;
      }
    } catch {
      // 如果localStorage操作失败，继续生成新的sessionId
    }
    
    // 生成新的sessionId
    const newSessionId = generateSessionId();
    
    // 尝试存储新的sessionId和过期时间
    try {
      localStorage.setItem(sessionStorageKey, newSessionId);
      localStorage.setItem(sessionExpiryKey, (now + sessionTimeoutMs).toString());
    } catch {
      // 如果localStorage不可用（如隐私模式），仍然返回sessionId但不存储
    }
    
    return newSessionId;
  }
  
  // 非浏览器环境返回空字符串
  return '';
};

/**
 * 导出函数，用于获取当前的sessionId
 * 可用于调试和测试
 * @returns 当前使用的sessionId字符串
 */
export const getCurrentSessionId = (): string => {
  return getSessionId();
};

/**
 * 记录页面访问
 * @param pagePath 页面路径
 * @param pageName 页面名称
 */
export const recordPageVisit = (pagePath: string, pageName: string): void => {
  try {
    // 获取sessionId并添加到数据中
    const sessionId = getSessionId();
    const data: VisitorStatsData = {
      pagePath,
      pageName,
      referrer: document.referrer,
      sessionId,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
    };

    // 只异步提交，不关心结果
    fetch('/api/stats/record', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      // credentials: 'include',
    }).catch(() => {
      // 静默失败，不输出任何日志
    });
  } catch {
    // 静默失败，不影响用户体验
  }
};

/**
 * 获取页面路径和名称映射
 * @param pathname 当前页面路径
 * @returns 页面名称
 */
export const getPageInfo = (pathname: string): { path: string; name: string } => {
  const pathMap: Record<string, string> = {
    '/': '首页',
    '/concepts': '概念库',
    '/tools': 'AI工具箱',
    '/notes': '知识笔记',
    '/demos': '应用广场',
  };

  // 检查是否是二级页面的子页面
  for (const [path, name] of Object.entries(pathMap)) {
    if (path !== '/' && pathname.startsWith(path + '/')) {
      return { path,
        name: `${name} - 详情页`
      };
    }
  }

  // 返回精确匹配或默认值
  return {
    path: pathMap[pathname] ? pathname : '/',
    name: pathMap[pathname] || '未知页面'
  };
};