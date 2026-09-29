/**
 * 通用 SSE（Server-Sent Events）客户端工具
 *
 * 站点内所有流式 AI 能力（提示词优化器、知识问答）共用同一套解析逻辑：
 * 服务端以 `event: xxx\ndata: yyy\n\n` 的形式推送事件，浏览器侧按事件边界切分后分发。
 */

/** SSE 事件之间的分隔符（空行） */
const SSE_BOUNDARY = '\n\n';

/** 解析后的事件 */
export interface SseEvent {
  /** 事件名，缺省为 message */
  event: string;
  /** data 字段内容（多行 data 会以换行拼接） */
  data: string;
}

/**
 * 事件处理函数。返回 `stop` 表示主动结束本次流式读取
 * （例如收到服务端约定的 done 事件后不必继续等待连接关闭）。
 */
export type SseEventHandler = (event: SseEvent) => void | 'stop';

/** POST 流式请求选项 */
export interface PostSseOptions {
  /** 用于主动中断流式请求 */
  signal?: AbortSignal;
  /** 网络异常时的提示前缀，如「生成失败」 */
  errorLabel?: string;
}

/**
 * 判断异常是否由主动中断（AbortController）引起
 */
export function isAbortError(error: unknown): boolean {
  return (error as { name?: string } | null)?.name === 'AbortError';
}

/**
 * 解析单个 SSE 事件块，返回事件名与拼接后的 data 内容；没有 data 字段时返回 null
 */
export function parseSseEvent(block: string): SseEvent | null {
  let event = 'message';
  const dataLines: string[] = [];

  for (const rawLine of block.split('\n')) {
    const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
    // 空行与以 ":" 开头的注释行（心跳）直接跳过
    if (!line || line.startsWith(':')) continue;

    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? '' : line.slice(colon + 1);
    // 按 SSE 规范剥掉冒号后的第一个空格。
    // 后端（Spring ServerSentEvent）不额外补空格，因此约定由服务端主动补一个前导空格，
    // 保证「内容本身就是空格」的增量不会在剥离时被吃掉（详见各 Controller 的 event() 注释）。
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
 *
 * @param response fetch 返回的流式响应
 * @param onEvent 每解析出一个事件时触发，返回 'stop' 可提前结束读取
 */
export async function consumeSse(response: Response, onEvent: SseEventHandler): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('当前浏览器不支持流式响应');
  }

  // TextDecoder 以流式方式解码，避免多字节中文被切分到两个 chunk 导致乱码
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
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

        if (parsed && onEvent(parsed) === 'stop') {
          finished = true;
          break;
        }
        boundary = buffer.indexOf(SSE_BOUNDARY);
      }
    }

    // 处理没有以空行结尾的残留事件
    if (!finished) {
      buffer += decoder.decode();
      const tail = parseSseEvent(buffer);
      if (tail) onEvent(tail);
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 以 POST 方式发起 SSE 请求并消费响应流
 *
 * @param url 后端流式接口地址
 * @param body 请求体（将被 JSON 序列化）
 * @param onEvent 事件回调
 * @param options 中断信号与错误提示前缀
 */
export async function postSse(
  url: string,
  body: unknown,
  onEvent: SseEventHandler,
  options: PostSseOptions = {}
): Promise<void> {
  const { signal, errorLabel = '请求失败' } = options;
  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream'
      },
      body: JSON.stringify(body),
      signal
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new Error(`${errorLabel}：网络请求失败，请确认后端服务是否已启动`);
  }

  if (!response.ok) {
    throw new Error(`${errorLabel}：${response.status} ${response.statusText}`.trim());
  }

  await consumeSse(response, onEvent);
}
