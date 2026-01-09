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
          'flex items-center gap-4 bg-card border border-border rounded-xl p-4 transition-all duration-300 card-hover cursor-pointer',
          'h-full group'
        )}
        onClick={() => onClick(tool.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
          {tool.icon.includes('/tool-icon/') || tool.icon.includes('.png') || tool.icon.includes('.jpg') || tool.icon.includes('.svg') ? (
            <div className="relative w-full h-full">
              <Image 
                src={tool.icon} 
                alt={tool.name} 
                width={56} 
                height={56} 
                className="object-cover rounded-2xl" 
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
          <p className="text-muted-foreground text-sm truncate">
            {truncatedDesc}
          </p>
        </div>
      </div>
      
      {isHovered && (
        <div 
          className="absolute left-0 right-0 top-full mt-2 bg-gradient-to-br from-gray-800 to-gray-900 text-white p-4 rounded-xl shadow-2xl text-sm z-10 whitespace-nowrap dark:from-gray-900 dark:to-gray-950"
          style={{ minWidth: '100%' }}
        >
          {tool.breifDesc}
        </div>
      )}
    </div>
  );
};