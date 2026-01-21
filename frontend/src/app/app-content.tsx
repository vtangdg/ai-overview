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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/concepts"
            className="group relative overflow-hidden rounded-2xl p-8 bg-card border border-border card-hover no-underline flex flex-col h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full">
              <h2 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">AI 概念库</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed flex-1">
                学习AI领域的核心概念，为深入理解和应用AI技术打下坚实基础。
              </p>
              <div className="flex items-center text-primary font-medium group-hover:gap-3 transition-all">
                <span>浏览概念库</span>
                <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>

          <Link
            href="/tools"
            className="group relative overflow-hidden rounded-2xl p-8 bg-card border border-border card-hover no-underline flex flex-col h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full">
              <h2 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">AI 工具箱</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed flex-1">
                发现各种实用的AI工具，从写作助手到设计工具，提升你的工作效率和创造力。
              </p>
              <div className="flex items-center text-primary font-medium group-hover:gap-3 transition-all">
                <span>浏览工具箱</span>
                <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>

          <Link
            href="/notes"
            className="group relative overflow-hidden rounded-2xl p-8 bg-card border border-border card-hover no-underline flex flex-col h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full">
              <h2 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">知识笔记</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed flex-1">
                浏览精心整理的AI相关知识，为你的AI学习之路提供实用参考和启发。
              </p>
              <div className="flex items-center text-primary font-medium group-hover:gap-3 transition-all">
                <span>查看笔记</span>
                <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>

          <Link
            href="/demos"
            className="group relative overflow-hidden rounded-2xl p-8 bg-card border border-border card-hover no-underline flex flex-col h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full">
              <h2 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">应用广场</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed flex-1">
                体验多样化的AI应用示例，直观感受AI技术的实际应用。
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link href="/notes/02-prompt-engineering" className="group bg-card border border-border rounded-xl p-6 card-hover no-underline">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">提示词工程指南</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">掌握提示词设计的核心技巧和最佳实践</p>
          </Link>
          <Link href="/demos/prompt-optimizer" className="group bg-card border border-border rounded-xl p-6 card-hover no-underline">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">提示词优化器</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">快速生成和优化高质量提示词，提升AI交互效果</p>
          </Link>
          <Link href="/concepts/agi" className="group bg-card border border-border rounded-xl p-6 card-hover no-underline">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">通用人工智能 (AGI)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">具备与人类相似的全面认知能力的AI系统</p>
          </Link>
          <Link href="/tools/1001" className="group bg-card border border-border rounded-xl p-6 card-hover no-underline">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">DeepSeek</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">高性能大语言模型，提供智能对话和编程辅助</p>
          </Link>
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