import { NextRequest, NextResponse } from 'next/server';

/**
 * 访问统计记录API路由
 * 转发访问统计数据到后端服务
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 转发到后端API
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8090';
    const response = await fetch(`${backendUrl}/api/visitor-stats/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 传递用户代理和IP信息
        'User-Agent': request.headers.get('User-Agent') || '',
        // 获取客户端IP地址 - Next.js App Router兼容方式
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: '后端统计服务暂时不可用' },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('访问统计记录错误:', error);
    // 静默失败，不影响用户体验
    return NextResponse.json({ success: true });
  }
}