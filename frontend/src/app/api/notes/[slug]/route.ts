/**
 * 单个笔记详情 API
 * GET /api/notes/[slug]
 */

import { NextResponse } from 'next/server';
import { getNoteBySlug } from '@/features/notes/lib/noteScanner';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 添加调试日志
    console.log('[Note API] Fetching note with slug:', slug);
    console.log('[Note API] Current working directory:', process.cwd());
    console.log('[Note API] Notes path:', path.join(process.cwd(), 'public', 'notes'));

    const note = await getNoteBySlug(slug);

    if (!note) {
      console.log('[Note API] Note not found:', slug);
      return NextResponse.json(
        { error: 'Note not found', slug },
        { status: 404 }
      );
    }

    console.log('[Note API] Note found successfully:', note.title);
    return NextResponse.json(note);
  } catch (error) {
    console.error('[Note API] Failed to load note:', error);
    console.error('[Note API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: 'Failed to load note',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
