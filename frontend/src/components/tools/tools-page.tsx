import React, { useState, useEffect } from 'react';
import { SearchBar, Card } from '../common';
import { ToolCard } from './tool-card';
import { AITool, aiTools, getToolCategories, searchTools, getToolsByCategory } from '../../lib/tools';
import { Wrench, Filter, X, ChevronRight } from 'lucide-react';

interface ToolsPageProps {
  onToolClick: (id: string) => void;
}

export const ToolsPage: React.FC<ToolsPageProps> = ({ onToolClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [categories, setCategories] = useState<string[]>([]);
  const [filteredTools, setFilteredTools] = useState<AITool[]>(aiTools);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setCategories(['全部', ...getToolCategories()]);
    filterTools();
  }, [searchQuery, selectedCategory]);

  const filterTools = () => {
    let results = aiTools;

    // 应用搜索过滤
    if (searchQuery) {
      results = searchTools(searchQuery);
    }

    // 应用分类过滤
    if (selectedCategory && selectedCategory !== '全部') {
      results = getToolsByCategory(selectedCategory);
    }

    setFilteredTools(results);
  };

  const handleSearch = () => {
    filterTools();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('全部');
    setIsFilterOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Wrench size={24} className="text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">AI 工具箱</h1>
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

      {/* 搜索和过滤区域 - 桌面版 */}
      <div className="hidden md:flex gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="搜索工具..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
          />
        </div>
        <div className="relative">
          <button
            className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg bg-background hover:bg-muted transition-colors"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={18} />
            <span>分类: {selectedCategory}</span>
          </button>
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-card border border-border shadow-lg z-10 py-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${selectedCategory === category ? 'bg-primary/10 text-primary font-medium' : ''}`}
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsFilterOpen(false);
                  }}
                >
                  {category}
                </button>
              ))}
              <div className="border-t border-border mt-2 pt-2 px-4">
                <button
                  className="flex items-center gap-2 w-full text-left px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={clearFilters}
                >
                  <X size={16} />
                  <span>清除筛选</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 筛选条 - 移动版 */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center justify-between px-4 py-2 border border-input rounded-lg bg-muted">
          <span className="text-sm">分类: {selectedCategory}</span>
          <button
            className="flex items-center gap-1 text-sm text-primary"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={16} />
            <span>{isFilterOpen ? '收起' : '筛选'}</span>
          </button>
        </div>
        {isFilterOpen && (
          <div className="border border-input rounded-lg bg-card p-4 space-y-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${selectedCategory === category ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
            <button
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              onClick={clearFilters}
            >
              <X size={16} />
              <span>清除筛选</span>
            </button>
          </div>
        )}
      </div>

      {/* 结果统计 */}
      <div className="text-sm text-muted-foreground">
        找到 {filteredTools.length} 个工具
      </div>

      {/* 工具列表 */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onClick={onToolClick} />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <div className="mb-4 p-3 bg-muted rounded-full">
            <Wrench size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">没有找到匹配的工具</h3>
          <p className="text-muted-foreground mb-4">
            尝试使用不同的搜索词或清除筛选条件
          </p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            onClick={clearFilters}
          >
            清除筛选
          </button>
        </Card>
      )}
    </div>
  );
};