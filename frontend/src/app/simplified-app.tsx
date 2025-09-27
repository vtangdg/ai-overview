'use client';

import { useState } from 'react';
import { Layout } from '../components/common';
import { BookOpen, Wrench } from 'lucide-react';

// 定义页面类型
type PageType = 'home' | 'concepts' | 'tools';

export default function SimplifiedApp() {
  // 页面状态管理
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  // 根据当前页面渲染内容
  const renderContent = () => {
    switch (currentPage) {
      case 'concepts':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">AI 概念库</h1>
              <p className="text-muted-foreground">探索AI领域的核心概念</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 简化版概念卡片 */}
              <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md">
                <h3 className="text-xl font-semibold mb-2">人工智能</h3>
                <p className="text-muted-foreground mb-4">Artificial Intelligence，研究如何使计算机模拟人类智能活动的学科。</p>
                <span className="text-xs px-2 py-1 bg-secondary rounded-full text-secondary-foreground">基础</span>
              </div>
              <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md">
                <h3 className="text-xl font-semibold mb-2">机器学习</h3>
                <p className="text-muted-foreground mb-4">Machine Learning，使计算机系统能够从数据中学习和改进的算法。</p>
                <span className="text-xs px-2 py-1 bg-secondary rounded-full text-secondary-foreground">技术</span>
              </div>
              <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md">
                <h3 className="text-xl font-semibold mb-2">深度学习</h3>
                <p className="text-muted-foreground mb-4">Deep Learning，基于神经网络的机器学习方法，能够处理复杂的模式识别任务。</p>
                <span className="text-xs px-2 py-1 bg-secondary rounded-full text-secondary-foreground">技术</span>
              </div>
            </div>
          </div>
        );
      case 'tools':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">AI 工具箱</h1>
              <p className="text-muted-foreground">发现和使用各种AI工具</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 简化版工具卡片 */}
              <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md">
                <h3 className="text-xl font-semibold mb-2">星穹写作</h3>
                <p className="text-muted-foreground mb-4">一款先进的AI写作助手，提供文章创作、文案生成等功能。</p>
                <span className="text-xs px-2 py-1 bg-secondary rounded-full text-secondary-foreground">写作工具</span>
              </div>
              <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md">
                <h3 className="text-xl font-semibold mb-2">蛙灵AI论文</h3>
                <p className="text-muted-foreground mb-4">专注于学术论文写作的AI助手，支持文献分析和论文结构优化。</p>
                <span className="text-xs px-2 py-1 bg-secondary rounded-full text-secondary-foreground">写作工具</span>
              </div>
              <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md">
                <h3 className="text-xl font-semibold mb-2">66AI论文</h3>
                <p className="text-muted-foreground mb-4">提供论文润色、查重和格式优化等功能的AI工具。</p>
                <span className="text-xs px-2 py-1 bg-secondary rounded-full text-secondary-foreground">写作工具</span>
              </div>
            </div>
          </div>
        );
      case 'home':
      default:
        return (
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="max-w-3xl space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">
                  AI 知识库
                </h1>
                <p className="text-xl text-muted-foreground">
                  探索人工智能的世界，从概念学习到工具应用，一站式AI知识平台
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div
                  className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setCurrentPage('concepts')}
                >
                  <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                    <BookOpen size={24} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">AI 概念库</h2>
                  <p className="text-muted-foreground mb-4">
                    探索AI领域的核心概念，建立完整的知识体系。
                  </p>
                  <div className="flex items-center text-primary font-medium">
                    <span>浏览概念库</span>
                  </div>
                </div>
                
                <div
                  className="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setCurrentPage('tools')}
                >
                  <div className="bg-secondary/10 p-3 rounded-lg w-fit mb-4">
                    <Wrench size={24} className="text-secondary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">AI 工具箱</h2>
                  <p className="text-muted-foreground mb-4">
                    发现和使用各种AI工具，提升工作效率和创造力。
                  </p>
                  <div className="flex items-center text-secondary font-medium">
                    <span>浏览工具箱</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return <Layout>{renderContent()}</Layout>;
}