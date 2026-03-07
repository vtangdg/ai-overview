'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Shield, Settings, Menu, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    id: 'ip-management',
    label: 'IP 管理',
    icon: Shield,
    href: '/admin/ip-management',
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentMenu = menuItems.find((item) => pathname?.startsWith(item.href)) || menuItems[0];

  return (
    <div className="min-h-screen bg-background flex">
      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 左侧菜单栏 */}
      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo区域 */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">管理后台</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* 菜单项 */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);

            return (
              <button
                key={item.id}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 底部返回按钮 */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            返回首页
          </button>
        </div>
      </aside>

      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold">{currentMenu?.label}</h2>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
