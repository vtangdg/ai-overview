import React from 'react';
import { Card } from '../common';
import { AITerm } from '../../lib/concepts';
import { BookOpen } from 'lucide-react';

interface TermCardProps {
  term: AITerm;
  onClick: (id: string) => void;
}

export const TermCard: React.FC<TermCardProps> = ({ term, onClick }) => {
  return (
    <Card
      title={term.name}
      description={term.definition.length > 100 
        ? `${term.definition.substring(0, 100)}...` 
        : term.definition}
      icon={<BookOpen size={20} />}
      tags={[term.category]}
      onClick={() => onClick(term.id)}
      className="h-full flex flex-col"
    />
  );
};