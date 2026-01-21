import type { PromptTemplate, ModelOption } from './types';

/**
 * 提示词模板库
 */
export const templates: PromptTemplate[] = [
  {
    id: 7,
    name: '方案设计',
    category: '设计',
    task: '请帮我设计一个{产品/功能}的技术方案',
    icon: '📋'
  },
  {
    id: 2,
    name: '文章写作',
    category: '写作',
    task: '请帮我写一篇关于{主题}的文章，要求结构清晰、内容专业',
    icon: '✍️'
  },
  {
    id: 4,
    name: '问题诊断',
    category: '诊断',
    task: '请帮我分析以下问题出现的原因和解决方案',
    icon: '🔧'
  },
  {
    id: 5,
    name: '学习计划',
    category: '学习',
    task: '请为我制定一个{技能}的学习计划，我是{当前水平}',
    icon: '📚'
  },
  {
    id: 1,
    name: '代码审查',
    category: '编程',
    task: '请帮我审查以下代码，找出潜在问题和改进建议',
    icon: '🔍'
  },
  {
    id: 3,
    name: '数据分析',
    category: '分析',
    task: '请分析以下数据，找出趋势和洞察',
    icon: '📊'
  },
  {
    id: 6,
    name: '邮件撰写',
    category: '写作',
    task: '请帮我写一封{类型}邮件，收件人是{对象}，目的是{目的}',
    icon: '📧'
  },
  {
    id: 8,
    name: '简历优化',
    category: '写作',
    task: '请帮我优化简历，突出我的{优势}，应聘{岗位}',
    icon: '�'
  }
];

/**
 * 支持的AI模型列表
 */
export const modelOptions: ModelOption[] = [
  { id: 'glm', name: '智谱GLM', description: '清华大语言模型' },
  { id: 'deepseek', name: 'DeepSeek', description: '高性能大语言模型' },
  { id: 'doubao', name: '豆包', description: '字节跳动AI助手（暂不可用）' }
];

/**
 * 可用模型列表
 */
export const availableModels: string[] = ['glm', 'deepseek'];
