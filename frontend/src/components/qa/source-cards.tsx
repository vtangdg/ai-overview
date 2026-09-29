'use client';

import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { getCategoryName } from '@/features/notes/lib/categories';
import type { QaSource } from '@/features/qa/lib/types';

interface SourceCardsProps {
  sources: QaSource[];
}

/**
 * 同一篇笔记可能命中多个片段，展示时按笔记聚合，只保留最高分片段
 */
function dedupeByNote(sources: QaSource[]): QaSource[] {
  const byUrl = new Map<string, QaSource>();
  for (const source of sources) {
    const existing = byUrl.get(source.url);
    if (!existing || source.score > existing.score) {
      byUrl.set(source.url, source);
    }
  }
  return Array.from(byUrl.values()).sort((a, b) => b.score - a.score);
}

/**
 * 回答的引用来源卡片：标题 + 命中章节 + 分类，点击在新标签页打开笔记详情
 * 「可点击溯源」是 RAG 回答建立信任的关键设计，因此这里不做折叠
 *
 * 注意：这里刻意使用原生 <a target="_blank"> 而不是 next/link。
 * 会话消息只存在组件内存中，站内客户端路由跳转会卸载页面、清空整轮问答记录，
 * 用户溯源后就回不到原来的对话了；新开标签页可保留当前会话。
 */
export const SourceCards: React.FC<SourceCardsProps> = ({ sources }) => {
  const items = dedupeByNote(sources);
  if (items.length === 0) return null;

  return (
    <div className="mt-5 pt-4 border-t border-border">
      <div className="flex items-center gap-1.5 mb-3 text-xs font-medium text-muted-foreground">
        <BookOpen size={14} className="flex-shrink-0" />
        <span>参考来源（点击在新标签页查看原文）</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((source) => (
          <a
            key={`${source.url}-${source.heading}`}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`在新标签页打开：${source.title}`}
            className="group flex flex-col gap-1.5 p-3 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                {source.title}
              </span>
              <ExternalLink
                size={14}
                className="flex-shrink-0 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex-shrink-0 text-[10px] leading-4 px-1.5 rounded bg-secondary text-secondary-foreground">
                {getCategoryName(source.category)}
              </span>
              <span className="text-xs text-muted-foreground truncate">{source.heading}</span>
            </div>
            <span className="text-[10px] text-muted-foreground/80">
              匹配度 {Math.round(source.score * 100)}%
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};
