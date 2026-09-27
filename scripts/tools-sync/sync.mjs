#!/usr/bin/env node
/**
 * AI 工具箱自动同步脚本
 *
 * 新增模式（默认）：
 *   1. 读取 scripts/tools-sync/input/pending-tools.md 中的原始工具清单
 *   2. 调用 DeepSeek API 生成：分类/工具结构化数据 + 每个工具的详情 Markdown
 *   3. 自动抓取工具图标（favicon 服务，失败回退 emoji）
 *   4. 更新 frontend/data/tools.json，写入 frontend/public/lib/tools/*.md 与 frontend/public/tool-icon/*
 *
 * 移除模式：
 *   node scripts/tools-sync/sync.mjs --remove 工具名1 工具名2
 *   按名称（忽略大小写）移除工具，同时清理详情 md 和不再被引用的图标文件
 *
 * 用法：
 *   DEEPSEEK_API_KEY=sk-xxx node scripts/tools-sync/sync.mjs
 *
 * 依赖：Node.js 18+（使用内置 fetch），无第三方依赖。
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

const TOOLS_JSON = path.join(ROOT, 'frontend', 'data', 'tools.json');
const TOOLS_MD_DIR = path.join(ROOT, 'frontend', 'public', 'lib', 'tools');
const ICON_DIR = path.join(ROOT, 'frontend', 'public', 'tool-icon');
const INPUT_FILE = path.join(__dirname, 'input', 'pending-tools.md');

const LLM_API_URL = process.env.LLM_API_URL || 'https://api.deepseek.com/chat/completions';
const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-chat';
const LLM_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.LLM_API_KEY;

const log = (...args) => console.log('[tools-sync]', ...args);

// ---------- 工具函数 ----------

const slugify = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '');

async function callLLM(messages, { jsonMode = false } = {}) {
  if (!LLM_API_KEY) {
    throw new Error('缺少 API Key：请设置 DEEPSEEK_API_KEY 环境变量');
  }
  const body = {
    model: LLM_MODEL,
    messages,
    temperature: 0.3,
    max_tokens: 8192,
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`LLM 请求失败: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function fetchWithTimeout(url, ms = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal, redirect: 'follow' });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 通过文件头（magic bytes）判断图片真实格式，避免服务器 content-type 不准导致后缀错误
 */
function detectImageExt(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00) return 'ico';
  const head = buf.subarray(0, 300).toString('utf-8').trim().toLowerCase();
  if (head.startsWith('<svg') || head.startsWith('<?xml')) return 'svg';
  if (head.startsWith('riff') && buf.toString('utf-8', 8, 12) === 'WEBP') return 'webp';
  return null;
}

/**
 * 抓取工具图标。优先 icon.horse，其次 Google favicon 服务。
 * 返回 public 下的图标路径（如 /tool-icon/xxx.png），失败返回 null。
 */
async function downloadIcon(name, website) {
  if (!website) return null;
  const domain = String(website).replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!domain) return null;

  const base = slugify(name);
  if (!base) return null;

  const sources = [
    `https://icon.horse/icon/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ];

  for (const url of sources) {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) continue;
      const type = res.headers.get('content-type') || '';
      if (!type.startsWith('image/')) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 512) continue; // 太小多半是占位图
      const ext = detectImageExt(buf);
      if (!ext) {
        log(`提示: ${name} 的图标格式无法识别 (${type})，跳过该源`);
        continue;
      }
      const file = path.join(ICON_DIR, `${base}.${ext}`);
      await fs.writeFile(file, buf);
      return `/tool-icon/${base}.${ext}`;
    } catch {
      // 尝试下一个源
    }
  }
  return null;
}

// ---------- 移除模式 ----------

async function removeTools(names) {
  const data = JSON.parse(await fs.readFile(TOOLS_JSON, 'utf-8'));
  const tools = data.tools;
  const removed = [];
  const missing = [];

  for (const name of names) {
    const idx = tools.findIndex((t) => t.name.toLowerCase() === name.toLowerCase());
    if (idx === -1) {
      missing.push(name);
      continue;
    }
    const tool = tools[idx];
    tools.splice(idx, 1);
    removed.push(tool.name);

    // 清理详情 md
    try {
      await fs.unlink(path.join(TOOLS_MD_DIR, `${tool.name}.md`));
    } catch {
      log(`提示: ${tool.name} 没有详情文件，跳过`);
    }

    // 清理图标：仅当没有其他工具引用同一图标时才删除
    if (tool.icon.startsWith('/tool-icon/')) {
      const stillUsed = tools.some((t) => t.icon === tool.icon);
      if (!stillUsed) {
        try {
          await fs.unlink(path.join(ROOT, 'frontend', 'public', tool.icon));
        } catch {
          log(`提示: 图标文件不存在或无法删除: ${tool.icon}`);
        }
      }
    }
    log(`已移除: ${tool.name}`);
  }

  if (!removed.length) {
    log(`没有匹配的工具: ${names.join('、')}`);
    process.exit(0);
  }

  // 按 id 排序，保证 JSON 中条目顺序与 id 一致，便于人工查看与 diff
  tools.sort((a, b) => a.id - b.id);
  await fs.writeFile(TOOLS_JSON, JSON.stringify(data, null, 2) + '\n', 'utf-8');

  if (missing.length) log(`未找到（跳过）: ${missing.join('、')}`);
  log(`完成！共移除 ${removed.length} 个工具: ${removed.join('、')}`);
  log(`已更新: ${path.relative(ROOT, TOOLS_JSON)}`);
}

// ---------- 主流程 ----------

async function main() {
  // --remove 模式：node sync.mjs --remove 工具名1 工具名2（支持逗号分隔，不需要 API key）
  const args = process.argv.slice(2);
  const removeIdx = args.indexOf('--remove');
  if (removeIdx !== -1) {
    const names = args
      .slice(removeIdx + 1)
      .flatMap((s) => s.split(','))
      .map((s) => s.trim())
      .filter(Boolean);
    if (!names.length) {
      console.error('[tools-sync] 用法: node sync.mjs --remove 工具名1 [工具名2 ...]');
      process.exit(1);
    }
    await removeTools(names);
    return;
  }

  let rawInput;
  try {
    rawInput = await fs.readFile(INPUT_FILE, 'utf-8');
  } catch {
    log(`未找到输入文件 ${INPUT_FILE}，退出`);
    process.exit(0);
  }

  // 去掉注释行后判断是否为空
  const effective = rawInput
    .split('\n')
    .filter((l) => !l.trim().startsWith('//') && l.trim() !== '')
    .join('\n')
    .trim();
  if (!effective) {
    log('输入清单为空，没有需要同步的内容，退出');
    process.exit(0);
  }

  const data = JSON.parse(await fs.readFile(TOOLS_JSON, 'utf-8'));
  const categories = data.categories;
  const tools = data.tools;

  // 与现有工具做差集（按名称忽略大小写比较）
  const existingNames = new Set(tools.map((t) => t.name.toLowerCase()));
  const inputLines = effective.split('\n').map((l) => l.trim());
  const candidateNames = inputLines
    .flatMap((l) => l.split(/[：:，,]/).slice(1))
    .map((s) => s.trim())
    .filter(Boolean);
  const skipped = candidateNames.filter((n) => existingNames.has(n.toLowerCase()));
  const pendingLines = inputLines.filter((l) =>
    l.split(/[：:，,]/).slice(1).some((s) => s.trim() && !existingNames.has(s.trim().toLowerCase()))
  );
  if (skipped.length) log('跳过已存在的工具:', skipped.join('、'));

  if (!pendingLines.length) {
    log('清单中的工具均已存在，没有新增内容，退出');
    process.exit(0);
  }

  // 已有详情 md 文件列表，供 LLM 参考命名与避免重复生成
  const existingMdFiles = await fs.readdir(TOOLS_MD_DIR);

  const systemPrompt = `你是一个 AI 工具导航站的内容编辑。用户会提供一份原始工具清单（格式："分类名：工具A,工具B"，缩进行表示二级分类）。
现有分类体系与工具列表会以 JSON 提供。你需要：
1. 判断每个新工具归属的一级分类（优先复用现有分类；确实需要时才新增分类）和可选的二级分类（优先复用现有的）。
2. 为每个工具写一句简要中文描述（breifDesc，30字以内）和一个合适的 emoji 图标（iconEmoji）。
3. 给出工具的官网域名（website，仅域名如 "chat.deepseek.com"，不确定就留空字符串）。
4. 按照指定模板为每个工具撰写详情介绍 Markdown。

详情 Markdown 模板（严格遵守）：
## 产品基本信息
- **工具名称**：
- **一句话定位**：
- **核心技术/模型**：
（若知道官网则加一行：- **官网地址**：[域名](https://域名)）
## 核心功能与场景
- 功能名：简要描述（4~6条）
## 使用场景
- 场景：简要描述（3~5条）
## 技术优势与特点
- 优势（2~4条）

注意：
- 清单中缩进行表示的二级分类必须体现在对应工具的 subcategoryName 字段中（哪怕需要新建二级分类）。
- 不要编造不确定的信息，官网域名不确定就留空。
- 详情开头不要加一级标题，直接从 "## 产品基本信息" 开始。
- 只处理清单中的新工具，不要输出已存在的工具。`;

  const userPrompt = `现有分类与工具数据：
${JSON.stringify({ categories, tools: tools.map(({ id, name, categoryId, subcategoryId }) => ({ id, name, categoryId, subcategoryId })) }, null, 2)}

现有详情文件（已存在的无需重新生成）：${existingMdFiles.join('、')}

新增工具原始清单：
${pendingLines.join('\n')}

请严格按以下 JSON 格式输出（不要输出其他内容）：
{
  "newCategories": [{ "name": "新分类名", "icon": "emoji" }],
  "tools": [{
    "name": "工具名",
    "categoryName": "一级分类名",
    "subcategoryName": "二级分类名或null",
    "website": "域名或空字符串",
    "iconEmoji": "emoji",
    "breifDesc": "一句话简介",
    "detailMarkdown": "详情Markdown（含\\n换行）"
  }]
}`;

  log('调用 LLM 生成工具数据与详情内容...');
  const content = await callLLM(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { jsonMode: true }
  );

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('LLM 返回的不是合法 JSON: ' + content.slice(0, 500));
  }

  // 应用新的分类（避免重名）
  const newCats = [];
  for (const c of parsed.newCategories || []) {
    if (!categories.some((x) => x.name === c.name)) {
      const id = Math.max(0, ...categories.map((x) => x.id)) + 1 + newCats.length;
      const cat = { id, name: c.name, icon: c.icon || '🔧', subcategories: [] };
      categories.push(cat);
      newCats.push(cat);
    }
  }

  // 应用新的工具
  const added = [];
  for (const t of parsed.tools || []) {
    const name = String(t.name || '').trim();
    if (!name || existingNames.has(name.toLowerCase())) continue;

    const cat =
      categories.find((c) => c.name === t.categoryName) ||
      categories.find((c) => t.categoryName && c.name.includes(t.categoryName));
    if (!cat) {
      log(`警告: 工具 ${name} 的分类 "${t.categoryName}" 未找到，跳过`);
      continue;
    }

    // 二级分类：复用或新建
    let subId = 0;
    if (t.subcategoryName) {
      let sub = cat.subcategories.find((s) => s.name === t.subcategoryName);
      if (!sub) {
        const subIdCandidate =
          cat.id * 100 + Math.max(0, ...cat.subcategories.map((s) => s.id % 100), 0) + 1;
        sub = { id: subIdCandidate, name: t.subcategoryName };
        cat.subcategories.push(sub);
      }
      subId = sub.id;
    }

    // ID 分配：categoryId * 1000 起段，跳过已占用
    let id = cat.id * 1000;
    const usedIds = new Set(tools.map((x) => x.id));
    while (usedIds.has(id)) id++;
    if (id >= (cat.id + 1) * 1000) {
      log(`警告: 分类 ${cat.name} 的 ID 段已满，跳过 ${name}`);
      continue;
    }

    // 图标：先尝试官网 favicon，失败用 emoji
    const iconPath = await downloadIcon(name, t.website);
    const icon = iconPath || t.iconEmoji || '🔧';
    if (!iconPath) log(`提示: ${name} 未能抓取到图标，使用 emoji ${icon}`);

    tools.push({
      id,
      name,
      categoryId: cat.id,
      subcategoryId: subId,
      icon,
      breifDesc: String(t.breifDesc || '').trim() || `${name} - AI工具。`,
    });

    // 写详情 md
    if (t.detailMarkdown && String(t.detailMarkdown).trim()) {
      await fs.writeFile(path.join(TOOLS_MD_DIR, `${name}.md`), String(t.detailMarkdown).trim() + '\n', 'utf-8');
    } else {
      log(`提示: ${name} 未生成详情 Markdown`);
    }

    added.push(name);
    log(`已添加: ${name} (id=${id}, 分类=${cat.name}${subId ? '/' + t.subcategoryName : ''}, 图标=${icon})`);
  }

  if (!added.length) {
    log('没有成功添加任何工具，不写入文件');
    process.exit(0);
  }

  // 按 id 排序，保证 JSON 中条目顺序与 id 一致，便于人工查看与 diff
  tools.sort((a, b) => a.id - b.id);

  await fs.writeFile(TOOLS_JSON, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  log(`完成！共新增 ${added.length} 个工具: ${added.join('、')}`);
  log(`已更新: ${path.relative(ROOT, TOOLS_JSON)}`);
}

main().catch((err) => {
  console.error('[tools-sync] 同步失败:', err.message);
  process.exit(1);
});
