# AI Overview

综合性 AI 技术学习平台：沉淀 AI 概念与工具资料，并把这些资料变成可对话、可检索、可生成的应用。

## 功能构成

**四个内容栏目**

| 栏目 | 路由 | 说明 |
| --- | --- | --- |
| 概念库 | `/concepts` | AI 名词概念卡片，分类（通识/技术/商业/产品/其他）浏览与检索 |
| AI 工具箱 | `/tools` | 常用 AI 工具目录，含分类、详情介绍与官网链接 |
| 知识笔记 | `/notes` | 站内 Markdown 笔记，支持 Front Matter（标题/分类/标签/作者/日期） |
| 应用广场 | `/demos` | 各 AI 应用的统一入口 |

**应用广场里的应用**（`frontend/src/components/demos/demos-page.tsx` 的 `demos` 数组是唯一数据源）

| 应用 | 路由 | 说明 |
| --- | --- | --- |
| 知识问答助手 | `/qa` | 站内笔记 RAG 检索问答，流式输出 + 溯源卡片，库外拒答 |
| 提示词优化器 | `/demos/prompt-optimizer` | 按任务描述生成提示词、按反馈迭代优化，流式输出 |
| AI 概念解释器 | `/demos/concept-explainer` | 输入概念名，输出简明定义/原理/应用/关联技术 |
| 股票智能分析 | 外部链接 | 独立部署的应用，通过 `NEXT_PUBLIC_STOCK_ANALYSIS_URL` 配置地址 |


## 技术栈

### 前端

- Next.js 15.5.9（App Router）+ React 19.2.3
- TypeScript 5、Tailwind CSS 4
- Markdown 渲染：react-markdown + remark-gfm + remark-cjk-friendly（修复中文强调解析）
- 包管理器：pnpm
- 开发端口：**3010**（在 `frontend/package.json` 的 `dev` 脚本里指定）

### 后端

- Spring Boot 3.5.9 / Java 21 / Maven
- Spring AI 1.0.3（`spring-ai-starter-model-openai`，OpenAI 兼容协议对接 DeepSeek）
- SQLite + MyBatis（访问统计）、Caffeine（本地缓存）
- Actuator + Micrometer + Prometheus（监控）
- 端口：**8090**

### 部署

- 前端：Vercel（详见 `doc/deploy/frontend-vercel.md`）
- 后端：Docker（`backend/Dockerfile` + `docker-compose.yml`），GitHub Actions 触发部署
- 监控栈：Prometheus + Grafana，按需以 `monitoring` profile 启动

## 项目结构

```
ai-overview
├── .github/workflows/       # CI/CD：前端 CI、后端 CD、工具箱同步
├── frontend/                # Next.js 前端
│   ├── data/tools.json      # AI 工具箱数据源
│   ├── public/lib/          # 笔记（notes/）、工具详情（tools/）、图标（tool-icon/）
│   └── src/
│       ├── app/             # 路由与页面（concepts / tools / notes / demos / qa / stats）
│       ├── components/      # 组件（含 demos/ 应用广场聚合）
│       ├── features/        # 业务逻辑（如 features/prompt-optimizer/lib/）
│       └── lib/             # 工具函数
├── backend/                 # Spring Boot 后端（父 pom + ai-demo 模块）
│   ├── ai-demo/             # 主应用模块（controller / service / dao / model）
│   ├── Dockerfile           # 后端镜像（COPY 预构建的 jar，不在容器内编译）
│   └── Makefile             # 容器管理命令
├── scripts/tools-sync/      # 工具箱同步脚本（含 CI 输入清单）
├── prometheus/              # Prometheus 配置（容器版 / 本地版）
├── grafana/                 # Grafana 数据源与看板自动装配
├── doc/                     # 全部项目文档（入口见 doc/README.md）
├── CLAUDE.md                # AI 助手指南：约定、常见任务
└── TODO.md                  # 待办事项
```

## 快速开始

### 前置要求

- JDK 21+、Maven 3.8+
- Node.js 18+、pnpm
- Docker + Docker Compose v2+（容器方式需要）

### 配置 API Key

在仓库根目录创建 `.env`（与 `docker-compose.yml` 同级；`docker compose` 会原生读取它）：

```bash
DEEPSEEK_API_KEY=sk-xxxxx
GLM_API_KEY=xxxxx
```

- `DEEPSEEK_API_KEY`：对话模型（提示词优化器、RAG 问答的生成）
- `GLM_API_KEY`：智谱，用于 RAG 的 **Embedding**（向量化）与可选的 GLM 对话

### 方式一：本地开发（推荐日常调试）

```bash
# 前端（端口 3010）
cd frontend && pnpm install && pnpm dev

# 后端（端口 8090）
cd backend && mvn spring-boot:run -pl ai-demo -Dspring-boot.run.profiles=dev
```

⚠️ 后端有两个容易踩的点，详见 `doc/local-dev.md`：

1. 必须带 `-pl ai-demo`（父 pom 没有 mainClass）；
2. `mvn spring-boot:run` 的工作目录是**模块目录 `ai-demo/`**，`application-dev.yml` 里的相对路径会漂移，需用启动参数覆盖（`doc/local-dev.md` 有可直接复制的完整命令）。

### 方式二：容器

```bash
cd backend
make env-init          # 首次：创建 ../.env
make check-env         # 校验 key 已配置
make docker-compose-up-build   # 构建并启动后端
make docker-compose-monitoring # 按需拉起 Prometheus + Grafana
```

⚠️ **改完后端代码后必须重建镜像**（`docker-compose-monitoring` 不会构建）。完整流程见 `doc/makefile.md`。

### 访问地址

| 服务 | 地址 |
| --- | --- |
| 前端 | http://localhost:3010 |
| 后端 API | http://localhost:8090 |
| 健康检查 | http://localhost:8090/actuator/health |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000（默认 admin/admin） |

## 文档

全部文档在 `doc/`，从这里进入：**[doc/README.md](doc/README.md)**（文档地图）。常用几份：

| 文档 | 内容 |
| --- | --- |
| [doc/local-dev.md](doc/local-dev.md) | 本地起服务：端口、profile、路径坑 |
| [doc/makefile.md](doc/makefile.md) | `backend/Makefile` 全部命令与典型工作流 |
| [doc/model-config.md](doc/model-config.md) | 按场景切模型、关思考模式、供应商路由 |
| [doc/monitoring.md](doc/monitoring.md) | 监控栈与业务指标清单 |
| [doc/tools-sync.md](doc/tools-sync.md) | 往 AI 工具箱加/删工具的三种方式 |
| [doc/design/rag-qa.md](doc/design/rag-qa.md) | 知识问答（RAG）详细设计方案 |
| [doc/design/prompt-optimizer-simple.md](doc/design/prompt-optimizer-simple.md) | 提示词优化器落地版方案 |

## 开发约定

- 前端：遵循 ESLint / TypeScript 规范，改动后跑 `cd frontend && npx tsc --noEmit`
- 后端：遵循 Spring Boot 最佳实践，日志统一用 SLF4J（`@Slf4j`）
- 新增前端页面需同步更新 `visitorStats.ts` 的 `PATH_MAP`
- `.env` 已在 `.gitignore` 中，**不要提交密钥**
- 更多约定与「常见任务」清单见 [CLAUDE.md](CLAUDE.md)
