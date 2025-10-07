import React, { useState, useEffect } from 'react';
import { getToolById } from '../../lib/tools';
import { Card, Tag } from '../common';
import { MarkdownRenderer } from '../common/markdown/MarkdownRenderer';
import { ArrowLeft } from 'lucide-react';

interface ToolDetailProps {
  toolId: number;
  onBack: () => void;
}

export const ToolDetail: React.FC<ToolDetailProps> = ({ 
  toolId, 
  onBack 
}) => {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const tool = getToolById(toolId);

  // 读取markdown文件
  useEffect(() => {
    const fetchMarkdownContent = async () => {
      if (!tool) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const filePath = `/lib/tools/${tool.name}.md`;
        const response = await fetch(filePath);
        
        if (!response.ok) {
          throw new Error('暂无详细介绍');
        }
        
        const content = await response.text();
        setMarkdownContent(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMarkdownContent();
  }, [toolId, tool]);

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
      <div className="mt-4 flex flex-wrap gap-2">
        <Tag>类别: {tool.categoryName || tool.categoryId}</Tag>
        <Tag>子类别: {tool.subcategoryName || tool.subcategoryId}</Tag>
      </div>
      <Card className="border-l-4 border-l-primary">
         {isLoading && (
           <p className="text-muted-foreground">加载中...</p>
         )}
         {error && (
           <p className="text-destructive">{error}</p>
         )}
         {!isLoading && !error && markdownContent && (
           <div className="markdown-content">
             <MarkdownRenderer content={markdownContent} />
           </div>
         )}
         {!isLoading && !error && !markdownContent && (
           <p className="text-muted-foreground">暂无详细介绍</p>
         )}
       </Card>
    </div>
  );
};