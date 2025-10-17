'use client';

import { Layout } from '../components/common';
import { Globe, BookOpen, Wrench } from 'lucide-react';

const AppContent: React.FC = () => {
  // 首页内容，其他页面通过路由直接渲染
  const homeContent = () => (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="max-w-3xl space-y-4">
          <h1 className="sm:text-3xl font-bold">
            简介
          </h1>
          <p className="text-xl text-muted-foreground">
            探索人工智能的世界，从概念学习到工具应用，一站式AI知识平台
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            href="/concepts"
            className="rounded-xl p-6 hover:shadow-md transition-all cursor-pointer group border border-border hover:border-primary/50 no-underline"
          >
            <div className="p-3 rounded-lg w-fit mb-4">
              <BookOpen size={24} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">AI 概念库</h2>
            <p className="text-muted-foreground mb-4">
              探索AI领域的核心概念，建立完整的知识体系。每个概念包含简明定义和相关概念链接，帮助你形成知识网络。
            </p>
            <div className="flex items-center text-primary font-medium">
              <span>浏览概念库</span>
              <div className="ml-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                &gt;
              </div>
            </div>
          </a>
          
          <a
            href="/tools"
            className="rounded-xl p-6 hover:shadow-md transition-all cursor-pointer group border border-border hover:border-primary/50 no-underline"
          >
            <div className="p-3 rounded-lg w-fit mb-4">
              <Wrench size={24} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">AI 工具箱</h2>
            <p className="text-muted-foreground mb-4">
              发现各种实用的AI工具，从写作助手到设计工具，提升你的工作效率和创造力。
            </p>
            <div className="flex items-center text-primary font-medium">
              <span>浏览工具箱</span>
              <div className="ml-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                &gt;
              </div>
            </div>
          </a>
          
          <a
            href="/demos"
            className="rounded-xl p-6 hover:shadow-md transition-all cursor-pointer group border border-border hover:border-primary/50 no-underline"
          >
            <div className="p-3 rounded-lg w-fit mb-4">
              <Globe size={24} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">应用广场</h2>
            <p className="text-muted-foreground mb-4">
              展示和体验AI应用示例，包含Demo名称、描述、交互界面和技术细节。
            </p>
            <div className="flex items-center text-primary font-medium">
              <span>立即探索</span>
              <div className="ml-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                &gt;
              </div>
            </div>
          </a>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-border">
        <h2 className="text-2xl font-bold">热门资源</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a href="/concepts/ai" className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-all hover:border-primary/50 no-underline">
            <h3 className="font-semibold mb-1">人工智能 (AI)</h3>
            <p className="text-sm text-muted-foreground">了解人工智能的基础概念和发展历程</p>
          </a>
          <a href="/concepts/deep-learning" className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-all hover:border-primary/50 no-underline">
            <h3 className="font-semibold mb-1">深度学习</h3>
            <p className="text-sm text-muted-foreground">探索深度学习算法和应用场景</p>
          </a>
          <a href="/concepts/generative-ai" className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-all hover:border-primary/50 no-underline">
            <h3 className="font-semibold mb-1">生成式AI</h3>
            <p className="text-sm text-muted-foreground">了解AI如何创造文本、图像等内容</p>
          </a>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-border">
        <h2 className="text-2xl font-bold">即将推出</h2>
        <div className="bg-muted border border-border/50 rounded-xl p-6 opacity-80 max-w-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
            <h3 className="text-xl font-semibold">知识笔记</h3>
          </div>
          <p className="text-muted-foreground">记录和整理你的AI学习过程，支持笔记编辑和分类管理。</p>
        </div>
      </div>
    </div>
  );


  return (
      <Layout>
        {homeContent()}
      </Layout>
    );
  };

export default AppContent;