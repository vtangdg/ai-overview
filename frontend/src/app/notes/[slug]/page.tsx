/**
 * 笔记详情页面
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react';
import { Layout } from '@/components/common';
import { categories } from '@/features/notes/lib/categories';
import { MarkdownRenderer } from '@/components/common/markdown/MarkdownRenderer';
import { type Note } from '@/features/notes/lib/frontMatter';

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      {/* 面包屑导航 */}
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <button
          onClick={() => router.push('/notes')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回笔记列表
        </button>
      </div>

      <article className="container mx-auto px-4 pb-8 max-w-4xl">
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

        {/* Markdown 内容 */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <MarkdownRenderer content={note.content} />
        </div>
      </article>
    </Layout>
  );
}
