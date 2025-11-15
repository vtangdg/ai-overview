'use client';

import { useState, useEffect } from 'react';

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

// 格式化时间函数
const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    // 格式化为：2024-01-01 12:30:45
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
}

const StatsPage = () => {
  const [totalVisits, setTotalVisits] = useState<number>(0);
  const [pageStats, setPageStats] = useState<PageStats[]>([]);
  const [dateStats, setDateStats] = useState<DateStats[]>([]);
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取统计数据
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // 使用相对路径，利用Next.js的API代理功能
      // Next.js会根据next.config.ts中的配置自动转发到正确的后端服务
      const [totalResponse, pagesResponse, datesResponse, recentResponse] = await Promise.all([
        fetch('/api/visitor-stats/total'),
        fetch('/api/visitor-stats/pages'),
        fetch('/api/visitor-stats/dates'),
        fetch('/api/visitor-stats/recent?limit=30')
      ]);

      const totalData = await totalResponse.json();
      const pagesData = await pagesResponse.json();
      const datesData = await datesResponse.json();
      const recentData = await recentResponse.json();

      setTotalVisits(totalData.totalVisits || 0);
      // 确保pageStats是数组类型
      setPageStats(Array.isArray(pagesData) ? pagesData : []);
      // 确保dateStats是数组类型
      setDateStats(Array.isArray(datesData) ? datesData : []);
      // 确保recentVisits是数组类型
      setRecentVisits(Array.isArray(recentData) ? recentData : []);
      
    } catch (error) {
      console.error('获取统计数据失败:', error);
      console.error('获取统计数据失败');
      alert('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化和刷新数据
  useEffect(() => {
    fetchStats();
  }, []);

  

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">访问统计</h1>
      
      <button 
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
        onClick={fetchStats} 
        disabled={loading}
      >
        {loading ? '加载中...' : '刷新数据'}
      </button>

      <div className="mb-6 border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">总访问量</h2>
        <div className="text-4xl font-bold text-center">{totalVisits}</div>
      </div>

      <div className="mb-6 border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">页面访问统计</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">页面名称</th>
                <th className="border p-2 text-left">页面路径</th>
                <th className="border p-2 text-left">访问次数</th>
              </tr>
            </thead>
            <tbody>
              {pageStats.length > 0 ? (
                pageStats.map((stat, index) => (
                  <tr key={`${stat.pagePath}-${index}`} className="hover:bg-gray-50">
                    <td className="border p-2">{stat.pageName}</td>
                    <td className="border p-2">{stat.pagePath}</td>
                    <td className="border p-2">{stat.visitCount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="border p-4 text-center text-gray-500">暂无页面访问数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-6 border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">日期访问统计</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">日期</th>
                <th className="border p-2 text-left">访问次数</th>
              </tr>
            </thead>
            <tbody>
              {dateStats.length > 0 ? (
                dateStats.map((stat) => (
                  <tr key={stat.date} className="hover:bg-gray-50">
                    <td className="border p-2">{stat.date}</td>
                    <td className="border p-2">{stat.visitCount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="border p-4 text-center text-gray-500">暂无日期访问数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">最近访问记录</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">访问时间</th>
                <th className="border p-2 text-left">页面名称</th>
                <th className="border p-2 text-left">页面路径</th>
                <th className="border p-2 text-left">IP地址</th>
                <th className="border p-2 text-left">Session ID</th>
              </tr>
            </thead>
            <tbody>
              {recentVisits.length > 0 ? (
                recentVisits.map((visit, index) => (
                  <tr key={visit.id || `recent-${index}`} className="hover:bg-gray-50">
                    <td className="border p-2">{formatDateTime(visit.visitTime)}</td>
                    <td className="border p-2">{visit.pageName}</td>
                    <td className="border p-2">{visit.pagePath}</td>
                    <td className="border p-2">{visit.ipAddress || '-'}</td>
                    <td className="border p-2">{visit.sessionId || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border p-4 text-center text-gray-500">暂无最近访问记录</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;