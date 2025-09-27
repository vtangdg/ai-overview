import React from 'react';
import { Card } from '../common';
import { AITool } from '../../lib/tools';
import { Wrench } from 'lucide-react';

interface ToolCardProps {
  tool: AITool;
  onClick: (id: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  return (
    <Card
      title={tool.name}
      description={tool.description}
      icon={<Wrench size={20} />}
      tags={[tool.category]}
      onClick={() => onClick(tool.id)}
      className="h-full flex flex-col"
    />
  );
};