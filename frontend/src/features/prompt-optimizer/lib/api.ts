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

/** SSE 事件之间的分隔符（空行） */
const SSE_BOUNDARY = '\n\n';

/** 服务端约定的事件名，与后端 PromptOptimizerController 保持一致 */
const EVENT_DELTA = 'delta';
const EVENT_ERROR = 'error';
const EVENT_DONE = 'done';

/**
 * 判断异常是否由主动中断（AbortController）引起
 */
export function isAbortError(error: unknown): boolean {
  return (error as { name?: string } | null)?.name === 'AbortError';
}

/**
 * 解析单个 SSE 事件块，返回事件名与拼接后的 data 内容；没有 data 字段时返回 null
 */
function parseSseEvent(block: string): { event: string; data: string } | null {
  let event = 'message';
  const dataLines: string[] = [];

  for (const rawLine of block.split('\n')) {
    const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
    // 空行与以 ":" 开头的注释行（心跳）直接跳过
    if (!line || line.startsWith(':')) continue;

    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);

    if (field === 'event') {
      event = value;
    } else if (field === 'data') {
      dataLines.push(value);
    }
  }

  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join('\n') };
}

/**
 * 逐块消费 SSE 响应流。
 * 不能按 chunk 直接切分：一个事件可能被拆到多个 chunk，一个 chunk 也可能包含多个事件，
 * 因此这里先累积到缓冲区，再按空行（事件边界）切分。
 */
async function consumeSse(response: Response, options: StreamOptions): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('当前浏览器不支持流式响应');
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let serverError: string | null = null;
  let finished = false;

  try {
    while (!finished) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, '\n');

      let boundary = buffer.indexOf(SSE_BOUNDARY);
      while (boundary !== -1) {
        const parsed = parseSseEvent(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + SSE_BOUNDARY.length);

        if (parsed) {
          if (parsed.event === EVENT_ERROR) {
            serverError = parsed.data || '生成失败，请稍后重试';
          } else if (parsed.event === EVENT_DONE) {
            finished = true;
          } else if (parsed.event === EVENT_DELTA && parsed.data) {
            options.onDelta?.(parsed.data);
          }
        }

        if (finished) break;
        boundary = buffer.indexOf(SSE_BOUNDARY);
      }
    }

    // 处理没有以空行结尾的残留事件
    buffer += decoder.decode();
    const tail = parseSseEvent(buffer);
    if (tail && tail.event === EVENT_DELTA && tail.data) {
      options.onDelta?.(tail.data);
    }

    if (serverError) {
      options.onError?.(serverError);
    } else {
      options.onDone?.();
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 以 POST 方式发起 SSE 请求并消费响应流
 */
async function postStream(
  url: string,
  body: unknown,
  options: StreamOptions,
  errorLabel: string
): Promise<void> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream'
      },
      body: JSON.stringify(body),
      signal: options.signal
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new Error(`${errorLabel}：网络请求失败，请确认后端服务是否已启动`);
  }

  if (!response.ok) {
    throw new Error(`${errorLabel}：${response.status} ${response.statusText}`.trim());
  }

  await consumeSse(response, options);
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
