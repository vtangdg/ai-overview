'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SearchBar, Card } from '../common';
import { ToolCard } from './tool-card';
import { AITool, aiTools, searchTools, mockCategories, getToolsByCategoryName, getAllCategories } from '../../lib/tools';
import { Wrench, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolsPageProps {
  onToolClick: (id: number) => void;
}

export const ToolsPage: React.FC<ToolsPageProps> = ({ onToolClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [filteredTools, setFilteredTools] = useState<AITool[]>(aiTools);

  const allCategories = getAllCategories();

  const filterTools = useCallback(() => {
    let results = getToolsByCategoryName(selectedCategory);

    if (searchQuery) {
      results = searchTools(searchQuery);
      if (selectedCategory !== '全部') {
        const category = mockCategories.find(cat =>
          cat.name.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (category) {
          results = results.filter(tool => tool.categoryId === category.id);
        }
      }
    }

    setFilteredTools(results);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    filterTools();
  }, [filterTools]);

  const handleSearch = () => {
    filterTools();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('全部');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="tech-icon-wrapper w-12 h-12 rounded-xl flex items-center justify-center">
            <Wrench size={24} className="tech-icon" strokeWidth={2} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">AI 工具箱</h1>
        </div>
        <div className="md:hidden">
          <SearchBar
            placeholder="搜索工具..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
          />
        </div>
      </div>

      <div className="hidden md:block">
        <SearchBar
          placeholder="搜索工具..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
        />
      </div>

      <div className="sticky top-0 z-30 bg-background border-b border-border py-3">
        <div className="overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <div className="inline-flex gap-2 px-1">
            {allCategories.map((category) => (
              <button
                key={category.id}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full transition-all',
                  selectedCategory === category.name
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
                )}
                onClick={() => setSelectedCategory(category.name)}
                aria-label={`选择${category.name}分类`}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="md:hidden flex justify-center mb-2">
        <button
          className="tech-btn px-6 py-3"
          onClick={clearFilters}
        >
          <span className="flex items-center gap-2">
            <X size={16} />
            清除筛选
          </span>
        </button>
      </div>

      <div className="text-sm text-muted-foreground font-semibold">
        找到 {filteredTools.length} 个工具
      </div>

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onClick={onToolClick} />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <div className="mb-4 p-3 bg-muted rounded-2xl">
            <Wrench size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">没有找到匹配的工具</h3>
          <p className="text-muted-foreground mb-4 font-semibold">
            尝试使用不同的搜索词或清除筛选条件
          </p>
          <button
            className="tech-btn px-6 py-3"
            onClick={clearFilters}
          >
            <span>清除筛选</span>
          </button>
        </Card>
      )}
    </div>
  );
};