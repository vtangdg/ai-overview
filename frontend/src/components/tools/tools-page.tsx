import React, { useState, useEffect, useCallback } from 'react';
import { SearchBar, Card } from '../common';
import { ToolCard } from './tool-card';
import { AITool, Category, SubCategory, aiTools, searchTools, mockCategories, getToolsByCategoryName, getAllCategories } from '../../lib/tools';
import { Wrench, X } from 'lucide-react';

interface ToolsPageProps {
  onToolClick: (id: number) => void;
}

export const ToolsPage: React.FC<ToolsPageProps> = ({ onToolClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [filteredTools, setFilteredTools] = useState<AITool[]>(aiTools);

  // 获取所有分类（包含"全部"选项）
  const allCategories = getAllCategories();

  const filterTools = useCallback(() => {
    let results = getToolsByCategoryName(selectedCategory);

    // 应用搜索过滤
    if (searchQuery) {
      results = searchTools(searchQuery);
      // 如果选择了非全部分类，再进行分类过滤
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

      {/* 搜索区域 - 桌面版 */}
      <div className="hidden md:block">
        <SearchBar
          placeholder="搜索工具..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
        />
      </div>

      {/* 固定横向导航栏 - 分类标签 */}
      <div className="sticky top-0 z-30 bg-background border-b border-border py-3">
        <div className="overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <div className="inline-flex gap-2 px-1">
            {allCategories.map((category) => (
              <button
                key={category.id}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all ${selectedCategory === category.name ? 'bg-primary text-primary-foreground font-medium' : 'bg-muted hover:bg-muted/80'}`}
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

      {/* 清除筛选按钮 - 移动版 */}
      <div className="md:hidden flex justify-center mb-2">
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          onClick={clearFilters}
        >
          <X size={16} />
          <span>清除筛选</span>
        </button>
      </div>

      {/* 结果统计 */}
      <div className="text-sm text-muted-foreground">
        找到 {filteredTools.length} 个工具
      </div>

      {/* 工具列表 */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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