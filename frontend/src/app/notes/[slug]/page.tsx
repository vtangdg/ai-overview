/**
 * 笔记详情页面
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Clock, Tag, User, ListTree } from 'lucide-react';
import { Layout } from '@/components/common';
import { categories } from '@/features/notes/lib/categories';
import { MarkdownRenderer } from '@/components/common/markdown/MarkdownRenderer';
import { type Note, type NoteMeta } from '@/features/notes/lib/frontMatter';
import { extractHeadings, type TocItem } from '@/features/notes/lib/headings';

/** 目录列表（桌面端侧栏与移动端折叠面板共用） */
function TocList({
  headings,
  activeId,
  onJump,
}: {
  headings: TocItem[];
  activeId: string;
  onJump: (id: string) => void;
}) {
  return (
    <ul className="space-y-1 text-sm">
      {headings.map((h) => (
        <li key={h.id}>
          <button
            onClick={() => onJump(h.id)}
            className={`block w-full text-left transition-colors truncate py-1 ${
              h.level === 3 ? 'pl-5 text-[13px]' : 'pl-2'
            } ${
              activeId === h.id
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={h.text}
          >
            {h.text}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [siblings, setSiblings] = useState<{ prev: NoteMeta | null; next: NoteMeta | null }>({
    prev: null,
    next: null,
  });

  // 切换笔记（点击上一篇/下一篇）时回到页面顶部
  useEffect(() => {
    window.scrollTo(0, 0);
    setProgress(0);
  }, [params.slug]);

  useEffect(() => {
    async function loadNote() {
      try {
        const slug = params.slug as string;
        const response = await fetch(`/api/notes/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('笔记不存在');
          } else {
            setError('加载失败');
          }
          return;
        }

        const data = await response.json();
        setNote(data);
      } catch (err) {
        console.error('Failed to load note:', err);
        setError('加载失败');
      } finally {
        setLoading(false);
      }
    }

    loadNote();
  }, [params.slug]);

  // 从 Markdown 内容提取 h2/h3 标题大纲
  const headings = useMemo(() => (note ? extractHeadings(note.content) : []), [note]);

  const scrollToHeading = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Scroll-spy：监听滚动，高亮当前阅读到的小节 + 计算阅读进度
  useEffect(() => {
    if (!note) return;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        // 阅读进度（0-100）
        const total = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0);

        // 当前小节高亮
        const offset = 120; // 预留 sticky header 空间
        let current = '';
        for (const h of headings) {
          const el = document.getElementById(h.id);
          if (el && el.getBoundingClientRect().top <= offset) {
            current = h.id;
          }
        }
        // 滚动到底部时强制激活最后一节，避免长尾小节永远无法高亮
        if (
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4 &&
          headings.length > 0
        ) {
          current = headings[headings.length - 1].id;
        }
        setActiveHeadingId(current);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [note, headings]);

  // 获取同分类上一篇 / 下一篇（按 order 排序，保持同主题学习动线）
  useEffect(() => {
    if (!note?.category) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/notes?category=${encodeURIComponent(note.category)}`);
        const data = await res.json();
        if (cancelled) return;
        const list: NoteMeta[] = Array.isArray(data.notes) ? data.notes : [];
        const idx = list.findIndex(n => n.slug === note.slug);
        if (idx === -1) {
          setSiblings({ prev: null, next: null });
          return;
        }
        setSiblings({
          prev: idx > 0 ? list[idx - 1] : null,
          next: idx < list.length - 1 ? list[idx + 1] : null,
        });
      } catch (err) {
        console.error('Failed to load sibling notes:', err);
        if (!cancelled) setSiblings({ prev: null, next: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [note]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !note) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-xl text-muted-foreground mb-4">{error || '笔记不存在'}</p>
            <button
              onClick={() => router.push('/notes')}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              返回笔记列表
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const category = categories.find(c => c.id === note.category);

  const difficultyClass = {
    '入门': 'bg-green-500/20 text-green-600 dark:text-green-400',
    '进阶': 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    '高级': 'bg-red-500/20 text-red-600 dark:text-red-400'
  }[note.difficulty] || 'bg-muted';

  return (
    <Layout>
      {/* 阅读进度条（置顶，覆盖在 sticky header 之上） */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none bg-transparent">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="container mx-auto px-4 pb-8 pt-4">
        {/* ≥1280px 时正文 + 右侧大纲双栏；正文保持 max-w-4xl 阅读宽度 */}
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-10 xl:max-w-6xl xl:mx-auto">
          <article className="w-full max-w-4xl mx-auto xl:mx-0">
        {/* 返回导航（与正文左对齐） */}
        <button
          onClick={() => router.push('/notes')}
          className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 -ml-1 rounded-full border border-border bg-card text-sm text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          返回笔记列表
        </button>

        {/* 文章头部 */}
        <header className="mb-8 pb-8 border-b border-border">
          {/* 分类 */}
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <span className="text-2xl">{category?.icon}</span>
            <span className="text-lg">{category?.name}</span>
          </div>

          {/* 标题 */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {note.title}
          </h1>

          {/* 描述 */}
          {note.description && (
            <p className="text-xl text-muted-foreground mb-6">
              {note.description}
            </p>
          )}

          {/* 标签 */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {note.tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span>{note.author}</span>
            </div>

            <span className={`px-3 py-1 rounded-full text-sm ${difficultyClass}`}>
              {note.difficulty}
            </span>

            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {note.readTime} 分钟
            </span>

            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              更新于 {note.updatedAt}
            </span>
          </div>
        </header>

        {/* 移动端 / 中屏：可折叠目录面板，替代右侧大纲 */}
        {headings.length > 0 && (
          <details className="xl:hidden mb-8 border border-border rounded-lg bg-card">
            <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none text-sm font-medium hover:text-primary transition-colors">
              <ListTree className="w-4 h-4" />
              目录（{headings.length} 节）
            </summary>
            <div className="px-3 pb-3">
              <TocList headings={headings} activeId={activeHeadingId} onJump={scrollToHeading} />
            </div>
          </details>
        )}

        {/* Markdown 内容 */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <MarkdownRenderer content={note.content} />
        </div>

        {/* 上一篇 / 下一篇 */}
        {(siblings.prev || siblings.next) && (
          <nav className="mt-12 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
            {siblings.prev ? (
              <Link
                href={`/notes/${siblings.prev.slug}`}
                className="group flex items-center gap-3 p-4 border border-border rounded-lg bg-card hover:border-primary/50 hover:shadow-md transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">上一篇</p>
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {siblings.prev.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}

            {siblings.next && (
              <Link
                href={`/notes/${siblings.next.slug}`}
                className="group flex items-center justify-end gap-3 p-4 border border-border rounded-lg bg-card hover:border-primary/50 hover:shadow-md transition-all text-right"
              >
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">下一篇</p>
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {siblings.next.title}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            )}
          </nav>
        )}
          </article>

          {/* 桌面端右侧标题大纲（≥1280px 显示） */}
          {headings.length > 0 && (
            <aside className="hidden xl:block">
              <nav className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto border-l border-border pl-4 pr-1 pb-8">
                <p className="flex items-center gap-1.5 text-sm font-semibold mb-3">
                  <ListTree className="w-4 h-4 text-primary" />
                  目录
                </p>
                <TocList
                  headings={headings}
                  activeId={activeHeadingId}
                  onJump={scrollToHeading}
                />
              </nav>
            </aside>
          )}
        </div>
      </div>
    </Layout>
  );
}
