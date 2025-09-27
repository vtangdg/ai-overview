import React from 'react';
import { AITool, getToolById } from '../../lib/tools';
import { Card, Tag } from '../common';
import { Wrench, Code, Building, Link2, ArrowLeft } from 'lucide-react';

interface ToolDetailProps {
  toolId: string;
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
        <h1 className="text-3xl font-bold">{tool.name}</h1>
      </div>

      <Card className="border-l-4 border-l-primary">
        <div className="mb-4 flex items-center gap-2">
          <Wrench size={20} className="text-primary" />
          <h2 className="text-xl font-semibold">工具介绍</h2>
        </div>
        <p className="text-lg leading-relaxed whitespace-pre-line">
          {tool.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag>{tool.category}</Tag>
          {tool.developer && (
            <Tag className="bg-secondary/80">
              <div className="flex items-center gap-1">
                <Building size={14} />
                <span>{tool.developer}</span>
              </div>
            </Tag>
          )}
          {tool.website && (
            <Tag className="bg-primary/10 text-primary">
              <div className="flex items-center gap-1">
                <Link2 size={14} />
                <span>官网</span>
              </div>
            </Tag>
          )}
        </div>
      </Card>

      {tool.features && tool.features.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Code size={20} className="text-primary" />
            <h2 className="text-xl font-semibold">核心功能</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tool.features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 p-3 bg-secondary rounded-lg"
              >
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};