import React, { useState } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { AlertModal } from '../ui/modal';

interface DemoCardData {
  id: string;
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
      id: 'concept-explainer',
      title: 'AI概念解释器',
      description: '使用DeepSeek大模型解释AI相关概念，获取简明定义、核心原理和应用场景。',
      available: true,
      tags: ['概念', '解释', 'DeepSeek'],
      url: '/demos/concept-explainer'
    },
    {
      id: 'spring-ai-alibaba',
      title: 'Spring AI Alibaba Playground',
      description: '探索Spring AI Alibaba框架的强大功能，包括智能对话、图像生成、文档总结、Tool Calling、RAG和MCP等。',
      available: true,
      tags: ['Spring AI', 'Spring AI Alibaba'],
      url: process.env.NEXT_PUBLIC_SPRING_AI_ALIBABA_URL || '#'
    },
    {
      id: 'more-apps',
      title: '更多应用',
      description: '我们正在开发更多AI应用，敬请期待！',
      available: false,
      tags: ['开发中', '更多应用', '敬请期待'],
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
            className={`group relative overflow-hidden rounded-2xl p-8 border card-hover ${
              demo.available
                ? 'bg-card border-border cursor-pointer'
                : 'bg-muted/50 border-border/50 cursor-not-allowed'
            }`}
            onClick={() => {
              if (demo.available) {
                if (demo.url && demo.url !== '#') {
                  window.open(demo.url, '_blank');
                } else {
                  const promptText = demoPrompts[demo.id] || process.env.NEXT_PUBLIC_DEMO_URL_PROMPT || '该应用的URL未配置，请联系管理员获取访问地址。';
                  setModalMessage(promptText);
                  setShowModal(true);
                }
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">{demo.title}</h2>
                {!demo.available && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                    <span className="text-xs text-muted-foreground font-medium">即将推出</span>
                  </div>
                )}
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">{demo.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {demo.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-3 py-1.5 bg-secondary rounded-full text-secondary-foreground font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {demo.available && (
                <div className="flex items-center text-primary font-medium group-hover:gap-3 transition-all">
                  <span>立即体验</span>
                  <ArrowRight size={18} className="ml-2" />
                </div>
              )}
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