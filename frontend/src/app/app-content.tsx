'use client';

import { useState } from 'react';
import { Layout } from '../components/common';
import { ConceptsPage } from '../components/concepts/concepts-page';
import { ToolsPage } from '../components/tools/tools-page';
import { TermDetail } from '../components/concepts/term-detail';
import { ToolDetail } from '../components/tools/tool-detail';
import { Globe, BookOpen, Wrench } from 'lucide-react';

// 定义页面类型
type PageType = 'home' | 'concepts' | 'concept-detail' | 'tools' | 'tool-detail';

const AppContent: React.FC = () => {
  // 页面状态管理
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [selectedToolId, setSelectedToolId] = useState<number>(0);

  // 处理导航点击
  const handleNavClick = (page: string) => {
    switch (page) {
      case 'home':
        setCurrentPage('home');
        break;
      case 'concepts':
        setCurrentPage('concepts');
        break;
      case 'tools':
        setCurrentPage('tools');
        break;
      case 'notes':
        // 笔记功能尚未完全实现，显示提示信息
        alert('知识笔记功能即将推出');
        break;
      case 'demos':
        // 应用广场功能尚未完全实现，显示提示信息
        alert('应用广场功能即将推出');
        break;
      default:
        setCurrentPage('home');
    }
  };

  // 处理概念点击
  const handleTermClick = (id: string) => {
    setSelectedTermId(id);
    setCurrentPage('concept-detail');
  };

  // 处理工具点击
  const handleToolClick = (id: number) => {
    setSelectedToolId(id);
    setCurrentPage('tool-detail');
  };

  // 返回上一页
  const handleBack = () => {
    if (currentPage === 'concept-detail') {
      setCurrentPage('concepts');
    } else if (currentPage === 'tool-detail') {
      setCurrentPage('tools');
    } else {
      setCurrentPage('home');
    }
  };

  // 处理相关概念点击
  const handleRelatedTermClick = (id: string) => {
    setSelectedTermId(id);
    // 保持在概念详情页，但更新显示的概念
  };

  // 根据当前页面渲染内容
  const renderContent = () => {
    switch (currentPage) {
      case 'concepts':
        return <ConceptsPage onTermClick={handleTermClick} />;
      case 'concept-detail':
        return (
          <TermDetail
            termId={selectedTermId}
            onBack={handleBack}
            onRelatedTermClick={handleRelatedTermClick}
          />
        );
      case 'tools':
        return <ToolsPage onToolClick={handleToolClick} />;
      case 'tool-detail':
        return <ToolDetail toolId={selectedToolId} onBack={handleBack} />;
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
                  className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setCurrentPage('concepts')}
                >
                  <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
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
                </div>
                
                <div
                  className="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setCurrentPage('tools')}
                >
                  <div className="bg-secondary/10 p-3 rounded-lg w-fit mb-4 group-hover:bg-secondary/20 transition-colors">
                    <Wrench size={24} className="text-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">AI 工具箱</h2>
                  <p className="text-muted-foreground mb-4">
                    发现各种实用的AI工具，从写作助手到设计工具，提升你的工作效率和创造力。
                  </p>
                  <div className="flex items-center text-foreground font-medium">
                    <span>浏览工具箱</span>
                    <div className="ml-2 w-5 h-5 rounded-full bg-foreground flex items-center justify-center text-background text-xs">
                      &gt;
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-border">
              <h2 className="text-2xl font-bold">热门资源</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer" onClick={() => handleTermClick('ai')}>
                  <h3 className="font-semibold mb-1">人工智能 (AI)</h3>
                  <p className="text-sm text-muted-foreground">了解人工智能的基础概念和发展历程</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer" onClick={() => handleTermClick('deep-learning')}>
                  <h3 className="font-semibold mb-1">深度学习</h3>
                  <p className="text-sm text-muted-foreground">探索深度学习算法和应用场景</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer" onClick={() => handleTermClick('generative-ai')}>
                  <h3 className="font-semibold mb-1">生成式AI</h3>
                  <p className="text-sm text-muted-foreground">了解AI如何创造文本、图像等内容</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-border">
              <h2 className="text-2xl font-bold">即将推出</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-muted border border-border/50 rounded-xl p-6 opacity-80">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                    <h3 className="text-xl font-semibold">知识笔记</h3>
                  </div>
                  <p className="text-muted-foreground">记录和整理你的AI学习过程，支持笔记编辑和分类管理。</p>
                </div>
                <div className="bg-muted border border-border/50 rounded-xl p-6 opacity-80">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                    <h3 className="text-xl font-semibold">应用广场</h3>
                  </div>
                  <p className="text-muted-foreground">展示和体验AI应用示例，包含Demo名称、描述、交互界面和技术细节。</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout onNavClick={handleNavClick}>
      {renderContent()}
    </Layout>
  );
};

export default AppContent;