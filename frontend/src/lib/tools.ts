// 定义AI工具的接口
export interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  features: string[];
  website?: string;
  developer?: string;
}

// 示例AI工具数据
export const aiTools: AITool[] = [
  {
    id: 'xingyue-writing',
    name: '星月写作',
    description: '由出国团队开发的AI写作助手，专注于学术论文和英文写作。',
    category: 'AI写作工具',
    features: ['学术论文写作', '英文润色', '文献引用'],
    developer: '出国团队'
  },
  {
    id: 'guagua-writing',
    name: '蛙蛙写作',
    description: '由讯飞外形智能开发的AI写作工具，支持多种文体生成。',
    category: 'AI写作工具',
    features: ['多文体生成', '智能续写', '写作建议'],
    developer: '讯飞外形智能'
  },
  {
    id: 'biling-ai-writing',
    name: '笔灵AI论文',
    description: '一款国内全能型论文写作助手，帮助用户快速完成学术论文。',
    category: 'AI写作工具',
    features: ['论文大纲', '段落生成', '查重辅助'],
    developer: '笔灵科技'
  },
  {
    id: '66ai-writing',
    name: '66AI论文',
    description: '一款专业的AI论文写作工具，提供学术论文全流程支持。',
    category: 'AI写作工具',
    features: ['论文结构规划', '专业术语支持', '参考文献管理'],
    developer: '66科技'
  },
  {
    id: 'biwang-ai-thesis',
    name: '笔王AI论文',
    description: '一款由稻田开发的AI论文写作工具，专注于提高写作效率。',
    category: 'AI写作工具',
    features: ['智能摘要', '图表生成', '排版优化'],
    developer: '稻田科技'
  },
  {
    id: 'mayfly-ai-writing',
    name: '茅亭论文写作',
    description: '一站式AI论文写作平台，提供从选题到定稿的全流程服务。',
    category: 'AI写作工具',
    features: ['选题推荐', '内容生成', '论文查重'],
    developer: '茅亭科技'
  },
  {
    id: 'iflytek-wenbook',
    name: '讯飞文书',
    description: '基于讯飞星火大模型的智能文书生成工具，适用于多种场景。',
    category: 'AI写作工具',
    features: ['多场景模板', '智能改写', '批量生成'],
    developer: '讯飞科技'
  },
  {
    id: 'iflytek-wenwen',
    name: '讯飞绘文',
    description: '一站式AIGC内容生成平台，支持文本、图像、音频等多种形式。',
    category: 'AI写作工具',
    features: ['多模态生成', '内容整合', '版权管理'],
    developer: '讯飞科技'
  },
  {
    id: 'xiaoyu-ai-writing',
    name: '小鱼AI写作',
    description: '一款专注于日常写作和内容创作的AI助手。',
    category: 'AI写作工具',
    features: ['文案生成', '社交媒体内容', '邮件模板'],
    developer: '小鱼科技'
  },
  {
    id: 'fanwenhu',
    name: '范文喵',
    description: '针对大学生的AI写作助手，提供各类校园文书模板和生成服务。',
    category: 'AI写作工具',
    features: ['校园文书', '演讲稿生成', '简历优化'],
    developer: '范文喵团队'
  },
  {
    id: 'moguhu-ai',
    name: '墨狐AI',
    description: '由北京云顶科技开发的AI写作平台，支持多种专业领域。',
    category: 'AI写作工具',
    features: ['专业文档', '报告生成', '数据分析'],
    developer: '北京云顶科技'
  },
  {
    id: 'writesonic',
    name: 'Writesonic',
    description: '一款AI写作、营销内容生成工具，适用于全球市场。',
    category: 'AI写作工具',
    features: ['多语言支持', 'SEO优化', '营销文案'],
    developer: 'Writesonic团队'
  },
  {
    id: 'songguo-ai',
    name: '松果AI写作',
    description: '一款专注于写作设计的AI工具，帮助用户提升内容质量。',
    category: 'AI写作工具',
    features: ['风格定制', '内容优化', '创意激发'],
    developer: '松果科技'
  },
  {
    id: 'chuangyi-ai',
    name: '创一AI',
    description: '一款专业的AI内容创作平台，支持多种创意内容生成。',
    category: 'AI写作工具',
    features: ['故事创作', '剧本生成', '诗歌写作'],
    developer: '创一科技'
  },
  {
    id: 'reply',
    name: 'Reply',
    description: '全球首个音频Video AI创作工具，支持音视频内容生成。',
    category: 'AI写作工具',
    features: ['音频生成', '视频脚本', '配音合成'],
    developer: 'Reply团队'
  }
];

// 获取所有工具类别
export const getToolCategories = (): string[] => {
  const categories = [...new Set(aiTools.map((tool) => tool.category))];
  return categories.sort();
};

// 根据ID获取工具
export const getToolById = (id: string): AITool | undefined => {
  return aiTools.find((tool) => tool.id === id);
};

// 根据类别筛选工具
export const getToolsByCategory = (category: string): AITool[] => {
  return aiTools.filter((tool) => tool.category === category);
};

// 搜索工具
export const searchTools = (query: string): AITool[] => {
  const lowercaseQuery = query.toLowerCase();
  return aiTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowercaseQuery) ||
      tool.description.toLowerCase().includes(lowercaseQuery) ||
      tool.id.toLowerCase().includes(lowercaseQuery) ||
      tool.category.toLowerCase().includes(lowercaseQuery)
  );
};