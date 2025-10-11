import React from 'react';
import { Card } from '../common';
import { AITerm } from '../../lib/concepts';
import { ExternalLink } from 'lucide-react';

interface TermCardProps {
  term: AITerm;
  onClick: (id: string) => void;
  showLinks?: boolean; // 是否显示百科链接的开关
}

export const TermCard: React.FC<TermCardProps> = ({ term, onClick, showLinks = true }) => {
  // 创建卡片内容，包括标题、百科链接和描述
  const renderCardContent = () => {
    return (
      <div className="flex flex-col h-full p-1">
        {/* 标题部分 - 更大更醒目 */}
        <div className="mb-3">
          <h4 className="text-xl font-bold">{term.name}</h4>
        </div>
        
        {/* 百科链接部分 - 带背景色突出显示 */}
        {showLinks && (term.baiduWiki || term.wikiPedia) ? (
          <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-border">
            {term.baiduWiki && (
              <a 
                href={term.baiduWiki} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                <span>百度百科</span>
                <ExternalLink size={14} />
              </a>
            )}
            {term.wikiPedia && (
              <a 
                href={term.wikiPedia} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <span>维基百科</span>
                
              </a>
            )}
          </div>
        ) : null}
        
        {/* 定义部分 - 增加间距和可读性 */}
        <div className="mb-4">
          <p className="text-base text-muted-foreground leading-relaxed">
              {term.definition.length > 100 
                ? `${term.definition.substring(0, 100)}...` 
                : term.definition}
            </p>
        </div>
        
        {/* 分类标签 */}
        {term.category && (
          <div className="mt-auto">
            <span className="inline-block text-xs px-3 py-1 bg-secondary rounded-full text-secondary-foreground font-medium">
              {term.category}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card
      className="h-full hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(term.id)}
    >
      {renderCardContent()}
    </Card>
  );
};