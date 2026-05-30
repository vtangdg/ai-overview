'use client';

import { Layout } from '../components/common';
import Link from 'next/link';
import { ArrowRight, BookOpen, Wrench, FileText, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const homeContent = () => (
    <div className="space-y-16 relative">
      <div className="absolute inset-0 grid-pattern-subtle -z-10 pointer-events-none" />

      <div className="space-y-10 relative z-10">
        <div className="max-w-5xl space-y-8">
          <div className="animate-slide-up">
            <span className="tech-tag">
              <Sparkles size={14} />
              探索AI的无限可能
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight animate-slide-up stagger-1">
            <span className="tech-gradient-text">AI探索者</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl animate-slide-up stagger-2">
            探索人工智能的世界，从概念学习到工具应用，一站式AI知识及应用平台
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up stagger-3">
          <Link
            href="/concepts"
            className="tech-card p-8 no-underline group animate-slide-up stagger-1"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="tech-icon-wrapper w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen size={28} className="tech-icon" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold">AI 概念库</h2>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed flex-1">
                学习AI领域的核心概念，为深入理解和应用AI技术打下坚实基础。
              </p>
              <div className="flex items-center text-primary font-semibold group-hover:gap-3 transition-all">
                <span>浏览概念库</span>
                <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>

          <Link
            href="/tools"
            className="tech-card p-8 no-underline group animate-slide-up stagger-2"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="tech-icon-wrapper w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wrench size={28} className="tech-icon" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold">AI 工具箱</h2>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed flex-1">
                发现各种实用的AI工具，从写作助手到设计工具，提升你的工作效率和创造力。
              </p>
              <div className="flex items-center text-primary font-semibold group-hover:gap-3 transition-all">
                <span>浏览工具箱</span>
                <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>

          <Link
            href="/notes"
            className="tech-card p-8 no-underline group animate-slide-up stagger-3"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="tech-icon-wrapper w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={28} className="tech-icon" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold">知识笔记</h2>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed flex-1">
                浏览精心整理的AI相关知识，为你的AI学习之路提供实用参考和启发。
              </p>
              <div className="flex items-center text-primary font-semibold group-hover:gap-3 transition-all">
                <span>查看笔记</span>
                <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>

          <Link
            href="/demos"
            className="tech-card p-8 no-underline group animate-slide-up stagger-4"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="tech-icon-wrapper w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles size={28} className="tech-icon" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold">应用广场</h2>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed flex-1">
                体验多样化的AI应用示例，直观感受AI技术的实际应用。
              </p>
              <div className="flex items-center text-primary font-semibold group-hover:gap-3 transition-all">
                <span>立即探索</span>
                <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-10 relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="flex items-center justify-between">
          <h2 className="text-3xl sm:text-4xl font-bold">热门资源</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link href="/notes/02-prompt-engineering" className="tech-card p-6 no-underline group">
            <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors">提示词工程指南</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">掌握提示词设计的核心技巧和最佳实践</p>
          </Link>
          <Link href="/demos/prompt-optimizer" className="tech-card p-6 no-underline group">
            <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors">提示词优化器</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">快速生成和优化高质量提示词，提升AI交互效果</p>
          </Link>
          <Link href="/concepts/agi" className="tech-card p-6 no-underline group">
            <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors">通用人工智能 (AGI)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">具备与人类相似的全面认知能力的AI系统</p>
          </Link>
          <Link href="/tools/1001" className="tech-card p-6 no-underline group">
            <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors">DeepSeek</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">高性能大语言模型，提供智能对话和编程辅助</p>
          </Link>
          <Link href="/tools/1002" className="tech-card p-6 no-underline group">
            <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors">ChatGPT</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">OpenAI的强大对话AI助手</p>
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