# frontend

AI Overview 的前端：Next.js 15（App Router）+ React 19 + TypeScript + Tailwind CSS 4。

## 开发

```bash
pnpm install
pnpm dev      # http://localhost:3010（端口在 package.json 的 dev 脚本里，不是默认 3000）
pnpm build    # 生产构建
pnpm lint     # ESLint
```

后端接口通过 `next.config.ts` 的 rewrites 代理：`/api/**` → `BACKEND_API_URL`（默认 `http://localhost:8090`），其中 `/api/notes/**` 例外，由 Next.js 自己的路由处理。

```bash
BACKEND_API_URL=http://192.168.1.10:8090 pnpm dev
```

## 目录约定

```
src/
├── app/                  # 路由与页面组装
│   ├── concepts/         # 概念库
│   ├── tools/            # AI 工具箱
│   ├── notes/            # 知识笔记（含 [slug] 详情）
│   ├── demos/            # 应用广场（[id] 动态路由）
│   ├── qa/               # 知识问答
│   ├── stats/  admin/    # 访问统计与后台
│   └── api/              # Next.js 自有 API 路由（如 notes）
├── components/
│   ├── common/           # 通用组件
│   ├── demos/            # 应用广场组件（demos-page.tsx 是应用卡片的数据源）
│   └── qa/               # 知识问答组件
├── features/             # 按功能组织的业务逻辑（如 features/prompt-optimizer/lib/）
└── lib/                  # 工具函数（sse.ts 为通用 SSE 解析，问答与优化器共用）
data/tools.json           # AI 工具箱数据源（唯一真相来源）
public/lib/notes/         # 知识笔记 Markdown（后端 RAG 索引的输入）
public/lib/tools/         # 工具详情 Markdown（文件名须与工具 name 完全一致）
public/tool-icon/         # 工具图标
```

## 约定

- **Markdown 渲染统一走 `src/components/common/markdown/MarkdownRenderer.tsx`**，不要各自引 react-markdown。该组件必须保留 `remark-cjk-friendly` 插件：它修复中文强调解析（否则 `**术语（说明）**后接汉字` 的粗体静默失效）。
- **`/qa` 页面内的跳转用原生 `<a target="_blank">`，不要用 `next/link`**：会话消息只存在组件内存里，客户端路由跳转会清空整轮问答记录。
- 改动后跑 `npx tsc --noEmit` 验证类型。
- 新增页面需同步更新 `visitorStats.ts` 里的 `PATH_MAP`。
- 往 AI 工具箱加/删工具见根目录 [doc/tools-sync.md](../doc/tools-sync.md)。
