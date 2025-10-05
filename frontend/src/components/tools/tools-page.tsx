import React, { useState, useEffect, useCallback } from 'react';
import { SearchBar, Card } from '../common';
import { ToolCard } from './tool-card';
import { AITool, aiTools, searchTools } from '../../lib/tools';
import { Wrench, X } from 'lucide-react';

interface ToolsPageProps {
  onToolClick: (id: number) => void;
}

interface SubCategory {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  subcategories: SubCategory[];
}

// Mock分类数据
const mockCategories: Category[] = [
  {
    id: 1,
    name: "AI写作工具",
    icon: "✍️",
    subcategories: [
      { id: 101, name: "论文写作" },
      { id: 102, name: "营销文案" },
      { id: 103, name: "创意写作" }
    ]
  },
  {
    id: 2,
    name: "AI图像工具",
    icon: "🖼️",
    subcategories: [
      { id: 201, name: "插画生成" },
      { id: 202, name: "背景移除" },
      { id: 203, name: "图像修复" }
    ]
  },
  {
    id: 3,
    name: "AI语音工具",
    icon: "🔊",
    subcategories: [
      { id: 301, name: "语音合成" },
      { id: 302, name: "语音识别" },
      { id: 303, name: "语音转写" }
    ]
  },
  {
    id: 4,
    name: "AI编程工具",
    icon: "💻",
    subcategories: [
      { id: 401, name: "代码生成" },
      { id: 402, name: "代码审查" },
      { id: 403, name: "代码注释" }
    ]
  },
  {
    id: 5,
    name: "AI数据分析工具",
    icon: "📊",
    subcategories: [
      { id: 501, name: "数据可视化" },
      { id: 502, name: "数据清洗" },
      { id: 503, name: "数据挖掘" }
    ]
  },
  {
    id: 6,
    name: "AI翻译工具",
    icon: "🌐",
    subcategories: [
      { id: 601, name: "文档翻译" },
      { id: 602, name: "实时翻译" },
      { id: 603, name: "本地化" }
    ]
  }
];

// 根据分类名称获取工具（模拟实现）
const getToolsByCategoryName = (categoryName: string): AITool[] => {
  if (categoryName === '全部') {
    return aiTools;
  }
  // 根据分类名称查找对应的分类ID
  const category = mockCategories.find(cat => 
    cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  // 如果找到分类，返回该分类下的工具
  if (category) {
    return aiTools.filter(tool => tool.categoryId === category.id);
  }
  return [];
};

export const ToolsPage: React.FC<ToolsPageProps> = ({ onToolClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [filteredTools, setFilteredTools] = useState<AITool[]>(aiTools);

  // 合并所有分类（添加"全部"选项）
  const allCategories = [
    { id: 0, name: '全部', icon: '🔍' },
    ...mockCategories
  ];

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