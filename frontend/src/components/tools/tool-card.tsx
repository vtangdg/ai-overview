import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { AITool } from '../../lib/tools';

interface ToolCardProps {
  tool: AITool;
  onClick: (id: number) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  const truncatedDesc = tool.breifDesc.length > 10
    ? `${tool.breifDesc.substring(0, 10)}...`
    : tool.breifDesc;

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative h-full">
      <div
        className={cn(
          'flex items-center gap-4 bg-card border border-border rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full group',
          'hover:border-primary/50'
        )}
        onClick={() => onClick(tool.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl group-hover:from-primary group-hover:to-accent transition-all">
          {tool.icon.includes('/tool-icon/') || tool.icon.includes('.png') || tool.icon.includes('.jpg') || tool.icon.includes('.svg') ? (
            <div className="relative w-full h-full">
              <Image
                src={tool.icon}
                alt={tool.name}
                width={56}
                height={56}
                className="object-cover rounded-xl"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          ) : (
            tool.icon
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold mb-1.5 truncate group-hover:text-primary transition-colors">
            {tool.name}
          </h3>
          <p className="text-muted-foreground text-sm truncate font-medium">
            {truncatedDesc}
          </p>
        </div>
      </div>

      {isHovered && (
        <div
          className="absolute left-0 right-0 top-full mt-2 bg-popover/90 border border-border rounded-xl p-4 shadow-xl text-sm z-10 backdrop-blur-sm"
          style={{ minWidth: '100%', maxWidth: '300px' }}
        >
          <p className="font-medium text-popover-foreground leading-relaxed">{tool.breifDesc}</p>
        </div>
      )}
    </div>
  );
};