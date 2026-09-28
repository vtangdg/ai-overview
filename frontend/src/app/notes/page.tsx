/**
 * 知识笔记列表页面
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Calendar, Clock, Tag, BookOpen } from 'lucide-react';
import { Layout } from '@/components/common';
import { categories, type Category } from '@/features/notes/lib/categories';
import { type NoteMeta } from '@/features/notes/lib/frontMatter';

interface NotesResponse {
  notes: NoteMeta[];
  total: number;
  categories: Array<Category & { count: number }>;
  tags: Array<{ tag: string; count: number }>;
}

export default function NotesPage() {
  const [data, setData] = useState<NotesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [sortMode, setSortMode] = useState<'grouped' | 'recent'>('grouped');

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedTag) {
        params.append('tag', selectedTag);
      }
      if (selectedDifficulty) {
        params.append('difficulty', selectedDifficulty);
      }
      if (searchQuery) {
        params.append('q', searchQuery);
      }

      const response = await fetch(`/api/notes?${params.toString()}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedTag, selectedDifficulty, searchQuery]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedTag(''); // 切换分类时清除标签筛选
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* 页面标题 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen size={24} className="text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">知识笔记</h1>
          </div>
        </div>

        {/* 搜索栏 */}
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索笔记标题、描述或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </form>

        {/* 固定横向导航栏 - 分类标签 */}
        <div className="sticky top-0 z-30 bg-background border-b border-border py-3">
          <div className="overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
            <div className="inline-flex gap-2 px-1">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <span className="text-lg">📋</span>
                <span>全部</span>
                <span className="opacity-60">({data?.total || 0})</span>
              </button>
              {data?.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className="opacity-60">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 难度筛选 + 排序工具栏 */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">难度</span>
            <div className="flex flex-wrap gap-1.5">
              {['', '入门', '进阶', '高级'].map(level => (
                <button
                  key={level || 'all'}
                  onClick={() => setSelectedDifficulty(level)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedDifficulty === level
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {level || '全部'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-sm text-muted-foreground">排序</span>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setSortMode('grouped')}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  sortMode === 'grouped' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted/80'
                }`}
              >
                按体系分组
              </button>
              <button
                onClick={() => setSortMode('recent')}
                className={`px-3 py-1.5 text-sm border-l border-border transition-colors ${
                  sortMode === 'recent' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted/80'
                }`}
              >
                最新优先
              </button>
            </div>
          </div>
        </div>

        {/* 标签云 */}
        {data && data.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">热门标签</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.tags.slice(0, 20).map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTag === tag
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {tag} <span className="opacity-60">({count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 结果统计 */}
        <div className="text-sm text-muted-foreground">
          找到 {data?.notes.length || 0} 篇笔记
        </div>

        {/* 笔记列表 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : data && data.notes.length > 0 ? (
          <NotesList
            notes={data.notes}
            grouped={selectedCategory === 'all' && sortMode === 'grouped'}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-2">没有找到匹配的笔记</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedTag ? '尝试调整搜索条件或筛选器' : '还没有发布任何笔记'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

// 导航枢纽笔记（在「按体系分组」视图中置顶展示）
const FEATURED_SLUG = '00-learning-path';

// 难度徽章配色（卡片通用）
const difficultyClass: Record<string, string> = {
  '入门': 'bg-green-500/20 text-green-600 dark:text-green-400',
  '进阶': 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  '高级': 'bg-red-500/20 text-red-600 dark:text-red-400'
};

/**
 * 笔记列表容器：分组视图（按分类分节、导航笔记置顶）/ 平铺视图（最新优先）
 */
function NotesList({ notes, grouped }: { notes: NoteMeta[]; grouped: boolean }) {
  if (!grouped) {
    const sorted = [...notes].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map(note => (
          <NoteCard key={note.slug} note={note} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {categories.map(cat => {
        const groupNotes = notes.filter(n => n.category === cat.id);
        if (groupNotes.length === 0) return null;

        const featured = groupNotes.find(n => n.slug === FEATURED_SLUG);
        const rest = groupNotes.filter(n => n.slug !== FEATURED_SLUG);

        return (
          <section key={cat.id}>
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-lg font-bold">
                <span className="mr-1.5">{cat.icon}</span>
                {cat.name}
              </h2>
              <span className="text-sm text-muted-foreground truncate">· {cat.description}</span>
              <span className="text-sm text-muted-foreground">({groupNotes.length})</span>
            </div>
            {featured && <FeaturedCard note={featured} />}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map(note => (
                <NoteCard key={note.slug} note={note} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/**
 * 导航枢纽置顶卡：全宽、强调样式，引导新读者从学习路径入手
 */
function FeaturedCard({ note }: { note: NoteMeta }) {
  return (
    <Link href={`/notes/${note.slug}`} className="block mb-6">
      <div className="group bg-primary/5 border border-primary/40 rounded-xl p-5 hover:border-primary hover:shadow-md transition-all cursor-pointer">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0">
            导航 ★
          </span>
          <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
            {note.title}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {note.description} —— 不知道从哪读起，先看这篇。
        </p>
      </div>
    </Link>
  );
}

// 笔记卡片组件
function NoteCard({ note }: { note: NoteMeta }) {
  const category = categories.find(c => c.id === note.category);

  return (
    <Link href={`/notes/${note.slug}`}>
      <div className="group h-full bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
        {/* 分类标签 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <span>{category?.icon}</span>
          <span>{category?.name}</span>
        </div>

        {/* 标题 */}
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {note.title}
        </h3>

        {/* 描述 */}
        {note.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {note.description}
          </p>
        )}

        {/* 标签 */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {note.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-muted/50 rounded text-xs">
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 元信息 */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className={`px-2 py-1 rounded ${difficultyClass[note.difficulty] || 'bg-muted'}`}>
            {note.difficulty}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {note.readTime}分钟
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {note.updatedAt}
          </span>
        </div>
      </div>
    </Link>
  );
}
