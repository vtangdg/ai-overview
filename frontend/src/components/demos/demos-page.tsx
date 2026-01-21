import React, { useState } from 'react';
import { ArrowRight, Zap, Brain, Sparkles, Wrench } from 'lucide-react';
import { AlertModal } from '../ui/modal';

interface DemoCardData {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  available: boolean;
  tags?: string[];
  comingSoon?: boolean;
  url?: string;
}

export const DemosPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // 预定义所有可能的提示词，避免Next.js静态分析失败
  const demoPrompts: Record<string, string> = {
    'spring-ai-alibaba': (process.env.NEXT_PUBLIC_DEMO_URL_PROMPT_SPRING_AI_ALIBABA || ''),
    'concept-explainer': (process.env.NEXT_PUBLIC_DEMO_URL_PROMPT_CONCEPT_EXPLAINER || ''),
    'more-apps': (process.env.NEXT_PUBLIC_DEMO_URL_PROMPT_MORE_APPS || ''),
  };

  const demos: DemoCardData[] = [
    {
      id: 'prompt-optimizer',
      icon: <Sparkles className="w-6 h-6" />,
      title: '提示词优化器',
      description: '快速生成和优化高质量提示词，提升AI交互效果。',
      available: true,
      tags: ['提示词', '优化', '效率工具'],
      url: '/demos/prompt-optimizer'
    },
    {
      id: 'concept-explainer',
      icon: <Brain className="w-6 h-6" />,
      title: 'AI概念解释器',
      description: '使用DeepSeek大模型解释AI相关概念，获取简明定义、核心原理和应用场景。',
      available: true,
      tags: ['概念', '解释', 'DeepSeek'],
      url: '/demos/concept-explainer'
    },
    {
      id: 'spring-ai-alibaba',
      icon: <Wrench className="w-6 h-6" />,
      title: 'Spring AI Alibaba Playground',
      description: '探索Spring AI Alibaba框架的强大功能，包括智能对话、图像生成、文档总结、Tool Calling、RAG和MCP等。',
      available: true,
      tags: ['Spring AI', 'Spring AI Alibaba'],
      url: process.env.NEXT_PUBLIC_SPRING_AI_ALIBABA_URL || '#'
    },
    {
      id: 'more-apps',
      icon: <Zap className="w-6 h-6" />,
      title: '更多应用',
      description: '我们正在开发更多AI应用，敬请期待！',
      available: false,
      tags: ['开发中', '敬请期待'],
      comingSoon: true
    }
  ];

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Zap size={28} className="text-primary" />
          <h1 className="text-4xl font-bold">应用广场</h1>
        </div>
        <p className="text-xl text-muted-foreground leading-relaxed">
          探索和体验各种AI应用示例
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {demos.map((demo) => (
          <div
            key={demo.id}
            className={`group relative overflow-hidden rounded-2xl border card-hover flex flex-col h-64 ${
              demo.available
                ? 'bg-card border-border cursor-pointer'
                : 'bg-muted/50 border-border/50 cursor-not-allowed'
            }`}
            onClick={() => {
              if (demo.available) {
                if (demo.url && demo.url !== '#') {
                  window.location.href = demo.url;
                } else {
                  const promptText = demoPrompts[demo.id] || process.env.NEXT_PUBLIC_DEMO_URL_PROMPT || '该应用的URL未配置，请联系管理员获取访问地址。';
                  setModalMessage(promptText);
                  setShowModal(true);
                }
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* 内容区 - 占据剩余空间 */}
            <div className="relative z-10 flex-1 p-6 flex flex-col">
              {/* 标题区域 */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg text-primary">
                  {demo.icon}
                </div>
                <h2 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                  {demo.title}
                </h2>
              </div>

              {/* 描述区域 - 限制行数 */}
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                {demo.description}
              </p>
            </div>

            {/* 底部固定区域 */}
            <div className="relative z-10 px-6 pb-6 pt-0">
              {/* 标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {demo.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2.5 py-1 bg-secondary rounded-full text-secondary-foreground font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* 立即体验/即将推出 */}
              <div className="flex items-center justify-between">
                {demo.available ? (
                  <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                    <span>立即体验</span>
                    <ArrowRight size={16} className="ml-1" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                    <span className="text-xs text-muted-foreground font-medium">即将推出</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        message={modalMessage}
      />
    </div>
  );
};
