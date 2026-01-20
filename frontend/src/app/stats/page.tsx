'use client';

import { useState, useEffect } from 'react';
import { BarChart3, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageStats {
  pagePath: string;
  pageName: string;
  visitCount: number;
}

interface DateStats {
  date: string;
  visitCount: number;
}

interface RecentVisit {
  id?: number;
  pagePath: string;
  pageName: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  visitTime?: string;
  sessionId?: string;
}

interface VisitorStatsSummary {
  totalVisits: number;
  pageStats: PageStats[];
  dateStats: DateStats[];
  recentVisits: RecentVisit[];
}

// 格式化时间函数
const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return '-';
  }
};

const StatsPage = () => {
  const router = useRouter();
  const [summary, setSummary] = useState<VisitorStatsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取统计数据
  const fetchStats = async () => {
    try {
      setLoading(true);

      // 使用综合统计API，一次请求获取所有数据
      const response = await fetch('/api/visitor-stats/summary?days=7&recentLimit=30');

      if (!response.ok) {
        throw new Error('获取统计数据失败');
      }

      const data = await response.json();
      setSummary(data);

    } catch (error) {
      console.error('获取统计数据失败:', error);
      alert('获取统计数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始化和刷新数据
  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </button>
          <div className="flex items-center gap-2">
            <BarChart3 size={24} className="text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold">访问统计</h1>
          </div>
          <button
            className="ml-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            onClick={fetchStats}
            disabled={loading}
          >
            {loading ? '加载中...' : '刷新'}
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {loading && !summary ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : summary ? (
          <>
            {/* 总访问量 */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">总访问量</h2>
              <div className="text-5xl font-bold text-center text-primary">{summary.totalVisits}</div>
            </div>

            {/* 页面访问统计 */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">页面访问统计</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border-b border-border p-3 text-left">页面名称</th>
                      <th className="border-b border-border p-3 text-left">页面路径</th>
                      <th className="border-b border-border p-3 text-right">访问次数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.pageStats.length > 0 ? (
                      summary.pageStats.map((stat) => (
                        <tr key={stat.pagePath} className="hover:bg-muted/50 transition-colors">
                          <td className="border-b border-border p-3">{stat.pageName || '-'}</td>
                          <td className="border-b border-border p-3 text-muted-foreground text-sm">{stat.pagePath}</td>
                          <td className="border-b border-border p-3 text-right font-medium">{stat.visitCount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="border-b border-border p-8 text-center text-muted-foreground">暂无页面访问数据</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 日期访问统计 */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">日期访问统计</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border-b border-border p-3 text-left">日期</th>
                      <th className="border-b border-border p-3 text-right">访问次数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.dateStats.length > 0 ? (
                      summary.dateStats.map((stat) => (
                        <tr key={stat.date} className="hover:bg-muted/50 transition-colors">
                          <td className="border-b border-border p-3">{stat.date}</td>
                          <td className="border-b border-border p-3 text-right font-medium">{stat.visitCount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="border-b border-border p-8 text-center text-muted-foreground">暂无日期访问数据</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 最近访问记录 */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">最近访问记录</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border-b border-border p-2 text-left">访问时间</th>
                      <th className="border-b border-border p-2 text-left">页面名称</th>
                      <th className="border-b border-border p-2 text-left">页面路径</th>
                      <th className="border-b border-border p-2 text-left">IP地址</th>
                      <th className="border-b border-border p-2 text-left">Session ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recentVisits.length > 0 ? (
                      summary.recentVisits.map((visit, index) => (
                        <tr key={visit.id || `recent-${index}`} className="hover:bg-muted/50 transition-colors">
                          <td className="border-b border-border p-2 text-muted-foreground">{formatDateTime(visit.visitTime)}</td>
                          <td className="border-b border-border p-2">{visit.pageName || '-'}</td>
                          <td className="border-b border-border p-2 text-muted-foreground text-xs">{visit.pagePath || '-'}</td>
                          <td className="border-b border-border p-2 text-muted-foreground">{visit.ipAddress || '-'}</td>
                          <td className="border-b border-border p-2 text-muted-foreground text-xs">{visit.sessionId || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="border-b border-border p-8 text-center text-muted-foreground">暂无最近访问记录</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">无法加载统计数据</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
