// 工具与分类数据统一维护在 data/tools.json（可由 scripts/tools-sync 自动更新）
import toolsData from '../../data/tools.json';

// 定义子分类接口
export interface SubCategory {
  id: number;
  name: string;
}

// 定义分类接口
export interface Category {
  id: number;
  name: string;
  icon: string;
  subcategories: SubCategory[];
}

// 定义AI工具的接口（简化版本）
export interface AITool {
  id: number;
  name: string;
  categoryId: number;
  subcategoryId: number;
  icon: string;
  breifDesc: string;
  categoryName?: string;
  subcategoryName?: string;
}

// AI工具分类数据
export const mockCategories: Category[] = toolsData.categories;

// AI工具数据
export const aiTools: AITool[] = toolsData.tools;

// 获取所有工具类别ID
export const getToolCategories = (): number[] => {
  const categories = [...new Set(aiTools.map((tool) => tool.categoryId))];
  return categories.sort((a, b) => a - b);
};

// 根据ID获取工具
export const getToolById = (id: number): AITool | undefined => {
  const tool = aiTools.find((tool) => tool.id === id);
  if (tool) {
    // 获取分类信息
    const category = getCategoryById(tool.categoryId);
    if (category) {
      tool.categoryName = category.name;
    }
    
    // 获取子分类信息
    const subCategoryInfo = getSubCategoryById(tool.subcategoryId);
    if (subCategoryInfo && subCategoryInfo.subcategory) {
      tool.subcategoryName = subCategoryInfo.subcategory.name;
    }
  }
  return tool;
};

// 根据类别ID筛选工具
export const getToolsByCategory = (categoryId: number): AITool[] => {
  return aiTools.filter((tool) => tool.categoryId === categoryId);
};

// 搜索工具
export const searchTools = (query: string): AITool[] => {
  const lowercaseQuery = query.toLowerCase();
  return aiTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowercaseQuery) ||
      tool.breifDesc.toLowerCase().includes(lowercaseQuery) ||
      tool.id.toString().includes(query)
  );
};

// 获取所有分类（包含"全部"选项）
export const getAllCategories = () => {
  return [
    { id: 0, name: '全部', icon: '🔍' },
    ...mockCategories
  ];
};

// 根据分类名称获取工具
export const getToolsByCategoryName = (categoryName: string): AITool[] => {
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

// 根据分类ID获取分类信息
export const getCategoryById = (id: number): Category | undefined => {
  return mockCategories.find(category => category.id === id);
};

// 根据子分类ID获取子分类信息
export const getSubCategoryById = (subcategoryId: number): { category: Category, subcategory: SubCategory } | undefined => {
  for (const category of mockCategories) {
    const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
    if (subcategory) {
      return { category, subcategory };
    }
  }
  return undefined;
};