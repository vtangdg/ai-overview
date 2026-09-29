'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BookMarked, Database, Loader2, Send, Sparkles, Square } from 'lucide-react';
import { isAbortError } from '@/lib/sse';
import { qaApi, type QaIndexStatus } from '@/features/qa/lib/api';
import { presetQuestions } from '@/features/qa/lib/presets';
import type { QaMessage, QaTurn } from '@/features/qa/lib/types';
import { QaMessageItem } from './qa-message';

/** 追问时透传上一轮的问答，供后端做检索查询融合 */
function buildHistory(messages: QaMessage[]): QaTurn[] {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const answer = messages[i];
    if (
      answer.role === 'assistant' &&
      answer.content &&
      answer.status !== 'rejected' &&
      answer.status !== 'error'
    ) {
      const question = [...messages.slice(0, i)].reverse().find((m) => m.role === 'user');
      if (question) {
        return [{ q: question.content, a: answer.content.slice(0, 800) }];
      }
    }
  }
  return [];
}

export const QaChat: React.FC = () => {
  const [messages, setMessages] = useState<QaMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [indexStatus, setIndexStatus] = useState<QaIndexStatus | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const seqRef = useRef(0);

  // 知识库规模提示：让用户知道答案的检索范围
  useEffect(() => {
    let cancelled = false;
    qaApi.getIndexStatus().then((status) => {
      if (!cancelled) setIndexStatus(status);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 组件卸载时中断未完成的流式请求
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // 新消息或流式增量到达时保持滚动到底部
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const patchAssistant = (id: string, updater: (message: QaMessage) => QaMessage) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? updater(m) : m)));
  };

  const handleSubmit = async (preset?: string) => {
    const question = (preset ?? input).trim();
    if (!question || busy) return;

    const history = buildHistory(messages);
    const userMessage: QaMessage = {
      id: `u-${(seqRef.current += 1)}`,
      role: 'user',
      content: question,
      sources: []
    };
    const assistantId = `a-${(seqRef.current += 1)}`;
    const assistantMessage: QaMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      sources: [],
      status: 'retrieving'
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let answer = '';

    try {
      await qaApi.askStream(
        question,
        history,
        {
          onSources: (sources) => patchAssistant(assistantId, (m) => ({ ...m, sources })),
          onDelta: (chunk) => {
            answer += chunk;
            patchAssistant(assistantId, (m) => ({ ...m, content: answer, status: 'streaming' }));
          },
          onRejected: (notice) =>
            patchAssistant(assistantId, (m) => ({ ...m, status: 'rejected', notice })),
          onError: (notice) => patchAssistant(assistantId, (m) => ({ ...m, status: 'error', notice })),
          onDone: () =>
            patchAssistant(assistantId, (m) =>
              m.status === 'rejected' || m.status === 'error' ? m : { ...m, status: 'done' }
            )
        },
        controller.signal
      );
    } catch (error) {
      if (isAbortError(error)) {
        // 用户主动停止：保留已产出的内容
        patchAssistant(assistantId, (m) =>
          answer
            ? { ...m, status: 'done' }
            : { ...m, status: 'error', notice: '已停止本次回答' }
        );
      } else {
        patchAssistant(assistantId, (m) => ({
          ...m,
          status: 'error',
          notice: error instanceof Error ? error.message : '提问失败，请稍后重试'
        }));
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  const hasConversation = messages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100dvh-14rem)] min-h-[520px] bg-card border border-border rounded-2xl overflow-hidden">
      {/* 顶部：能力说明 + 知识库范围 */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg text-primary">
            <BookMarked size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold leading-tight">站内知识问答</h2>
            <p className="text-xs text-muted-foreground">
              基于站内知识笔记生成回答，每条回答均可溯源到原文
            </p>
          </div>
        </div>

        {indexStatus && indexStatus.indexedFiles > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background border border-border rounded-full px-3 py-1.5">
            <Database size={13} className="flex-shrink-0" />
            <span>
              已索引 {indexStatus.indexedFiles} 篇笔记
              {indexStatus.indexedChunks > 0 && ` · ${indexStatus.indexedChunks} 个知识片段`}
            </span>
          </div>
        )}
      </header>

      {/* 消息区 */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {!hasConversation ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary mb-4">
              <Sparkles size={26} />
            </div>
            <h3 className="text-lg font-semibold mb-2">向站内知识库提问</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
              回答只依据站内知识笔记生成，并附可点击的来源；站内未覆盖的问题会明确拒答，不做无依据的编造。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl">
              {presetQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void handleSubmit(question)}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-muted transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => (
              <QaMessageItem key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div className="border-t border-border px-4 sm:px-6 py-4 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="提问站内知识，例如：RAG 和微调该怎么选？"
              className="flex-1 p-3 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm leading-relaxed"
            />
            {busy ? (
              <button
                type="button"
                onClick={handleStop}
                className="flex-shrink-0 h-[46px] px-4 border border-border rounded-xl font-medium flex items-center gap-2 hover:bg-muted transition-colors text-sm"
              >
                <Square className="w-4 h-4" />
                停止
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!input.trim()}
                className="flex-shrink-0 h-[46px] px-4 bg-primary text-primary-foreground rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm"
              >
                <Send className="w-4 h-4" />
                提问
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mt-2.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              {busy ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  正在检索并生成回答…
                </>
              ) : (
                'Enter 发送，Shift + Enter 换行'
              )}
            </span>
            <span>
              回答由 AI 基于站内笔记生成，可点击来源自行核对 ·
              <Link href="/notes" className="ml-1 underline underline-offset-2 hover:text-foreground">
                浏览全部笔记
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
