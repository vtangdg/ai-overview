// 定义AI概念的接口
export interface AITerm {
  id: string;
  name: string; // 中文名称
  abbr?: string; // 简写/缩写（如AI）
  enName: string; // 英文全称
  definition: string;
  relatedTerms: string[];
  category: string;
  baiduWiki?: string; // 百度百科链接
  wikiPedia?: string; // 维基百科链接
}

// 从JSON文件导入AI概念数据
import aiTermsData from './concept_term.json';

// 转换数据以符合新的AITerm接口结构
export const aiTerms: AITerm[] = aiTermsData.map(term => ({
  id: term.id,
  name: term.name, 
  abbr: term.abbr, 
  enName: term.enName, 
  definition: term.definition,
  relatedTerms: term.relatedTerms,
  category: term.category,
  baiduWiki: term.baiduWiki,
  wikiPedia: term.wikiPedia
}));

// 获取所有概念类别
export const getCategories = (): string[] => {
  const categories = [...new Set(aiTerms.map((term) => term.category))];
  return categories.sort();
};

// 根据ID获取概念
export const getTermById = (id: string): AITerm | undefined => {
  return aiTerms.find((term) => term.id === id);
};

// 根据类别筛选概念
export const getTermsByCategory = (category: string): AITerm[] => {
  return aiTerms.filter((term) => term.category === category);
};

// 搜索概念
export const searchTerms = (query: string): AITerm[] => {
  const lowercaseQuery = query.toLowerCase();
  return aiTerms.filter(
    (term) =>
      term.name.toLowerCase().includes(lowercaseQuery) ||
      (term.abbr && term.abbr.toLowerCase().includes(lowercaseQuery)) || 
      term.enName.toLowerCase().includes(lowercaseQuery) ||
      term.definition.toLowerCase().includes(lowercaseQuery) 
  );
};

// 按类别获取所有术语名称分组
export const getTermsByCategoryNames = (): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  
  aiTerms.forEach(term => {
    if (!result[term.category]) {
      result[term.category] = [];
    }
    result[term.category].push(term.name);
  });
  
  // 对每个分类中的名称进行排序
  Object.keys(result).forEach(category => {
    result[category].sort();
  });
  
  return result;
};