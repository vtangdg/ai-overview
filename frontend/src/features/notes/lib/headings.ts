/**
 * 标题锚点与目录（TOC）工具
 *
 * id 生成与渲染侧（MarkdownRenderer 的 rehype-slug）使用同一个 github-slugger 库，
 * 保证「提取大纲」与「渲染标题」产出的 id 完全一致。
 */

import GithubSlugger from 'github-slugger';

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * 从 Markdown 源码中提取 h2 / h3 标题作为目录
 * 跳过代码块内的 # 行，并剥离行内格式（加粗、链接等），与渲染后的标题文本保持一致
 */
export function extractHeadings(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  // slugger 内部维护重复标题计数，每次提取都用全新实例
  const slugger = new GithubSlugger();
  let inCodeBlock = false;

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = /^(#{1,4})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const level = match[1].length;
    if (level < 2 || level > 3) continue;

    const text = match[2]
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*_~`]/g, '')
      .trim();
    if (!text) continue;

    items.push({
      id: slugger.slug(text),
      text,
      level: level as 2 | 3,
    });
  }

  return items;
}
