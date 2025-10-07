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
export const mockCategories: Category[] = [
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

// 示例AI工具数据（完整版本，包含所有一级类目）
export const aiTools: AITool[] = [
  // AI写作工具 (categoryId: 1)
  {
    id: 1001,
    name: '星月写作',
    categoryId: 1,
    subcategoryId: 101,
    icon: '✍️',
    breifDesc: '专注于学术论文和英文写作的AI写作助手。'
  },
  {
    id: 1002,
    name: '蛙蛙写作',
    categoryId: 1,
    subcategoryId: 101,
    icon: '✏️',
    breifDesc: '支持多种文体生成的AI写作工具。'
  },
  {
    id: 1003,
    name: '笔灵AI论文',
    categoryId: 1,
    subcategoryId: 102,
    icon: '📝',
    breifDesc: '国内全能型论文写作助手，帮助用户快速完成学术论文。'
  },
  {
    id: 1004,
    name: '66AI论文',
    categoryId: 1,
    subcategoryId: 102,
    icon: '📄',
    breifDesc: '专业的AI论文写作工具，提供学术论文全流程支持。'
  },
  {
    id: 1005,
    name: '笔王AI论文',
    categoryId: 1,
    subcategoryId: 102,
    icon: '📑',
    breifDesc: '专注于提高写作效率的AI论文写作工具。'
  },
  {
    id: 1006,
    name: '茅亭论文写作',
    categoryId: 1,
    subcategoryId: 102,
    icon: '🎓',
    breifDesc: '提供从选题到定稿全流程服务的AI论文写作平台。'
  },
  {
    id: 1007,
    name: '讯飞文书',
    categoryId: 1,
    subcategoryId: 101,
    icon: '📋',
    breifDesc: '基于大模型的智能文书生成工具，适用于多种场景。'
  },
  {
    id: 1008,
    name: '讯飞绘文',
    categoryId: 1,
    subcategoryId: 101,
    icon: '🎨',
    breifDesc: '一站式AIGC内容生成平台，支持多种内容形式。'
  },
  
  // AI图像工具 (categoryId: 2)
  {
    id: 2001,
    name: 'Midjourney',
    categoryId: 2,
    subcategoryId: 201,
    icon: '🎨',
    breifDesc: '生成高质量艺术图像的AI创作平台。'
  },
  {
    id: 2002,
    name: 'DALL-E 3',
    categoryId: 2,
    subcategoryId: 201,
    icon: '🖼️',
    breifDesc: 'OpenAI开发的文本到图像生成模型。'
  },
  {
    id: 2003,
    name: 'Remove.bg',
    categoryId: 2,
    subcategoryId: 202,
    icon: '✂️',
    breifDesc: '一键移除图片背景的AI工具。'
  },
  {
    id: 2004,
    name: 'PicsArt',
    categoryId: 2,
    subcategoryId: 203,
    icon: '✎',
    breifDesc: '提供图像编辑和修复功能的AI设计平台。'
  },
  
  // AI语音工具 (categoryId: 3)
  {
    id: 3001,
    name: '讯飞语音合成',
    categoryId: 3,
    subcategoryId: 301,
    icon: '🔊',
    breifDesc: '将文字转换为自然流畅语音的AI服务。'
  },
  {
    id: 3002,
    name: 'Deepgram',
    categoryId: 3,
    subcategoryId: 302,
    icon: '🎤',
    breifDesc: '高精度语音识别和转写服务。'
  },
  {
    id: 3003,
    name: 'Otter.ai',
    categoryId: 3,
    subcategoryId: 303,
    icon: '📝',
    breifDesc: '自动记录和转写会议内容的AI助手。'
  },
  
  // AI编程工具 (categoryId: 4)
  {
    id: 4001,
    name: 'GitHub Copilot',
    categoryId: 4,
    subcategoryId: 401,
    icon: '💻',
    breifDesc: '实时代码生成和补全的AI编程助手。'
  },
  {
    id: 4002,
    name: 'CodeGeeX',
    categoryId: 4,
    subcategoryId: 401,
    icon: '🚀',
    breifDesc: '国产代码生成模型，支持多种编程语言。'
  },
  {
    id: 4003,
    name: 'SonarQube',
    categoryId: 4,
    subcategoryId: 402,
    icon: '👁️',
    breifDesc: '代码质量检查和安全漏洞扫描工具。'
  },
  {
    id: 4004,
    name: 'TabNine',
    categoryId: 4,
    subcategoryId: 403,
    icon: '📝',
    breifDesc: '智能代码注释和自动完成工具。'
  },
  
  // AI数据分析工具 (categoryId: 5)
  {
    id: 5001,
    name: 'Tableau',
    categoryId: 5,
    subcategoryId: 501,
    icon: '📊',
    breifDesc: '强大的数据可视化和商业智能工具。'
  },
  {
    id: 5002,
    name: 'Alteryx',
    categoryId: 5,
    subcategoryId: 502,
    icon: '🧹',
    breifDesc: '自动化数据清洗和准备的AI平台。'
  },
  {
    id: 5003,
    name: 'KNIME',
    categoryId: 5,
    subcategoryId: 503,
    icon: '🔍',
    breifDesc: '开源数据挖掘和分析平台。'
  },
  
  // AI翻译工具 (categoryId: 6)
  {
    id: 6001,
    name: 'DeepL翻译',
    categoryId: 6,
    subcategoryId: 601,
    icon: '📄',
    breifDesc: '高精度文档翻译服务，支持多种格式。'
  },
  {
    id: 6002,
    name: '讯飞翻译',
    categoryId: 6,
    subcategoryId: 602,
    icon: '🌐',
    breifDesc: '提供实时语音和文本翻译的AI服务。'
  },
  {
    id: 6003,
    name: 'SDL Trados',
    categoryId: 6,
    subcategoryId: 603,
    icon: '🏢',
    breifDesc: '专业的本地化和翻译管理系统。'
  }
];

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