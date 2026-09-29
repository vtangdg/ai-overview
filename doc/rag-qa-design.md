# 站内知识问答助手（RAG）— 详细设计方案

> 状态：后端 + 前端均已实现，**浏览器端到端实测通过**（空状态 / 流式回答 + 来源卡片 / 库外拒答态 / 多轮追问）。待办：Docker 部署上线
> 日期：2026-09-29 更新
> 目标：基于站内知识笔记与 AI 概念库构建 RAG 问答能力，MVP 3 天内上线

---

## 一、产品方案

### 1.1 定位

给平台新增"站内知识问答助手"（路由 `/qa`）：用户用自然语言提问，回答**只基于站内知识笔记和概念库**生成，且每条回答**可溯源到具体笔记**。

### 1.2 解决的问题

- 笔记/概念库目前是"人找内容"，用户需自行翻分类；RAG 问答变成"内容找人"；
- 与已有 AI 应用（提示词优化器、概念解释器）形成差异：那两个是通用 AI 能力，这个是**基于自有知识的 AI 应用**——RAG 落地的核心故事。

### 1.3 核心场景

| 场景 | 用户行为 | 期望体验 |
|------|---------|---------|
| 精准提问 | "注意力机制和 RNN 的区别？" | 基于概念库生成对比回答，附 2-3 条来源链接 |
| 模糊探索 | "想了解大模型推理优化" | 命中多篇笔记，归纳回答 + 分点引用 |
| 库外问题 | 站内完全没覆盖的内容 | **诚实告知"站内知识未覆盖"**，不硬编 |

### 1.4 产品原则

1. **宁可拒答，不可瞎答**：一期只拒答、不外拓。拒答暴露的是边界清晰，硬答暴露的是幻觉。
2. **回答必须可溯源**：来源卡片可点击跳转原文，用户能直接验证答案。
3. **内容更新即知识更新**：新笔记发布后进入检索范围，与 tools-sync 自动化思路一致，形成"写笔记 → 自动可问答"闭环。

### 1.5 关键产品设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 引用展示 | 回答下方固定渲染来源卡片（标题+分类+跳转） | 建立信任，复用现有笔记详情页路由 |
| 未命中兜底 | 一期只拒答；二期再加"站外回答并标注非站内来源" | 先验证召回质量再放开边界 |
| 多轮追问 | MVP 透传最近一轮问答进 prompt；V1.1 做 query 改写 | 控制复杂度，先跑通主链路 |
| 提问引导 | 空状态放 3-4 个预设问题 chips | 降低冷启动门槛，展示能力边界 |

### 1.6 成功指标

- **引用点击率**：用户点来源的比例（可信度直接信号）；
- **拒答准确率**：库外问题正确拒答、库内问题无误拒；
- 追问率 / 会话完成率。

---

## 二、技术方案

### 2.1 总体架构：两条链路

```
【离线索引链路】
frontend/public/lib/notes/**.md（docker 只读挂载进后端容器）
  → MarkdownDocumentReader 按标题层级切块（chunk ≤ 3072 tokens）
  → 携带元数据：title / category / tags / sourcePath / heading
  → Embedding-3 向量化（2048 维）
  → SimpleVectorStore，JSON 持久化到 Docker volume

【在线问答链路】
POST /api/rag/qa（SSE）
  → RateLimiterService 限流（复用）
  → vectorStore.similaritySearch(topK=4, threshold≈0.6)
  → 未命中 → 直接返回拒答事件（不调 LLM）
  → 命中 → 手动组装 Prompt（只基于上下文回答，答不出则说明）
  → glm-4.7-flash 流式生成（复用现有策略模式 ChatClient）
  → SSE 事件：sources → delta* → done
```

### 2.2 技术选型及理由

| 组件 | 选型 | 理由（面试可讲） |
|------|------|----------------|
| 切块 | `spring-ai-markdown-document-reader`（pom 已有） | 按 markdown 标题切，语义完整；单 chunk ≤3072 tokens 是 Embedding-3 的硬约束 |
| Embedding | 智谱 **Embedding-3**（0.5 元/百万 tokens） | 中文质量好；OpenAI 兼容接口复用现有 starter；对比过 DashScope text-embedding-v3/v4（spring-ai-alibaba 示例同款），价格同级，选智谱因已有 key、接入路径最短 |
| 向量库 | Spring AI `SimpleVectorStore` + JSON 文件持久化 | 站内 chunk 千级以内，暴力检索毫秒级；为该量级引入 Milvus/pgvector 属于过度设计——**选型匹配规模** |
| 生成 | glm-4.7-flash（免费） | RAG 成本大头在生成侧，用免费模型则整体近零成本 |
| 检索方式 | **手动检索，不用 QuestionAnswerAdvisor** | 拒答判定和引用列表都需要拿到"命中了哪些 chunk"，advisor 拿不到；手动 20 行代码换来自定义空间 |

### 2.3 Embedding 成本估算

- 全库索引一次（100 篇 × 3000 tokens ≈ 30 万 tokens）≈ **0.15 元**，仅内容变更后重建时发生；
- 每次提问 query 向量化 ~50 tokens ≈ 0.000025 元，一天千次提问约 2 分钱；
- 结论：整体近零成本，无需本地 embedding 备选（备选：Spring AI transformers/ONNX 跑 bge-small-zh，镜像 +100MB）。

### 2.4 API 设计

**POST /api/rag/qa**（SSE 流式）

```jsonc
// Request
{ "question": "注意力机制和 RNN 的区别？", "history": [{ "q": "...", "a": "..." }] }  // history 可选，MVP 只带最近一轮

// SSE 事件序列
event: sources          // 检索完成后立即推送，前端先渲染来源卡片
data: [{"title":"Transformer 注意力机制","category":"概念库","url":"/concepts/xxx","snippet":"..."}]

event: message          // 增量文本，多次
data: {"delta": "两者的"}

event: rejected         // 库外拒答时替代 message
data: {"reason": "该问题超出了本站知识库的覆盖范围"}

event: done
data: {}
```

**POST /api/rag/index/rebuild** — 手动重建索引（admin）。

### 2.5 后端目录结构（新增 `rag/` 包）

```
controller/RagController.java        // SSE 端点 + 索引重建
service/RagQaService.java            // 检索 → 拒答判定 → prompt 组装 → 流式生成
service/RagIndexService.java         // 扫描笔记 → 切块 → 向量化 → 入库
config/RagProperties.java            // topK / threshold / 笔记路径 / 模型名 全部配置化
```

复用现有设施：`RateLimiterService`（限流）、`ChatModelStrategyFactory`（生成模型）、`GlobalExceptionHandler`、AOP 日志。启动时 `ApplicationRunner` 全量重建索引（笔记量小，秒级）。

Prompt 模板要点：只依据提供的上下文回答；上下文不足以回答时明确说明；回答末尾用 [1][2] 标注引用来源编号。

### 2.6 前端设计

**路由与入口**：新增 `/qa` 页面；`demos-page.tsx` 加卡片；`visitorStats.ts` 的 `PATH_MAP` 同步更新（CLAUDE.md checklist）。

**页面布局**（单卡片对话式）：

- 顶栏：标题 + 副文案"基于站内笔记与概念库 · 回答均可溯源"；
- 消息区：用户气泡右侧、AI 消息左侧（markdown 实时渲染，复用 `MarkdownRenderer`）；
- 来源卡片：AI 回答下方，标签区分"笔记 / 概念库"+ 标题 + 跳转 ↗，点击走现有 `/notes/[slug]` / 概念页；
- 拒答态：琥珀色提示样式，明确范围 + 引导浏览笔记库；
- 底部：预设问题 chips（空状态时展示）+ 输入框（Enter 发送、Shift+Enter 换行）。

**状态机**：`idle → retrieving（"正在检索知识库…"）→ streaming（光标动画）→ done | rejected | error`。

**目录结构**（沿用现有惯例，已落地）：

```
frontend/src/app/qa/page.tsx                 // 路由页（含 metadata）
frontend/src/features/qa/lib/types.ts        // QaSource / QaTurn / QaMessage / QaStatus
frontend/src/features/qa/lib/api.ts          // askStream（sources/message/rejected/error/done）、getIndexStatus
frontend/src/features/qa/lib/presets.ts      // 空状态预设问题
frontend/src/components/qa/qa-chat.tsx       // 对话主界面：状态机 + 输入区 + 空状态
frontend/src/components/qa/qa-message.tsx    // 单条消息：检索中占位 / 流式光标 / 拒答态 / 错误态
frontend/src/components/qa/source-cards.tsx  // 来源卡片（按笔记去重，点击跳 /notes/[slug]）
frontend/src/lib/sse.ts                      // 通用 SSE 解析与消费（与提示词优化器共用）
```

### 2.7 配置项（application.yml / RagProperties）

```yaml
rag:
  notes-paths: /app/notes           # 容器内挂载路径
  top-k: 4
  similarity-threshold: 0.35   # 实测标定值，见 2.9
  embedding:
    base-url: https://open.bigmodel.cn/api/paas/v4
    model: embedding-3
    dimensions: 2048
  chat-model: glm-4.7-flash
  store-path: /app/db/rag-store.json # Docker volume 持久化
```

Docker 集成：`docker-compose` 将 `./frontend/public/lib` 只读挂载到后端 `/app/notes`；`rag-store.json` 放入新 volume（或复用 `visitor_stats_data` 平级新增）。

### 2.8 已知坑位（提前规避）

- **维度一致性**：embedding dimensions（2048）必须与向量库初始化一致，否则存入/检索报错（spring-ai-alibaba 示例常见坑）；
- **中文编码**：SSE 输出沿用提示词优化器已验证的写法（UTF-8 显式声明），避免乱码/截断；
- **Front Matter 剥离**：笔记 YAML 头不进 chunk 正文，title/category 进元数据；
- **重建并发**：rebuild 期间拒绝问答请求或加互斥锁，避免半成品索引被检索。

### 2.9 实现落点与实测校准（2026-09-29 更新）

**已实现的后端文件**：

| 文件 | 职责 |
|------|------|
| `config/RagProperties.java` | 全部配置项（@ConfigurationProperties） |
| `config/RagConfig.java` | 手动构建指向智谱 OpenAI 兼容端点的 `OpenAiEmbeddingModel`（DeepSeek 无 embedding 接口，不能复用自动配置的那个）+ `SimpleVectorStore`（启动时从 JSON 加载） |
| `service/rag/MarkdownChunker.java` | 纯函数切块器：front matter 剥离 → 按 1~3 级标题切章 → 超长按段落二次切分 |
| `service/rag/RagIndexService.java` | 扫描 → 切块 → 向量化 → 入库 → JSON 持久化；启动时索引文件不存在则自动重建 |
| `service/rag/RagQaService.java` | 检索 / query 融合 / Prompt 组装 / 流式生成 |
| `controller/RagController.java` | `/api/rag/qa`（SSE）、`/api/rag/status`、`/api/rag/index/rebuild`、`/api/rag/search`（无阈值调试端点，用于标定阈值） |
| `resources/http/rag-api.http` | IDEA 内直接调试的请求集 |

**实测数据（20 篇笔记 → 290 chunks，索引约 60s，store 8.3MB）**：

| 问题类型 | 最高相似度分数 | 说明 |
|---------|--------------|------|
| 库内（"注意力机制和RNN的区别"） | 0.513 | 命中《Transformer架构详解》 |
| 库内（"大模型怎么做微调"） | 0.574 | 命中《模型微调》 |
| 库外（"今天上海天气怎么样"） | 0.189 | 分离带明显 |

→ **阈值定 0.35**（库内下界 0.45 与库外上界 0.2 的分离带中点，两侧都留余量）。教训：**阈值不能拍脑袋定 0.6，必须用真实分数分布标定**——第一版 0.6 导致库内问题全被拒答。

**多轮追问的 MVP 解法**：追问"那它有什么缺点？"单独向量化无语义（低于阈值被拒答），实现 `buildRetrievalQuery()` 把最近一轮用户问题拼进检索查询（query 融合），实测修复。V1.1 再升级为 LLM 改写。

**本地调试要点（IDEA / CLI）**：
- `mvn spring-boot:run` 的 fork 工作目录固定是模块目录 `backend/ai-demo/`，而 IDEA 运行配置的工作目录若是 `backend/`，则 dev 配置里相对路径（`./ai-demo/db`、`../frontend/...`）按 `backend/` 解析——**两种启动方式的相对路径基准不同**，命令行验证时用 `--spring.datasource.url` / `--rag.notes-paths` 等启动参数覆盖即可；
- IDEA 跑 RAG 需要环境变量 `GLM_API_KEY`（运行配置手动加，或装 EnvFile 插件读 `backend/.env`）；
- 检索是纯本地计算，索引文件生成后可零成本反复断点调试检索质量。

### 2.10 前端实现落点（2026-09-29 更新）

**关键实现点**：

| 点 | 说明 |
|----|------|
| SSE 客户端抽象 | 新建 `lib/sse.ts`（`postSse` / `consumeSse` / `parseSseEvent` / `isAbortError`），提示词优化器与知识问答共用同一套解析；`done` 事件通过回调返回 `'stop'` 提前结束读取，保持原流式行为不变 |
| 事件分发 | `features/qa/lib/api.ts` 把 `sources` / `message` / `rejected` / `error` / `done` 五个事件映射为回调；`sources` 的 data 是 JSON 数组，解析失败降级为空列表，不影响回答渲染 |
| 拒答优先于兜底 | 前端不自行判断"是否该拒答"，完全由后端 `rejected` 事件驱动，避免前后端判定不一致 |
| 来源卡片去重 | 同一篇笔记可能命中多个 chunk，前端按 `url` 聚合只保留最高分片段，避免 4 张卡片指向同一篇笔记 |
| 多轮上下文 | 提交时从消息列表回溯最近一组有效问答（排除拒答/错误轮）作为 `history`，后端据此做检索 query 融合 |
| 知识库规模提示 | 顶栏展示"已索引 20 篇笔记 · 290 个知识片段"（`GET /api/rag/status`）；索引状态在重启后由 `rag-store.json.meta.json` 元数据回填，不再显示为 0 |
| 停止生成 | `AbortController` 中断流式请求，已产出的内容保留；组件卸载时自动中断 |

**入口**：`visitorStats.ts` 的 `PATH_MAP` 加 `/qa`；导航栏加"知识问答"（`BookMarked` 图标）；应用广场首位卡片指向 `/qa`。

**已验证**：`npx tsc --noEmit` 通过；后端 `mvn compile` 通过；`POST /api/rag/index/rebuild` 实测 20 篇 / 290 片段并在 8.3MB store 旁写出 `meta.json`；前端 dev server 代理 `GET /api/rag/status` 返回 `{indexedFiles:20, indexedChunks:290}`。

**待办**：Docker 部署上线（frontend/public/lib/notes 挂载已在 compose 配好）。

### 2.11 浏览器实测记录（2026-09-29，全部通过）

用真实 Chromium 对 `http://localhost:3010/qa` 做了完整验收：

| 场景 | 结果 |
|------|------|
| 空状态 | ✅ 4 个预设问题 chips、顶栏"已索引 20 篇笔记 · 290 个知识片段" |
| 库内流式问答 | ✅ 标题/列表/代码块/引用块正常渲染，`[1][3]` 引用标记，来源卡片（标题/分类/章节/匹配度 46%）可点击 |
| 库外拒答 | ✅ 琥珀色提示框 + "去浏览知识笔记"链接，无来源卡片，检索分数 0.19 < 阈值 0.35 |
| 多轮追问 | ✅ query 融合后命中原笔记（59%），模型如实回答"站内笔记尚未覆盖这部分内容" |

**实测发现并修复的两个 bug（均为真实协议/工程问题，面试可讲）**：

1. **SSE 流式空格丢失**：Spring 的 `ServerSentEvent` 编码是「`data:` 后直接跟原文、不补空格」，而 SSE 规范要求客户端剥掉冒号后的第一个空格。两者叠加后，**恰好只有一个空格的增量**会被解析成空串——token 间的空格被静默吞掉，表现为 markdown 的 `## 标题` 变成 `##标题` 而不再渲染成标题、英文词间空格丢失（`Retrieval-AugmentedGeneration`）。修复：服务端在 data 前统一补一个前导空格（两个 SSE controller 都改了），客户端按规范剥离，拿到原始内容。该 bug 同时影响提示词优化器（老功能），此次一并修复。
2. **Prompt 固定话术被复读**：原来规则 3 写死了"直接回复『该问题超出了本站知识库的覆盖范围』"，模型在**正常回答**里会原样复读这句话。改为"用自己的话如实说明站内笔记尚未覆盖"，追问场景实测回答自然。

**实测发现并修复的第三个问题（已解决，2026-09-29）**：

- **中文 Markdown 强调渲染坑（CommonMark 侧）**：`**检索阶段（在线）**的` 这类写法里，收尾 `**` 前是全角标点 `）`、后跟汉字，不满足 CommonMark 的右邻接（right-flanking）规则，粗体会失效。用 remark-parse 做了最小复现（`a**b（c）**d` → 0 个 strong 节点）。
  - **修复**：引入 `remark-cjk-friendly@2.3.1` 插件（`MarkdownRenderer` 的 remarkPlugins 加上它）。验证：3 个失败用例全部 0→1 个 strong 节点，原本正常的英文强调与 GFM 表格无回归；浏览器实测笔记页 `**名称、描述、参数 Schema（JSON Schema）**随请求` 已正确渲染为粗体。
  - **影响面比预想大**：`frontend/public/lib/notes/` 下多篇笔记都有此写法（如 `01-machine-learning-basics.md` 5 处、`04-agent-function-calling.md` 4 处），此前这些粗体一直在静默失效——属于"顺手修好全站渲染"的收益。

**环境坑位（本机验证时必读）**：
- 本机 `HTTP_PROXY` 指向本地代理，用 curl 探测 localhost 必须加 `--noproxy '*'`，否则会把"端口空闲"误判为"被占用"；
- 若用沙箱化终端（如某些 IDE 终端）启动 `next dev`，构建缓存目录写入可能被文件代理拦截并报 `EEXIST: mkdir .next` 导致页面 500 —— 前端 dev server 请在用户自己的终端启动。

---

## 三、里程碑（3 天上线）

| 天 | 交付 | 验证方式 |
|----|------|---------|
| D1 ✅ | 索引管道：笔记 → 切块 → 向量库；检索 API | curl 验证 top4 命中与相似度分数（已完成：20 篇 / 290 片段） |
| D2 ✅ | QA 链路：SSE 流式 + 引用 + 拒答判定 | API 全通，拒答边界符合预期（已完成，四类场景实测通过） |
| D3 ✅ | 前端 UI + 联调 | 浏览器实测四类场景全部通过（见 2.11），剩余：Docker 部署上线 |
| +0.5 天 | 过面试追问清单；更新 `doc/resume-ai-overview-project.md` | — |

V1.1（上线后按需）：多轮 query 改写、召回片段展示、混合检索（向量 + 关键词）、Grafana 增加问答质量指标。

---

## 四、面试追问准备清单（做完后务必过一遍）

| 追问点 | 准备方向 |
|--------|---------|
| 切块策略 | 为什么按标题切；chunk 大小怎么定（受 embedding 8K/3072 约束 + 语义完整性）；太碎/太粗的取舍 |
| 检索质量 | 准备 1-2 个召回不准的真实案例及排查：换问法命中 → query 改写；相关但排序靠后 → 阈值/排序 |
| 拒答判定 | 怎么区分"库里没有"和"没检索到"；阈值如何标定；误拒/误答权衡 |
| 向量 vs 关键词检索 | 语义匹配 vs 字面匹配；混合检索作为加分认知 |
| 幻觉控制 | 三层防线：只基于召回内容回答 + 引用溯源 + 库外拒答 |
| 为什么不用 QuestionAnswerAdvisor | 需要命中列表做拒答判定与引用；可控性优先 |
| Embedding 选型 | 智谱 Embedding-3 vs DashScope text-embedding-v3/v4 vs 本地 ONNX（bge-small-zh）的对比与取舍 |
| SimpleVectorStore 选型 | 数据量千级、暴力检索毫秒级；选型匹配规模，避免过度设计 |
| SSE 流式 | 为什么不用轮询/WebSocket；断流重连；中文编码问题定位 |
| 维度一致性坑 | embedding dimensions 与向量库 schema 必须一致的真实案例 |
