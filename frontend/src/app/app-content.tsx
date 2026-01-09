'use client';

import { Layout } from '../components/common';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

const AppContent: React.FC = () => {
  const homeContent = () => (
    <div className="space-y-16">
      <div className="space-y-8">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles size={16} className="animate-pulse-slow" />
            <span>探索AI的无限可能</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="text-gradient">AI探索者</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">
            探索人工智能的世界，从概念学习到工具应用，一站式AI知识及应用平台
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/concepts"
            className="group relative overflow-hidden rounded-2xl p-8 bg-card border border-border card-hover no-underline"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">AI 概念库</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                探索AI领域的核心概念，建立完整的知识体系。每个概念包含简明定义和相关概念链接，帮助你形成知识网络。
              </p>
              <div className="flex items-center text-primary font-medium group-hover:gap-3 transition-all">
                <span>浏览概念库</span>
                <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>

          <Link
            href="/tools"
            className="group relative overflow-hidden rounded-2xl p-8 bg-card border border-border card-hover no-underline"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">AI 工具箱</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                发现各种实用的AI工具，从写作助手到设计工具，提升你的工作效率和创造力。
              </p>
              <div className="flex items-center text-primary font-medium group-hover:gap-3 transition-all">
                <span>浏览工具箱</span>
                <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>

          <Link
            href="/demos"
            className="group relative overflow-hidden rounded-2xl p-8 bg-card border border-border card-hover no-underline"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">应用广场</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                展示和体验AI应用示例，包含Demo名称、描述、交互界面和技术细节。
              </p>
              <div className="flex items-center text-primary font-medium group-hover:gap-3 transition-all">
                <span>立即探索</span>
                <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-8 pt-8 border-t border-border">
        <div className="flex items-center gap-3">
          <Zap size={24} className="text-primary" />
          <h2 className="text-3xl font-bold">热门资源</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/concepts/ai" className="group bg-card border border-border rounded-xl p-6 card-hover no-underline">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">人工智能 (AI)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">了解人工智能的基础概念和发展历程</p>
          </Link>
          <Link href="/concepts/deep-learning" className="group bg-card border border-border rounded-xl p-6 card-hover no-underline">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">深度学习</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">探索深度学习算法和应用场景</p>
          </Link>
          <Link href="/concepts/aigc" className="group bg-card border border-border rounded-xl p-6 card-hover no-underline">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">AIGC</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">了解AI如何创造文本、图像等内容</p>
          </Link>
          <a href={process.env.NEXT_PUBLIC_SPRING_AI_ALIBABA_URL || '#'} target="_blank" rel="noopener noreferrer" className="group bg-card border border-border rounded-xl p-6 card-hover no-underline">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Spring AI Alibaba</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">体验智能对话、图像生成、文档总结等AI功能</p>
          </a>
        </div>
      </div>

      <div className="space-y-8 pt-8 border-t border-border">
        <div className="flex items-center gap-3">
          <Sparkles size={24} className="text-primary animate-pulse-slow" />
          <h2 className="text-3xl font-bold">即将推出</h2>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 border border-border/50 rounded-2xl p-8 max-w-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-primary opacity-10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <h3 className="text-2xl font-bold">知识笔记</h3>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              记录和整理你的AI学习过程，支持笔记编辑和分类管理。
            </p>
          </div>
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