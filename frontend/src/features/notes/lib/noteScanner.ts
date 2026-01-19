/**
 * 笔记扫描器
 * 扫描 public/notes 目录下的所有 Markdown 文件
 */

import fs from 'fs';
import path from 'path';
import { categories, type Category } from './categories';
import { parseMarkdownFile, type Note, type NoteMeta } from './frontMatter';

const NOTES_BASE_PATH = path.join(process.cwd(), 'public', 'notes');

// 缓存扫描结果
let notesCache: Note[] | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 60000; // 缓存1分钟

/**
 * 扫描所有笔记文件
 */
export async function scanNotes(forceRefresh = false): Promise<Note[]> {
  // 使用缓存
  if (!forceRefresh && notesCache && Date.now() - cacheTime < CACHE_TTL) {
    console.log('[NoteScanner] Using cached notes, count:', notesCache.length);
    return notesCache;
  }

  console.log('[NoteScanner] Scanning notes from:', NOTES_BASE_PATH);
  const notes: Note[] = [];

  // 遍历所有分类目录
  for (const category of categories) {
    const categoryPath = path.join(NOTES_BASE_PATH, category.id);

    console.log('[NoteScanner] Checking category path:', categoryPath);

    if (!fs.existsSync(categoryPath)) {
      console.log('[NoteScanner] Category path does not exist:', categoryPath);
      continue;
    }

    const files = fs.readdirSync(categoryPath);
    console.log('[NoteScanner] Found files in', category.id, ':', files.length);

    for (const file of files) {
      if (!file.endsWith('.md')) continue;

      const filePath = path.join(categoryPath, file);

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const slug = file.replace('.md', '');

        const note = parseMarkdownFile(content, slug);

        if (note) {
          // 覆盖分类（确保与目录一致）
          note.category = category.id;
          notes.push(note);
        }
      } catch (error) {
        console.error('[NoteScanner] Failed to read file:', filePath, error);
      }
    }
  }

  console.log('[NoteScanner] Total notes scanned:', notes.length);

  // 排序：先按 order，再按日期
  notes.sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  notesCache = notes;
  cacheTime = Date.now();

  return notes;
}

/**
 * 根据 slug 获取单个笔记（含正文）
 */
export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const notes = await scanNotes();
  return notes.find(note => note.slug === slug) || null;
}

/**
 * 根据 slug 获取笔记元数据（不含正文）
 */
export async function getNoteMetaBySlug(slug: string): Promise<NoteMeta | null> {
  const note = await getNoteBySlug(slug);
  if (!note) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { content, ...meta } = note;
  return meta;
}

/**
 * 根据分类筛选笔记
 */
export function getNotesByCategory(notes: Note[], categoryId: string): Note[] {
  return notes.filter(note => note.category === categoryId);
}

/**
 * 根据标签筛选笔记
 */
export function getNotesByTag(notes: Note[], tag: string): Note[] {
  return notes.filter(note => note.tags.includes(tag));
}

/**
 * 根据分类筛选笔记元数据
 */
export function getNoteMetasByCategory(metas: NoteMeta[], categoryId: string): NoteMeta[] {
  return metas.filter(note => note.category === categoryId);
}

/**
 * 搜索笔记
 */
export function searchNotes(notes: Note[], query: string): Note[] {
  const lowerQuery = query.toLowerCase();

  return notes.filter(note =>
    note.title.toLowerCase().includes(lowerQuery) ||
    note.description.toLowerCase().includes(lowerQuery) ||
    note.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    note.content.toLowerCase().includes(lowerQuery)
  );
}

/**
 * 搜索笔记元数据
 */
export function searchNoteMetas(metas: NoteMeta[], query: string): NoteMeta[] {
  const lowerQuery = query.toLowerCase();

  return metas.filter(note =>
    note.title.toLowerCase().includes(lowerQuery) ||
    note.description.toLowerCase().includes(lowerQuery) ||
    note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * 获取所有标签及其统计
 */
export function getAllTags(notes: Note[]): { tag: string; count: number }[] {
  const tagMap = new Map<string, number>();

  notes.forEach(note => {
    note.tags.forEach(tag => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 获取分类统计
 */
export function getCategoryStats(notes: Note[]): Array<Category & { count: number }> {
  return categories.map(cat => ({
    ...cat,
    count: notes.filter(note => note.category === cat.id).length
  }));
}

/**
 * 获取相关笔记（根据标签）
 */
export function getRelatedNotes(
  notes: Note[],
  currentSlug: string,
  limit = 4
): NoteMeta[] {
  const currentNote = notes.find(n => n.slug === currentSlug);
  if (!currentNote) return [];

  // 计算相关度：共享标签越多越相关
  const scored = notes
    .filter(n => n.slug !== currentSlug)
    .map(note => {
      const sharedTags = note.tags.filter(tag =>
        currentNote.tags.includes(tag)
      );
      return {
        note,
        score: sharedTags.length
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(item => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { content, ...meta } = item.note;
    return meta;
  });
}

/**
 * 清除缓存
 */
export function clearNotesCache(): void {
  notesCache = null;
  cacheTime = 0;
}
