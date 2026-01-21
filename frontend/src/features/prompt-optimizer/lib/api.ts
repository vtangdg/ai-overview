import type { GenerateRequest, OptimizeRequest, PromptResponse } from './types';

interface ModelAvailability {
  [key: string]: boolean;
}

/**
 * 提示词优化器 API 封装
 */
export const promptOptimizerApi = {
  /**
   * 获取可用的模型列表
   */
  async getAvailableModels(): Promise<ModelAvailability> {
    const response = await fetch('/api/prompt-optimizer/models');
    if (!response.ok) {
      throw new Error(`获取模型列表失败: ${response.statusText}`);
    }
    const data = await response.json();
    return data.models;
  },

  /**
   * 生成提示词（流式）
   * @param task 任务描述
   * @param model 模型名称
   * @param onChunk 数据块回调
   */
  async generateStream(
    task: string,
    model: string = 'deepseek',
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const response = await fetch(
      `/api/prompt-optimizer/generate-stream?${new URLSearchParams({
        task,
        model
      })}`
    );

    if (!response.ok) {
      throw new Error(`生成失败: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法获取响应流');
    }

    try {
      let currentData = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data) {
              currentData += data;
            }
          } else if (line === '' && currentData) {
            onChunk(currentData);
            currentData = '';
          } else if (currentData) {
            currentData += '\n' + line;
          }
        }
      }
      if (currentData) {
        onChunk(currentData);
      }
    } finally {
      reader.releaseLock();
    }
  },

  /**
   * 生成提示词（非流式）
   */
  async generate(request: GenerateRequest): Promise<PromptResponse> {
    // 设置60秒超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch('/api/prompt-optimizer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`生成失败: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('生成超时，请稍后重试');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  /**
   * 优化提示词
   */
  async optimize(request: OptimizeRequest): Promise<PromptResponse> {
    // 设置60秒超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch('/api/prompt-optimizer/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`优化失败: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('优化超时，请稍后重试');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
};
