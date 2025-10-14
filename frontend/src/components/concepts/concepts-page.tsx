import React, { useState, useEffect } from 'react';
import { SearchBar, Card } from '../common';
import { TermCard } from './term-card';
import { AITerm, aiTerms, getCategories, searchTerms, getTermsByCategory } from '../../lib/concepts';
import { BookOpen, Filter, X } from 'lucide-react';

interface ConceptsPageProps {
  onTermClick: (id: string) => void;
}

export const ConceptsPage: React.FC<ConceptsPageProps> = ({ onTermClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [categories, setCategories] = useState<string[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<AITerm[]>(aiTerms);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setCategories(['全部', ...getCategories()]);
    filterTerms();
  }, [searchQuery, selectedCategory]);

  const filterTerms = () => {
    let results = aiTerms;

    // 先应用搜索过滤
    if (searchQuery) {
      results = searchTerms(searchQuery);
    }

    // 然后在搜索结果的基础上应用分类过滤
    if (selectedCategory && selectedCategory !== '全部') {
      results = results.filter(term => term.category === selectedCategory);
    }

    // 按照name字段排序
    results = [...results].sort((a, b) => a.name.localeCompare(b.name));

    setFilteredTerms(results);
  };

  const handleSearch = () => {
    filterTerms();
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
          <BookOpen size={24} className="text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">AI 概念库</h1>
        </div>
        <div className="md:hidden">
          <SearchBar
            placeholder="搜索概念..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* 搜索区域 - 桌面版 */}
      <div className="hidden md:block">
        <SearchBar
          placeholder="搜索概念..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
        />
      </div>

      {/* 固定横向导航栏 - 分类标签 */}
      <div className="sticky top-0 z-30 bg-background border-b border-border py-3">
        <div className="overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <div className="inline-flex gap-2 px-1">
            {categories.map((category) => (
              <button
                key={category}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all ${selectedCategory === category ? 'bg-primary text-primary-foreground font-medium' : 'bg-muted hover:bg-muted/80'}`}
                onClick={() => setSelectedCategory(category)}
                aria-label={`选择${category}分类`}
              >
                <span>{category}</span>
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
        找到 {filteredTerms.length} 个概念
      </div>

      {/* 概念列表 */}
      {filteredTerms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTerms.map((term) => (
            <TermCard 
              key={term.id} 
              term={term} 
              onClick={onTermClick} 
              showLinks={true} // 可以根据需求设置为false来隐藏百科链接
            />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <div className="mb-4 p-3 bg-muted rounded-full">
            <BookOpen size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">没有找到匹配的概念</h3>
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