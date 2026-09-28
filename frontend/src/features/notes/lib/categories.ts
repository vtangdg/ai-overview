/**
 * 知识笔记分类配置
 */

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

export const categories: Category[] = [
  {
    id: 'ai-fundamentals',
    name: 'AI基础',
    description: '人工智能的基础概念和原理',
    icon: '📚',
    order: 1
  },
  {
    id: 'llm',
    name: '大语言模型',
    description: 'GPT、Claude等大模型相关',
    icon: '🤖',
    order: 2
  },
  {
    id: 'ai-tools',
    name: 'AI工具',
    description: 'LangChain、向量数据库等工具',
    icon: '🛠️',
    order: 3
  }
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id);
}

export function getCategoryName(id: string): string {
  const category = getCategoryById(id);
  return category?.name || id;
}
