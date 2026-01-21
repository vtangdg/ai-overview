/**
 * 提示词优化器类型定义
 */

/**
 * 生成请求
 */
export interface GenerateRequest {
  task: string;
  model?: string;
}

/**
 * 优化请求
 */
export interface OptimizeRequest {
  currentPrompt: string;
  feedback?: string;
  model?: string;
}

/**
 * 提示词响应
 */
export interface PromptResponse {
  content: string;
  error?: string;
}

/**
 * 模型选项
 */
export interface ModelOption {
  id: string;
  name: string;
  description: string;
}

/**
 * 提示词模板
 */
export interface PromptTemplate {
  id: number;
  name: string;
  category: string;
  task: string;
  icon: string;
}

/**
 * 保存的提示词（本地存储）
 */
export interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  model: string;
  createdAt: string;
}
