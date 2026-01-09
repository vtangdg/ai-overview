import React from 'react';
import { Card } from '../common';
import { AITerm } from '../../lib/concepts';
import { ExternalLink } from 'lucide-react';

interface TermCardProps {
  term: AITerm;
  onClick: (id: string) => void;
  showLinks?: boolean;
}

export const TermCard: React.FC<TermCardProps> = ({ term, onClick, showLinks = true }) => {
  const renderCardContent = () => {
    return (
      <div className="flex flex-col h-full p-2">
        <div className="mb-4 space-y-2">
          <h4 className="text-xl font-bold group-hover:text-primary transition-colors">
            {term.name}
            {term.abbr && 
              <span className="text-muted-foreground">（{term.abbr}）</span>
            }
          </h4>
          
          <div className="text-sm text-muted-foreground font-medium">{term.enName}</div>
        </div>
        
        {showLinks && (term.baiduWiki || term.wikiPedia) ? (
          <div className="flex flex-wrap gap-2 mb-5 pb-4 border-b border-border/50">
            {term.baiduWiki && (
              <a 
                href={term.baiduWiki} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-sm font-medium hover:from-blue-100 hover:to-blue-200 transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <span>百度百科</span>
                <ExternalLink size={12} />
              </a>
            )}
            {term.wikiPedia && (
              <a 
                href={term.wikiPedia} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-full text-sm font-medium hover:from-red-100 hover:to-red-200 transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <span>维基百科</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        ) : null}
        
        <div className="mb-5 flex-1">
          <p className="text-base text-muted-foreground leading-relaxed">
              {term.definition.length > 100 
                ? `${term.definition.substring(0, 100)}...` 
                : term.definition}
            </p>
        </div>
        
        {term.category && (
          <div className="mt-auto">
            <span className="inline-block text-xs px-3 py-1.5 bg-gradient-primary text-primary-foreground rounded-full font-medium">
              {term.category}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card
      className="h-full card-hover cursor-pointer group"
      onClick={() => onClick(term.id)}
    >
      {renderCardContent()}
    </Card>
  );
};