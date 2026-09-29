import { postSse } from '@/lib/sse';
import type { QaSource, QaTurn } from './types';

/** 事件名，与后端 RagController 的 SSE 协议保持一致 */
const EVENT_SOURCES = 'sources';
const EVENT_MESSAGE = 'message';
const EVENT_REJECTED = 'rejected';
const EVENT_ERROR = 'error';
const EVENT_DONE = 'done';

/** 问答流式回调 */
export interface QaStreamCallbacks {
  /** 命中引用来源（先于回答推送，用于立即渲染来源卡片） */
  onSources?: (sources: QaSource[]) => void;
  /** 增量回答文本 */
  onDelta?: (chunk: string) => void;
  /** 库外拒答（命中为空时会替代回答） */
  onRejected?: (message: string) => void;
  /** 服务端 error 事件 */
  onError?: (message: string) => void;
  /** 正常结束 */
  onDone?: () => void;
}

/** 索引状态 */
export interface QaIndexStatus {
  indexing: boolean;
  indexedChunks: number;
  indexedFiles: number;
  indexedAt: string;
}

export const qaApi = {
  /**
   * 知识问答（SSE 流式）。
   * 事件顺序：sources → message(多次) → done；库外问题则为 rejected → done。
   *
   * @param question 用户问题
   * @param history 对话历史（后端仅使用最近一轮做检索查询融合）
   * @param callbacks 流式回调
   * @param signal 主动中断信号
   */
  async askStream(
    question: string,
    history: QaTurn[],
    callbacks: QaStreamCallbacks = {},
    signal?: AbortSignal
  ): Promise<void> {
    let serverError: string | null = null;

    await postSse(
      '/api/rag/qa',
      { question, history },
      (event) => {
        switch (event.event) {
          case EVENT_SOURCES: {
            const sources = parseSources(event.data);
            if (sources.length > 0) callbacks.onSources?.(sources);
            break;
          }
          case EVENT_MESSAGE:
            if (event.data) callbacks.onDelta?.(event.data);
            break;
          case EVENT_REJECTED:
            callbacks.onRejected?.(event.data);
            break;
          case EVENT_ERROR:
            serverError = event.data || '回答生成失败，请稍后重试';
            break;
          case EVENT_DONE:
            return 'stop';
          default:
            break;
        }
      },
      { signal, errorLabel: '提问失败' }
    );

    if (serverError) {
      callbacks.onError?.(serverError);
    } else {
      callbacks.onDone?.();
    }
  },

  /**
   * 查询知识库索引状态（用于展示知识库范围）
   */
  async getIndexStatus(): Promise<QaIndexStatus | null> {
    try {
      const response = await fetch('/api/rag/status');
      if (!response.ok) return null;
      return (await response.json()) as QaIndexStatus;
    } catch {
      // 状态信息属于锦上添花，失败时静默降级
      return null;
    }
  }
};

/**
 * sources 事件的 data 是 JSON 数组，解析失败时降级为空列表，避免影响回答渲染
 */
function parseSources(data: string): QaSource[] {
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? (parsed as QaSource[]) : [];
  } catch {
    return [];
  }
}
