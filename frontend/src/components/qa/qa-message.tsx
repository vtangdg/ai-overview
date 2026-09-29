'use client';

import React from 'react';
import { AlertCircle, Compass, Loader2, User } from 'lucide-react';
import { MarkdownRenderer } from '@/components/common/markdown/MarkdownRenderer';
import { SourceCards } from './source-cards';
import type { QaMessage } from '@/features/qa/lib/types';

interface QaMessageItemProps {
  message: QaMessage;
}

/**
 * 单条消息渲染：
 * - 用户消息：右侧气泡
 * - 助手消息：左侧卡片，含检索中占位、流式光标、拒答/错误提示、来源卡片
 */
export const QaMessageItem: React.FC<QaMessageItemProps> = ({ message }) => {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="flex items-start gap-2 max-w-[85%]">
          <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
            <User size={15} />
          </div>
        </div>
      </div>
    );
  }

  const isRetrieving = message.status === 'retrieving' && message.content.length === 0;
  const isStreaming = message.status === 'streaming';

  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-semibold mt-1">
        AI
      </div>
      <div className="flex-1 min-w-0 bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
        {/* 检索中占位：让用户先看到「正在查站内资料」，而不是空白等待 */}
        {isRetrieving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
            <Loader2 size={14} className="animate-spin" />
            <span>正在检索知识库…</span>
          </div>
        )}

        {/* 拒答态：明确告知能力边界，并引导去浏览笔记 */}
        {message.status === 'rejected' && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-300/70 bg-amber-50 text-amber-900">
            <Compass size={16} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed">
              <p className="font-medium mb-1">站内知识库未覆盖这个问题</p>
              <p className="text-amber-800/90">
                {message.notice}
                {/* 新标签页打开，避免站内跳转把当前问答记录一起清掉 */}
                <a
                  href="/notes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 underline underline-offset-2 hover:text-amber-900"
                >
                  去浏览知识笔记
                </a>
              </p>
            </div>
          </div>
        )}

        {/* 错误态 */}
        {message.status === 'error' && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm leading-relaxed">{message.notice}</span>
          </div>
        )}

        {/* 回答正文 */}
        {message.content && (
          <div className={message.status === 'rejected' ? 'mt-3' : ''}>
            <MarkdownRenderer content={message.content} />
            {isStreaming && (
              <span className="inline-block w-2 h-4 align-text-bottom bg-primary animate-pulse" />
            )}
          </div>
        )}

        {/* 来源引用：检索命中即渲染，先于回答出现 */}
        <SourceCards sources={message.sources} />
      </div>
    </div>
  );
};
