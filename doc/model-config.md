# AI 模型配置

> 最后核对：2026-10-03（对应当前代码：`ChatModelStrategyFactory` / `GlmStrategy` / `DeepSeekThinkingModeConfig`）

后端有**两个供应商**、**三个使用模型的应用**。本文说明怎么切换、怎么关思考模式，以及几条踩过的坑。

## 一、供应商与端点

| 供应商 | 用途 | 端点 | 配置前缀 |
| --- | --- | --- | --- |
| DeepSeek | 对话（默认） | `https://api.deepseek.com` | `spring.ai.openai.*` |
| 智谱 GLM | 对话（可选）+ Embedding（必用） | `https://open.bigmodel.cn/api/paas/v4` | `spring.ai.glm.*`（对话）、`rag.embedding-*`（向量） |

注意两点：

- **Embedding 只能走智谱**。DeepSeek 不提供 embedding 接口，而 Spring AI 自动装配的 `OpenAiEmbeddingModel` 会跟着 `spring.ai.openai.*` 指向 DeepSeek，所以 `RagConfig` 里手动构建了一个指向智谱的 `OpenAiApi`（仅用于 `embedding-3`）。
- **RAG 的向量索引依赖 `GLM_API_KEY`**。没有智谱 key 时索引无法构建/查询。

## 二、三个应用用哪个模型

| 应用 | 配置项 | 环境变量覆盖 | 默认值 |
| --- | --- | --- | --- |
| 提示词优化器 | `app.ai.prompt-optimizer-model` | `AI_MODEL_PROMPT_OPTIMIZER` | `deepseek-flash` |
| RAG 知识问答（生成） | `app.ai.rag-qa-model` | `AI_MODEL_RAG_QA` | `deepseek-flash` |
| 概念解释器 | 无场景配置，直接使用 `spring.ai.openai.chat.options.model` | 改 yml 或同名环境变量 | `deepseek-flash` |

> 概念解释器（`ConceptExplainerServiceImpl`）不走策略工厂、也不传 per-call 模型，`app.ai.*` 的改动**不影响它**。若要让它跟随场景配置，得在服务里加一处 `@Value("${app.ai.xxx}")` + `.options(OpenAiChatOptions.builder().model(...).build())`。

### 怎么切（不用改代码）

在仓库根目录 `.env` 里加环境变量即可：

```bash
# 提示词优化器用免费的 GLM，RAG 问答继续用 DeepSeek
AI_MODEL_PROMPT_OPTIMIZER=glm-4.7-flash
AI_MODEL_RAG_QA=deepseek-flash
```

不设置就走默认值。改完重启后端生效。

### 解析优先级

```
请求体显式传的 model  >  场景配置（app.ai.*）  >  DeepSeek 默认模型
```

前端目前**不传 model**，所以实际生效的是场景配置。请求体里的 `model` 字段值可以是：

- 具体模型 id：`deepseek-flash` / `deepseek-chat` / `glm-4.7-flash`
- 历史别名：`deepseek` → DeepSeek 默认模型；`glm` → 智谱默认模型（`ChatModelStrategyFactory.normalizeModelId` 负责归一）

### 供应商路由规则

`ChatModelStrategyFactory.getStrategyForModel(modelId)` 按模型 id **前缀**选供应商：

- `glm*` → 智谱真实客户端（`GlmStrategy` 用 `OpenAiApi.builder()` 独立构建，`completionsPath` 覆盖为 `/chat/completions`）
- 其余（含 `deepseek-*`）→ DeepSeek

**目标策略不可用时静默回退 DeepSeek 并打 WARN 日志**（典型场景：没配 `GLM_API_KEY` 却选了 `glm-4.7-flash`）。排查「我明明选了 GLM 怎么没变」时先看这行日志。

> 补充：智谱 `base-url` 已包含 `/api/paas/v4`，所以 chat 路径必须显式覆盖为 `/chat/completions`，否则默认的 `/v1/chat/completions` 会打到不存在的路径。

## 三、思考模式（DeepSeek V4）

### 背景

`deepseek-flash`（V4.1-Flash）**默认开启思考模式**，且 `effort` 默认 `high`：每次请求先内部生成完整思维链（`reasoning_content`），思考完才开始吐正文。对提示词生成、RAG 问答这类轻任务纯属白等。

实测（2026-10-03，同一提示词、同一网络）：

| 配置 | 首字延迟 TTFT |
| --- | --- |
| 思考模式开启 | ≈ 11.3 s |
| 思考模式关闭 | ≈ 1.0 s |

### 怎么关

官方参数是请求体字段 `{"thinking": {"type": "disabled"}}`。Spring AI 1.0.3 的 `OpenAiChatOptions` **没有这个字段**（`reasoningEffort` 只能调思考强度，关不掉），所以由 `DeepSeekThinkingModeConfig` 在 **Jackson 序列化层**注入：

- 通过 `Jackson2ObjectMapperBuilderCustomizer` + `BeanSerializerModifier` 包装 `OpenAiApi.ChatCompletionRequest` 的序列化，转成 tree 后补上 `thinking` 字段再写出；
- 只在 `model` 以 `deepseek` 开头、且请求体里没有 `thinking` 时注入，**不会把这个私有参数发给智谱**；
- 总开关：`application.yml` 里的 `deepseek.thinking-disabled`（默认 `true`）。改成 `false` 即恢复默认的思考模式。

### ⚠️ 踩坑记录：不要在 HTTP 客户端层改写请求体

第一版实现是挂 `RestClientCustomizer` / `WebClientCustomizer`，在出站请求上改写 body 字节。结果是 **DeepSeek 网关直接返回 401**（授权头本身正确，改写后的请求形态被网关拒收），隔离测试确认：过滤器关闭 → 200，开启 → 401。

结论：**注入要放在序列化层，不要碰传输层**。序列化层方案不改变请求形态，也就不存在 Content-Length / chunked 编码这类连带问题。

### 备选方案（暂不采用）

新版 Spring AI 提供官方 `spring-ai-starter-model-deepseek`，支持 `DeepSeekChatOptions.thinking(Thinking.DISABLED)` 与配置项 `spring.ai.deepseek.chat.thinking.type: disabled`。但该版本绑定 Spring Boot 4 迁移，成本高于收益，暂不升级。**将来若升级 Spring AI，可删掉 `DeepSeekThinkingModeConfig` 换成官方配置项。**

## 四、把 RAG 切到 GLM 时要额外做一件事

智谱端点**不支持** `stream_options.include_usage`，而 RAG 流式默认要求上游返回 usage 用于 token 计量。切换方式：

```yaml
rag:
  usage-in-stream: false   # 默认 true
```

代价是 RAG 侧的 `ai_llm_tokens_total` 指标不再有数据。提示词优化器已按模型前缀自动门控（`deepseek-*` 开、`glm-*` 关），无需手工配置。

## 五、相关代码位置

| 文件 | 职责 |
| --- | --- |
| `config/DeepSeekThinkingModeConfig.java` | 思考模式注入（序列化层）与开关 |
| `service/strategy/ChatModelStrategyFactory.java` | 模型 id 归一 + 供应商路由 + 不可用回退 |
| `service/strategy/impl/GlmStrategy.java` | 智谱真实客户端（独立构建 `OpenAiChatModel`） |
| `service/strategy/impl/DeepSeekStrategy.java` | DeepSeek 客户端（复用自动装配的 `ChatClient.Builder`） |
| `config/RagConfig.java` | 智谱 Embedding 客户端（`embedding-3`） |
| `service/impl/PromptOptimizerServiceImpl.java` | 场景模型解析、per-call options、监控埋点 |
| `service/rag/RagQaService.java` | RAG 场景模型 + token 计量 |
| `ai-demo/src/main/resources/application.yml` | `spring.ai.*` / `app.ai.*` / `deepseek.*` 配置 |

## 六、怎么验证改对了

```bash
# 1. 看当前生效的模型与场景配置
curl -s http://localhost:8090/api/prompt-optimizer/models

# 2. 打一次流式生成，看首字延迟（非思考模式应在 1~2s 量级）
curl -N -X POST http://localhost:8090/api/prompt-optimizer/generate-stream \
  -H "Content-Type: application/json" \
  -d '{"task":"写一句不超过20字的问候"}' \
  -w "\nTTFT: %{time_starttransfer}s\n"

# 3. 看指标（确认埋点生效、模型标签正确）
curl -s http://localhost:8090/actuator/prometheus | grep -E "^ai_optimizer|^ai_llm_tokens"
```

想确认请求体里到底有没有 `thinking` 字段，可把 `spring.ai.openai.base-url` 临时指向本地 mock 服务器，抓取入站请求体；或打开 `DeepSeekThinkingModeConfig` 的 DEBUG 日志。

## 七、已知限制

- **前端没有模型选择开关**。`frontend/src/features/prompt-optimizer/lib/templates.ts` 里的 `modelOptions` / `availableModels`，以及 `api.ts` 的 `getAvailableModels()` 是**死代码**（无组件引用）；界面上切换模型需要先把这几个文件复活并接上 `/api/prompt-optimizer/models`。
- **概念解释器没有独立模型配置**，固定使用 `spring.ai.openai.chat.options.model`（见第二节说明）。
- 智谱 `glm-4.7-flash` 是免费档位，质量低于 DeepSeek，适合提示词优化这类对质量不敏感的场景。
