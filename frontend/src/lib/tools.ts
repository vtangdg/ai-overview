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
    name: "AI对话聊天",
    icon: "💬",
    subcategories: []
  },
  {
    id: 2,
    name: "AI提示词",
    icon: "📝",
    subcategories: []
  },
  {
    id: 3,
    name: "AI写作工具",
    icon: "✍️",
    subcategories: []
  },
  {
    id: 4,
    name: "AI图像工具",
    icon: "🖼️",
    subcategories: [
      { id: 401, name: "插画生成" },
      { id: 402, name: "背景移除" }
    ]
  },
  {
    id: 5,
    name: "AI语音工具",
    icon: "🔊",
    subcategories: []
  },
  {
    id: 6,
    name: "AI视频工具",
    icon: "🎬",
    subcategories: [
      { id: 601, name: "视频生成" }
    ]
  },
  {
    id: 7,
    name: "AI编程工具",
    icon: "💻",
    subcategories: []
  },
  {
    id: 8,
    name: "AI开发平台",
    icon: "🚀",
    subcategories: []
  },
  {
    id: 9,
    name: "AI办公",
    icon: "🏢",
    subcategories: []
  }
];

// 示例AI工具数据（完整版本，包含所有一级类目）
export const aiTools: AITool[] = [
  // AI对话聊天 (categoryId: 1)
  {
    id: 1001,
    name: 'DeepSeek',
    categoryId: 1,
    subcategoryId: 0,
    icon: '/tool-icon/deepseek.png',
    breifDesc: '高性能大语言模型，提供智能对话和编程辅助。'
  },
  {
    id: 1002,
    name: '豆包',
    categoryId: 1,
    subcategoryId: 0,
    icon: '/tool-icon/doubao.png',
    breifDesc: '字节跳动开发的智能对话助手，支持多轮对话和任务执行。'
  },
  {
    id: 1003,
    name: '腾讯元宝',
    categoryId: 1,
    subcategoryId: 0,
    icon: '/tool-icon/yuanbao.png',
    breifDesc: '腾讯推出的智能助手，提供生活和工作辅助。'
  },
  {
    id: 1004,
    name: 'ChatGPT',
    categoryId: 1,
    subcategoryId: 0,
    icon: '/tool-icon/chatgpt.svg',
    breifDesc: 'OpenAI开发的强大语言模型，支持多领域对话和内容生成。'
  },
  {
    id: 1005,
    name: 'Kimi',
    categoryId: 1,
    subcategoryId: 0,
    icon: '/tool-icon/kimi.png',
    breifDesc: '月之暗面开发的大语言模型，支持长文本处理。'
  },
  {
    id: 1006,
    name: '通义千问',
    categoryId: 1,
    subcategoryId: 0,
    icon: '/tool-icon/qianwen.png',
    breifDesc: '阿里云开发的大语言模型，提供智能问答和创意生成。'
  },
  {
    id: 1007,
    name: '文心一言',
    categoryId: 1,
    subcategoryId: 0,
    icon: '/tool-icon/yiyan.png',
    breifDesc: '百度开发的智能对话助手，支持多模态交互。'
  },
  
  // AI提示词 (categoryId: 2)
  {
    id: 2001,
    name: 'PromptPilot',
    categoryId: 2,
    subcategoryId: 0,
    icon: '/tool-icon/promptpilot.png',
    breifDesc: '提示词优化和管理工具，帮助用户创建高质量的AI提示。'
  },
  
  // AI写作工具 (categoryId: 3)
  {
    id: 3001,
    name: '星月写作',
    categoryId: 3,
    subcategoryId: 0,
    icon: '/tool-icon/xingyuexiezuo.png',
    breifDesc: '专注于学术论文和英文写作的AI写作助手。'
  },
  {
    id: 3002,
    name: '讯飞绘文',
    categoryId: 3,
    subcategoryId: 0,
    icon: '/tool-icon/xfyun.png',
    breifDesc: '一站式AIGC内容生成平台，支持多种内容形式。'
  },
  {
    id: 3003,
    name: 'aibiye',
    categoryId: 3,
    subcategoryId: 0,
    icon: '📝',
    breifDesc: 'AI辅助写作工具，提供文案创作和内容生成服务。'
  },
  
  // AI图像工具 (categoryId: 4)
  {
    id: 4001,
    name: 'Midjourney',
    categoryId: 4,
    subcategoryId: 401,
    icon: '🎨',
    breifDesc: '生成高质量艺术图像的AI创作平台。'
  },
  {
    id: 4002,
    name: 'Remove.bg',
    categoryId: 4,
    subcategoryId: 402,
    icon: '/tool-icon/removebg.png',
    breifDesc: '一键移除图片背景的AI工具。'
  },
  
  // AI语音工具 (categoryId: 5)
  {
    id: 5001,
    name: '讯飞听见',
    categoryId: 5,
    subcategoryId: 0,
    icon: '/tool-icon/iflyrec.png',
    breifDesc: '科大讯飞开发的语音识别和转写服务。'
  },
  
  // AI视频工具 (categoryId: 6)
  {
    id: 6001,
    name: 'Veo3',
    categoryId: 6,
    subcategoryId: 601,
    icon: '🎬',
    breifDesc: 'AI视频生成工具，支持文本到视频的转换。'
  },
  {
    id: 6002,
    name: 'Sora',
    categoryId: 6,
    subcategoryId: 601,
    icon: '🌌',
    breifDesc: 'OpenAI开发的视频生成模型，支持生成高质量视频内容。'
  },
  {
    id: 6003,
    name: '即梦AI',
    categoryId: 6,
    subcategoryId: 601,
    icon: '/tool-icon/jimeng.png',
    breifDesc: '国产AI视频生成工具，提供创意视频制作服务。'
  },
  
  // AI编程工具 (categoryId: 7)
  {
    id: 7001,
    name: 'Trae',
    categoryId: 7,
    subcategoryId: 0,
    icon: '/tool-icon/trae.png',
    breifDesc: 'AI驱动的开发工具，提供智能编程辅助和代码生成。'
  },
  {
    id: 7002,
    name: 'Cursor',
    categoryId: 7,
    subcategoryId: 0,
    icon: '/tool-icon/cursor.png',
    breifDesc: 'AI增强的代码编辑器，提供实时代码补全和分析。'
  },
  {
    id: 7003,
    name: 'Github Copilot',
    categoryId: 7,
    subcategoryId: 0,
    icon: '/tool-icon/copilot.svg',
    breifDesc: '实时代码生成和补全的AI编程助手。'
  },
  {
    id: 7004,
    name: '通义灵码',
    categoryId: 7,
    subcategoryId: 0,
    icon: '/tool-icon/lingma.png',
    breifDesc: '阿里云开发的智能编程助手，支持多种编程语言。'
  },
  
  // AI开发平台 (categoryId: 8)
  {
    id: 8001,
    name: 'Coze',
    categoryId: 8,
    subcategoryId: 0,
    icon: '/tool-icon/coze.png',
    breifDesc: 'AI应用开发平台，支持快速构建和部署AI应用。'
  },
  {
    id: 8002,
    name: 'Dify',
    categoryId: 8,
    subcategoryId: 0,
    icon: '/tool-icon/dify.svg',
    breifDesc: '开源的LLM应用开发平台，让AI应用开发更简单。'
  },
  {
    id: 8003,
    name: 'n8n',
    categoryId: 8,
    subcategoryId: 0,
    icon: '/tool-icon/n8n.png',
    breifDesc: '开源的工作流自动化工具，连接各种应用和服务。'
  },
  {
    id: 8004,
    name: '阿里云百炼',
    categoryId: 8,
    subcategoryId: 0,
    icon: '/tool-icon/bailian.svg',
    breifDesc: '阿里云推出的一站式大模型应用开发平台，提供全链路AI开发服务。'
  },
  
  // AI办公 (categoryId: 9)
  {
    id: 9001,
    name: '讯飞智文',
    categoryId: 9,
    subcategoryId: 0,
    icon: '/tool-icon/zhiwen.png',
    breifDesc: '智能办公助手，提供文档生成和会议纪要服务。'
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