import { isAbortError, postSse } from '@/lib/sse';
import type { GenerateRequest, OptimizeRequest, PromptResponse } from './types';

interface ModelAvailability {
  [key: string]: boolean;
}

/**
 * 流式回调
 */
export interface StreamCallbacks {
  /** 每收到一段增量文本时触发 */
  onDelta?: (chunk: string) => void;
  /** 服务端正常结束时触发 */
  onDone?: () => void;
  /** 服务端通过 error 事件返回错误时触发 */
  onError?: (message: string) => void;
}

/**
 * 流式请求选项
 */
export interface StreamOptions extends StreamCallbacks {
  /** 用于主动中断流式请求 */
  signal?: AbortSignal;
}

/** 服务端约定的事件名，与后端 PromptOptimizerController 保持一致 */
const EVENT_DELTA = 'delta';
const EVENT_ERROR = 'error';
const EVENT_DONE = 'done';

export { isAbortError };

/**
 * 以 POST 方式发起 SSE 请求并消费响应流，把增量文本回调给调用方。
 * 通用解析逻辑见 `@/lib/sse`，与知识问答共用。
 */
async function postStream(
  url: string,
  body: unknown,
  options: StreamOptions,
  errorLabel: string
): Promise<void> {
  let serverError: string | null = null;

  await postSse(
    url,
    body,
    (event) => {
      if (event.event === EVENT_ERROR) {
        serverError = event.data || '生成失败，请稍后重试';
      } else if (event.event === EVENT_DONE) {
        return 'stop';
      } else if (event.event === EVENT_DELTA && event.data) {
        options.onDelta?.(event.data);
      }
    },
    { signal: options.signal, errorLabel }
  );

  if (serverError) {
    options.onError?.(serverError);
  } else {
    options.onDone?.();
  }
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
   * 流式生成提示词：模型每产出一段文本就通过 onDelta 回调
   * @param task 任务描述
   * @param options 回调与中断信号
   */
  async generateStream(task: string, options: StreamOptions = {}): Promise<void> {
    await postStream(
      '/api/prompt-optimizer/generate-stream',
      { task } satisfies GenerateRequest,
      options,
      '生成失败'
    );
  },

  /**
   * 流式优化提示词：模型每产出一段文本就通过 onDelta 回调
   * @param request 优化请求
   * @param options 回调与中断信号
   */
  async optimizeStream(request: OptimizeRequest, options: StreamOptions = {}): Promise<void> {
    await postStream('/api/prompt-optimizer/optimize-stream', request, options, '优化失败');
  },

  /**
   * 生成提示词（非流式，作为流式不可用时的兜底）
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
      if (isAbortError(error)) {
        throw new Error('生成超时，请稍后重试');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  /**
   * 优化提示词（非流式，作为流式不可用时的兜底）
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
      if (isAbortError(error)) {
        throw new Error('优化超时，请稍后重试');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
};
