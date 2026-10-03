# AI Overview - Claude AI 助手指南

本项目是一个综合性人工智能技术概览与学习平台，帮助开发者了解和掌握AI技术。

**技术栈**: Next.js 15.5.9 + React 19 + Tailwind 4 | Spring Boot 3.5.9 + Spring AI 1.0.3 + Java 21 | **架构**: 前后端分离

---

## 快速导航

- [快速开始](#快速开始)
- [设计原则](#设计原则)
- [常见任务](#常见任务)
- [部署指南](#部署指南)
- [重要注意事项](#重要注意事项)

---

## 快速开始

### 前置要求
- JDK 21+, Node.js 18+, pnpm 8+, Maven 3.8+
- Docker & Docker Compose（可选）

### 启动命令

**后端**:
```bash
cd backend
mvn spring-boot:run -pl ai-demo -Dspring-boot.run.profiles=dev \
  -Dspring-boot.run.workingDirectory=$(pwd)
```

> 两个必须项：`-pl ai-demo`（父 pom 没有 mainClass，不加会报找不到主类）；`workingDirectory=$(pwd)`（`spring-boot:run` 默认 fork 在**模块目录 ai-demo/** 下，`application-dev.yml` 里的相对路径会漂移——SQLite、笔记目录、向量索引全都会指错地方）。IDEA 里运行配置的工作目录是 `backend/`，所以 IDE 启动不需要这一项。详见 `doc/local-dev.md`。

**前端**:
```bash
cd frontend
pnpm install
pnpm dev
```

**访问地址**:
- 前端: http://localhost:3010（端口在 `frontend/package.json` 的 `dev` 脚本里，不是 Next.js 默认的 3000）
- 后端API: http://localhost:8090
- 健康检查: http://localhost:8090/actuator/health
- Prometheus / Grafana: http://localhost:9090 / http://localhost:3000（需 `monitoring` profile）

### 文档在哪

全部文档在 `doc/`，入口是 **`doc/README.md`**（文档地图）。改代码前先扫一眼这张表：

| 改到…… | 同步更新 |
| --- | --- |
| 配置项、模型、思考模式 | `doc/model-config.md` |
| 命令、端口、启动方式 | `doc/local-dev.md`、`doc/makefile.md`、本文件 |
| 指标名、监控栈 | `doc/monitoring.md` |
| 目录结构、技术栈 | `README.md`、`doc/README.md` |

---

## 设计原则

### 关注点分离

**前端目录组织**:
- `components/功能名/` - UI组件层
- `components/demos/` - 应用广场组件聚合
- `features/功能名/lib/` - 业务逻辑层
- `app/功能名/` - 路由和页面组装
- `app/demos/[id]/` - 动态路由支持多应用

**后端分层**:
- `controller/` - HTTP请求处理
- `service/` - 业务逻辑（含策略模式实现）
- `dao/` - 数据访问
- `model/` - 实体与DTO

### 多模型策略模式

两个供应商策略（`service/strategy/impl/`），由 `ChatModelStrategyFactory` 按**模型 id 前缀**路由：

| 策略 | 供应商 | 端点 | 可用条件 |
| --- | --- | --- | --- |
| `DeepSeekStrategy` | DeepSeek | `spring.ai.openai.*`（api.deepseek.com） | `DEEPSEEK_API_KEY` |
| `GlmStrategy` | 智谱 | `spring.ai.glm.*`（open.bigmodel.cn） | `GLM_API_KEY` |

- `deepseek-*` / 其他 → DeepSeek；`glm*` → 智谱；历史别名 `deepseek` / `glm` 会被 `normalizeModelId` 归一
- 目标策略不可用时**静默回退 DeepSeek** 并打 WARN 日志（排查「选了 GLM 怎么没生效」先看这行日志）
- **Embedding 只能走智谱**（DeepSeek 无 embedding 接口），由 `RagConfig` 单独构建客户端

### 场景级模型与思考模式

- 每个应用用哪个模型由 `app.ai.*` 配置决定，可用环境变量覆盖，**改配置不改代码**：`AI_MODEL_PROMPT_OPTIMIZER`、`AI_MODEL_RAG_QA`（默认均为 `deepseek-flash`）
- `deepseek-flash`（V4.1-Flash）**默认开启思考模式**，轻任务首字延迟从 ~1s 恶化到 ~11s；由 `DeepSeekThinkingModeConfig` 在 **Jackson 序列化层**注入 `{"thinking":{"type":"disabled"}}` 关闭，开关 `deepseek.thinking-disabled`
- ⚠️ **不要用 HTTP 客户端拦截器/过滤器改写请求体去注入参数**——实测会触发 DeepSeek 网关 401。注入必须放序列化层
- 新增模型：实现 `ChatModelStrategy` 接口 → 注册到工厂（Spring 自动收集 `List<ChatModelStrategy>`）→ 在 `application.yml` 补配置

完整说明见 **`doc/model-config.md`**。

### 代码规范

**命名**:
- 前端页面: PascalCase (如 `PromptEditor.tsx`)
- 前端工具: camelCase (如 `formatDate.ts`)
- 后端Controller: `XxxController`
- 后端Service: `XxxService` (接口) + `XxxServiceImpl` (实现)

**导入顺序**: React → 第三方库 → 项目组件 → 项目功能 → 类型 → 样式

**日志**: 使用 SLF4J / Logback
```java
@Slf4j
public class XxxService {
    public void someMethod() {
        log.info("关键信息: {}", value);
        log.debug("调试信息: {}", debugValue);
        log.error("错误信息", exception);
    }
}
```

---

## 常见任务

### 添加新的AI模型

1. 创建策略类: `backend/ai-demo/.../service/strategy/impl/XxxStrategy.java`，实现 `ChatModelStrategy`（`@Component`，Spring 会自动收集进 `ChatModelStrategyFactory` 的 `List<ChatModelStrategy>`）
2. 在 `application.yml` 补该供应商的端点与 key 配置，并让 `getModelName()` 返回的路由 key 与 `ChatModelStrategyFactory` 的前缀判断一致
3. 若属于已有供应商（如 DeepSeek 新模型名），**不用新建策略**：直接在 `app.ai.*` 场景配置里写模型 id 即可，前缀路由会自动选中供应商

### 添加新的应用广场卡片

编辑 `frontend/src/components/demos/demos-page.tsx`:
```typescript
{
  id: 'app-id',
  icon: <IconName className="w-6 h-6" />,
  title: '应用名称',
  description: '应用描述',
  available: true,
  tags: ['标签1', '标签2'],
  url: '/app-route'
}
```

**新增页面检查清单**:
- [ ] 创建页面组件
- [ ] 配置路由
- [ ] **更新 `visitorStats.ts` 中的 `PATH_MAP`**

### 添加新的AI工具箱条目

数据源：`frontend/data/tools.json`（分类 + 工具列表）。详情文件放 `frontend/public/lib/tools/{工具名}.md`，文件名必须与工具 name 完全一致。图标放 `frontend/public/tool-icon/`。

**智能体（WorkBuddy / Trae 等）执行本任务的标准流程**：

方式A（智能体本地执行，推荐）：智能体自带模型能力，直接编辑，无需 API key：
1. 编辑 `frontend/data/tools.json`：新增条目的 ID 按 `categoryId * 1000` 起段递增分配（跳过已占用）；`icon` 优先用 curl/wget 从 icon.horse 或 Google favicon 抓取（存入 `frontend/public/tool-icon/`，文件名用工具名小写去掉非字母数字），失败用 emoji 兜底
2. 按 `doc/prompt/tool-detail.md` 模板生成详情，写入 `frontend/public/lib/tools/{name}.md`（文件名必须与 name 完全一致）
3. 校验：`frontend/data/tools.json` 可被 JSON.parse、条目按 id 升序、`cd frontend && npx tsc --noEmit` 通过
4. 向用户汇报新增/修改的内容，完成后清空 pending-tools.md（如有）

方式B（脚本模式，仅用于 CI 或本地无智能体场景）：把清单写入 `scripts/tools-sync/input/pending-tools.md`，从仓库根目录 `.env` 读取 `DEEPSEEK_API_KEY`，运行 `node scripts/tools-sync/sync.mjs`——脚本会自己调 LLM 生成内容并更新文件。

**移除工具**：运行 `node scripts/tools-sync/sync.mjs --remove 工具名`（忽略大小写，无需 API key），脚本会自动清理数据条目、详情 md 和不再被引用的图标，并按 id 重新排序。

详见 `doc/tools-sync.md`。

### 添加新的知识笔记

1. 创建文件: `frontend/public/lib/notes/分类/文件名.md`
2. 添加 Front Matter:
```markdown
---
title: 笔记标题
category: 分类
tags: ['标签1', '标签2']
author: degang
date: 2024-01-01
---

# 正文内容
```

### 修改API配置

**后端配置文件**:
- `application.yml` - 主配置
- `application-dev.yml` - 开发环境
- `application-prod.yml` - 生产环境

**环境变量**: 仓库根目录 `.env`（与 docker-compose.yml 同级；compose 原生读取，`backend/Makefile` 通过 `include ../.env` 读取。IDEA/mvn 裸跑后端时环境变量来自 `~/.zshrc` export，需与 .env 保持一致）
```bash
DEEPSEEK_API_KEY=sk-xxxxx        # 对话模型
GLM_API_KEY=xxxxx                # 智谱：RAG 的 Embedding 必需；可选 GLM 对话
AI_MODEL_PROMPT_OPTIMIZER=deepseek-flash   # 可选：提示词优化器用哪个模型
AI_MODEL_RAG_QA=deepseek-flash             # 可选：RAG 问答用哪个模型
```

---

## 部署指南

### Docker 部署

```bash
cd backend
make env-init                  # 首次：创建 ../.env
make docker-compose-up-build   # 构建并启动后端
make docker-compose-monitoring # 按需拉起 Prometheus + Grafana
```

**相关配置**:
- `docker-compose.yml` - 生产环境编排（监控栈在 `monitoring` profile 里）
- `backend/Dockerfile` - 后端镜像构建

⚠️ **改完后端代码必须重建镜像**。`Dockerfile` 只 `COPY` 本地已构建好的 fat jar（`ai-demo/target/backend-ai-demo-0.0.1-SNAPSHOT.jar`），**不在容器里跑 maven**，所以顺序是：

```bash
cd backend
mvn -pl ai-demo -am package -DskipTests                       # 1. 先在本地打包
docker compose -f ../docker-compose.yml build backend          # 2. 重建镜像
docker compose -f ../docker-compose.yml up -d backend          # 3. 用新镜像重建容器
```

只跑 `make docker-compose-monitoring`（= `docker compose --profile monitoring up -d`，**无 `--build`**）不会更新代码，容器会一直跑旧镜像。详见 `doc/makefile.md`。

### 数据持久化

访问统计数据存储在 Docker volume:
```yaml
volumes:
  visitor_stats_data:  # 访客统计数据卷
```

SQLite数据文件: `/app/db/visitor_stats.db`（容器内）

---

## 重要注意事项

### API 密钥管理
- 生产环境使用环境变量
- 不要将 `.env` 文件提交到版本控制
- `.env` 已在 `.gitignore` 中

### 前端 API 代理
Next.js 通过 rewrite 代理 API 请求到后端，配置在 `next.config.ts`

### 数据库
- SQLite 用于访问统计
- 数据文件: `/app/db/visitor_stats.db`（容器内）
- Docker volume 持久化: `visitor_stats_data`
