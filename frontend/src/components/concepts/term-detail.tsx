import React from 'react';
import { AITerm, getTermById } from '../../lib/concepts';
import { Card, Tag } from '../common';
import { BookOpen, Link, ArrowLeft } from 'lucide-react';

interface TermDetailProps {
  termId: string;
  onBack: () => void;
  onRelatedTermClick: (id: string) => void;
}

export const TermDetail: React.FC<TermDetailProps> = ({ 
  termId, 
  onBack, 
  onRelatedTermClick 
}) => {
  const term = getTermById(termId);

  if (!term) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <p className="text-muted-foreground text-lg">概念不存在</p>
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
        <h1 className="text-3xl font-bold">{term.name}</h1>
      </div>

      <Card className="border-l-4 border-l-primary">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-primary" />
          <h2 className="text-xl font-semibold">定义</h2>
        </div>
        <p className="text-lg leading-relaxed whitespace-pre-line">
          {term.definition}
        </p>
        <div className="mt-4">
          <Tag>{term.category}</Tag>
        </div>
      </Card>

      {term.relatedTerms.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Link size={20} className="text-primary" />
            <h2 className="text-xl font-semibold">相关概念</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {term.relatedTerms.map((relatedId) => {
              const relatedTerm = getTermById(relatedId);
              if (!relatedTerm) return null;
              return (
                <Card
                  key={relatedId}
                  title={relatedTerm.name}
                  description={relatedTerm.definition.length > 60 
                    ? `${relatedTerm.definition.substring(0, 60)}...` 
                    : relatedTerm.definition}
                  onClick={() => onRelatedTermClick(relatedId)}
                  className="cursor-pointer hover:shadow-md transition-all"
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};