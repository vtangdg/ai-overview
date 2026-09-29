/**
 * 站内知识问答（RAG）类型定义
 */

/** 回答引用的来源片段，对应后端 RagSource */
export interface QaSource {
  /** 笔记标题 */
  title: string;
  /** 笔记分类（目录名，如 llm） */
  category: string;
  /** 命中片段所在章节标题 */
  heading: string;
  /** 前端跳转地址：/notes/{slug} */
  url: string;
  /** 命中片段摘要 */
  snippet: string;
  /** 相似度得分（0~1） */
  score: number;
}

/** 问答状态机 */
export type QaStatus =
  /** 等待提问 */
  | 'idle'
  /** 已发起请求，正在检索知识库（sources 事件之前） */
  | 'retrieving'
  /** 正在流式生成回答 */
  | 'streaming'
  /** 回答完成 */
  | 'done'
  /** 库外拒答 */
  | 'rejected'
  /** 出错 */
  | 'error';

/** 一对问答轮次，用于多轮追问时透传上下文 */
export interface QaTurn {
  q: string;
  a: string;
}

/** 页面中的一条消息 */
export interface QaMessage {
  id: string;
  role: 'user' | 'assistant';
  /** 正文（assistant 消息流式增长） */
  content: string;
  /** 引用来源（assistant 消息） */
  sources: QaSource[];
  status?: QaStatus;
  /** 拒答/错误文案 */
  notice?: string;
}
