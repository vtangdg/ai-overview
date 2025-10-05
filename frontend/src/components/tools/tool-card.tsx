import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { AITool } from '../../lib/tools';

interface ToolCardProps {
  tool: AITool;
  onClick: (id: number) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  // 截断简介文本，超过10个字显示省略号
  const truncatedDesc = tool.breifDesc.length > 10 
    ? `${tool.breifDesc.substring(0, 10)}...` 
    : tool.breifDesc;

  // 悬停状态管理
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative h-full">
      {/* 卡片主体 */}
      <div
        className={cn(
          'flex items-center gap-3 bg-card border border-border rounded-lg p-3 transition-all duration-300 hover:shadow-md hover:border-primary/50 cursor-pointer',
          'h-full'
        )}
        onClick={() => onClick(tool.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 左侧图标 */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
          {tool.icon}
        </div>
        
        {/* 右侧内容 */}
        <div className="flex-1 min-w-0">
          {/* 工具名称 */}
          <h3 className="text-lg font-semibold mb-1 truncate">
            {tool.name}
          </h3>
          
          {/* 工具简介（超过10字显示省略号） */}
          <p className="text-muted-foreground text-sm truncate">
            {truncatedDesc}
          </p>
        </div>
      </div>
      
      {/* 悬停提示 - 在卡片正下方显示完整简介，深灰色背景，白色文字 */}
      {isHovered && (
        <div 
          className="absolute left-0 right-0 top-full mt-2 bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm z-10 whitespace-normal dark:bg-gray-900"
          style={{ minWidth: '100%' }}
        >
          {tool.breifDesc}
        </div>
      )}
    </div>
  );
};