/**
 * Front Matter 解析器
 * 解析 Markdown 文件开头的 YAML 元数据
 */

export interface NoteMeta {
  slug: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  difficulty: '入门' | '进阶' | '高级';
  readTime: number;
  order: number;
  author: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note extends NoteMeta {
  content: string;
}

/**
 * 从 Markdown 内容中解析 Front Matter 和正文
 */
export function parseMarkdownFile(content: string, slug: string): Note | null {
  // 检查是否有 Front Matter
  if (!content.startsWith('---')) {
    // 没有 Front Matter，返回默认元数据
    return {
      slug,
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      category: '',
      description: '',
      tags: [],
      difficulty: '入门',
      readTime: Math.max(1, Math.floor(content.split(/\s+/).length / 200)),
      order: 999,
      author: 'degang',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      content: content.trim()
    };
  }

  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) {
    return null;
  }

  const frontMatter = content.slice(3, endIndex).trim();
  const markdown = content.slice(endIndex + 3).trim();

  // 解析 Front Matter 属性
  const meta: Partial<NoteMeta> = {};

  for (const line of frontMatter.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // 去除引号
    if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    switch (key) {
      case 'title':
        meta.title = value;
        break;
      case 'category':
        meta.category = value;
        break;
      case 'description':
        meta.description = value;
        break;
      case 'difficulty':
        meta.difficulty = value as '入门' | '进阶' | '高级';
        break;
      case 'readTime':
        meta.readTime = parseInt(value);
        break;
      case 'order':
        meta.order = parseInt(value);
        break;
      case 'author':
        meta.author = value;
        break;
      case 'coverImage':
        meta.coverImage = value;
        break;
      case 'tags':
        meta.tags = parseTags(value);
        break;
      case 'createdAt':
        meta.createdAt = value;
        break;
      case 'updatedAt':
        meta.updatedAt = value;
        break;
    }
  }

  // 设置默认值
  if (!meta.title) meta.title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  if (!meta.description) meta.description = '';
  if (!meta.order) meta.order = 999;
  if (!meta.difficulty) meta.difficulty = '入门';
  if (!meta.readTime) {
    // 根据字数估算阅读时间（200字/分钟）
    const wordCount = markdown.split(/\s+/).length;
    meta.readTime = Math.max(1, Math.floor(wordCount / 200));
  }
  if (!meta.tags) meta.tags = [];
  if (!meta.author) meta.author = 'degang';
  if (!meta.createdAt) meta.createdAt = new Date().toISOString().split('T')[0];
  if (!meta.updatedAt) meta.updatedAt = new Date().toISOString().split('T')[0];

  return {
    ...meta,
    slug,
    content: markdown
  } as Note;
}

/**
 * 解析标签数组
 * 支持格式: [tag1, tag2, tag3] 或 tag1, tag2, tag3
 */
function parseTags(value: string): string[] {
  if (!value || value.trim() === '' || value.trim() === '[]') {
    return [];
  }

  value = value.trim();

  // [tag1, tag2, tag3]
  if (value.startsWith('[') && value.endsWith(']')) {
    value = value.slice(1, -1);
    return value
      .split(',')
      .map(t => t.trim().replace(/^['"]|['"]$/g, ''))
      .filter(t => t.length > 0);
  }

  // tag1, tag2, tag3
  return value
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);
}

/**
 * 从 Markdown 内容中提取 Front Matter（不包含正文）
 */
export function extractFrontMatter(content: string): Record<string, string> | null {
  if (!content.startsWith('---')) {
    return null;
  }

  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) {
    return null;
  }

  const frontMatter = content.slice(3, endIndex).trim();
  const result: Record<string, string> = {};

  for (const line of frontMatter.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // 去除引号
    if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

/**
 * 从 Markdown 内容中提取纯正文（去除 Front Matter）
 */
export function extractMarkdownContent(content: string): string {
  if (!content.startsWith('---')) {
    return content;
  }

  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) {
    return content;
  }

  return content.slice(endIndex + 3).trim();
}
