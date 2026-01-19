/**
 * 笔记列表 API
 * GET /api/notes?category=xxx&q=xxx
 */

import { NextResponse } from 'next/server';
import {
  scanNotes,
  getNotesByCategory,
  getNotesByTag,
  searchNotes,
  getAllTags,
  getCategoryStats
} from '@/features/notes/lib/noteScanner';
import type { Note } from '@/features/notes/lib/frontMatter';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    const tag = searchParams.get('tag');

    // 扫描所有笔记
    const allNotes = await scanNotes();

    // 过滤
    let filtered: Note[] = allNotes;

    if (category && category !== 'all') {
      filtered = getNotesByCategory(allNotes, category);
    }

    if (tag) {
      filtered = getNotesByTag(filtered, tag);
    }

    if (query) {
      filtered = searchNotes(filtered, query);
    }

    // 去除content，只返回元数据
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const metas = filtered.map(({ content, ...meta }) => meta);

    // 获取统计数据
    const categoryStats = getCategoryStats(allNotes);
    const tags = getAllTags(allNotes);

    return NextResponse.json({
      notes: metas,
      total: metas.length,
      categories: categoryStats,
      tags
    });
  } catch (error) {
    console.error('Failed to load notes:', error);
    return NextResponse.json(
      { error: 'Failed to load notes', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
