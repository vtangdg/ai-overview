import React from 'react';
import { BookOpen } from 'lucide-react';

interface DemoCardData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  available: boolean;
  tags?: string[];
  comingSoon?: boolean;
  url?: string; // 添加URL字段用于新页面打开
}

interface DemosPageProps {
  // 移除onDemoClick属性，使用新页面打开方式
}

export const DemosPage: React.FC<DemosPageProps> = () => {
  // 示例Demo数据
  const demos: DemoCardData[] = [
    {
      id: 'concept-explainer',
      title: 'AI概念解释器',
      description: '使用DeepSeek大模型解释AI相关概念，获取简明定义、核心原理和应用场景。',
      icon: <BookOpen className="w-12 h-12 text-primary" />,
      available: true,
      tags: ['概念', '解释', 'DeepSeek'],
      url: '/demos/concept-explainer' // 添加对应的URL路径
    },
    {
      id: 'spring-ai-alibaba',
      title: 'Spring AI Alibaba Playground',
      description: '探索Spring AI Alibaba框架的强大功能，包括智能对话、图像生成、文档总结、Tool Calling、RAG和MCP等。',
      icon: <BookOpen className="w-12 h-12 text-primary" />,
      available: true,
      tags: ['Spring AI', 'Spring AI Alibaba'],
      url: process.env.NEXT_PUBLIC_SPRING_AI_ALIBABA_URL || '#'
    },
    {
      id: 'more-apps',
      title: '更多应用',
      description: '我们正在开发更多AI应用，敬请期待！',
      icon: <BookOpen className="w-12 h-12 text-muted-foreground" />,
      available: false,
      tags: ['开发中', '更多应用', '敬请期待'],
      comingSoon: true
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">应用广场</h1>
        <p className="text-muted-foreground">探索和体验各种AI应用示例</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {demos.map((demo) => (
          <div
            key={demo.id}
            className={`rounded-xl p-6 border ${demo.available
              ? 'border-border hover:border-primary/50 hover:shadow-md cursor-pointer transition-all'
              : 'border-border/50 bg-muted opacity-80 cursor-not-allowed'}
            `}
            onClick={() => demo.available && demo.url && window.open(demo.url, '_blank')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg">
                {demo.icon}
              </div>
              {!demo.available && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                  <span className="text-xs text-muted-foreground">即将推出</span>
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-bold mb-2">{demo.title}</h2>
            <p className="text-muted-foreground mb-4">{demo.description}</p>
            
            <div className="flex flex-wrap gap-2">
              {demo.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-secondary rounded-full text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            {demo.available && (
              <div className="mt-4 flex items-center text-primary font-medium">
                <span>立即体验</span>
                <div className="ml-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                  &gt;
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};