import React from 'react';
import { getToolById } from '../../lib/tools';
import { Card, Tag } from '../common';
import { ArrowLeft } from 'lucide-react';

interface ToolDetailProps {
  toolId: number;
  onBack: () => void;
}

export const ToolDetail: React.FC<ToolDetailProps> = ({ 
  toolId, 
  onBack 
}) => {
  const tool = getToolById(toolId);

  if (!tool) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <p className="text-muted-foreground text-lg">工具不存在</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          onClick={onBack}
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button 
          className="p-2 rounded-md hover:bg-muted transition-colors"
          onClick={onBack}
          aria-label="返回"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold">
          <span className="text-2xl mr-2">{tool.icon}</span>
          {tool.name}
        </h1>
      </div>

      <Card className="border-l-4 border-l-primary">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">工具介绍</h2>
        </div>
        <p className="text-lg leading-relaxed whitespace-pre-line">
          {tool.breifDesc}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag>类别ID: {tool.categoryId}</Tag>
          <Tag>子类别ID: {tool.subcategoryId}</Tag>
        </div>
      </Card>
    </div>
  );
};