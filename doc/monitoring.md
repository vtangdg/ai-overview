# 监控：Prometheus + Grafana

> 最后核对：2026-10-03

监控栈在 `docker-compose.yml` 里归属 `monitoring` profile，**默认 `docker compose up` 不启动**（避免日常占资源），按需一条命令拉起。

- Prometheus: v3.8.0
- Grafana: 12.3

## 启动方式

```bash
# 日常：只启动后端（不启动监控）
docker compose up -d

# 需要监控时：一键拉起 Prometheus + Grafana
docker compose --profile monitoring up -d      # 或 cd backend && make docker-compose-monitoring

# 只想看某个服务
docker compose up -d prometheus
```

> ⚠️ **`make docker-compose-monitoring` 不会重新构建后端镜像**。它等价于 `docker compose --profile monitoring up -d`（无 `--build`）。改了后端代码要先 `mvn -pl ai-demo -am package` 再 `docker compose build backend`，否则容器里跑的还是旧代码——指标可能根本没注册，却以为是「监控没生效」。完整流程见 [makefile.md](makefile.md)。

后端跑在**宿主机**（IDEA / mvn）而不是容器时，Prometheus 需要改用 `prometheus/prometheus-local.yml`（目标 `host.docker.internal:8090`），详见 [local-dev.md](local-dev.md) 第四节。

## 业务指标清单

除 Micrometer 默认的 JVM / HTTP 指标（`http_server_requests_seconds_*`、`jvm_*`）外，业务指标分两块。

### RAG 知识问答

| 指标（Prometheus 名称） | 类型 | 含义 |
| --- | --- | --- |
| `ai_rag_questions_total{outcome="answered\|rejected\|error"}` | Counter | 问答请求计数，按结果维度区分（成功流式回答 / 库外拒答 / 异常） |
| `ai_rag_retrieval_seconds` | Timer | 向量检索耗时分布（p50/p95 用 `histogram_quantile` 查询） |
| `ai_rag_ttft_seconds` | Timer | **首字延迟**（TTFT）：从进入处理逻辑到第一个回答增量到达，流式体验的核心感知指标 |
| `ai_rag_sources` | DistributionSummary | 每次问答检索命中的知识片段数（反映 topK 命中质量） |
| `ai_rag_score` | DistributionSummary | 检索命中片段的相似度分数分布，整体下移说明检索质量在漂移 |
| `ai_rag_ratelimited_total` | Counter | 限流触发次数（用于评估 20 次/小时阈值是否合理） |

### 提示词优化器

| 指标（Prometheus 名称） | 类型 | 含义 |
| --- | --- | --- |
| `ai_optimizer_ttft_seconds{model}` | Timer | **首字延迟**：优化器流式响应的核心感知指标（按模型分标签） |
| `ai_optimizer_requests_total{operation,outcome,model}` | Counter | 请求计数，`operation=generate\|optimize`，`outcome=success\|error` |
| `ai_llm_tokens_total{scene,model,type}` | Counter | Token 消耗（与 RAG 共用同一个 meter，靠 `scene` 区分场景） |

### Token 计量（两个场景共用）

`ai_llm_tokens_total` 用标签区分场景：

- `scene="rag-qa"`：RAG 知识问答
- `scene="prompt-optimizer"`：提示词优化器
- `type="prompt" | "completion"`：输入 / 输出分开计
- `model`：实际模型 id（如 `deepseek-flash`）

实现说明：

- 流式链路**不用** `.stream().content()`（该捷径会丢 usage 元数据），改为 `.chatResponse()` + 从流末尾的 usage chunk 读取 prompt/completion tokens；优化器与 RAG 同款做法；
- 请求侧通过 `OpenAiChatOptions.streamUsage(true)` 要求上游返回 usage；`rag.usage-in-stream`（默认 `true`）可关——个别 OpenAI 兼容端点不支持 `stream_options` 参数会 400（**智谱就是**，RAG 切 GLM 时必须置 `false`），代价是没有 token 指标；
- 优化器侧按模型前缀自动门控（`deepseek-*` 开、`glm-*` 关），无需手工配置；
- usage 用 `AtomicBoolean` 防重复累计。

## 配置说明

### 1. 后端

依赖：`spring-boot-starter-actuator` + `micrometer-registry-prometheus`。

配置文件中暴露的端点：

- `/actuator/health`：健康检查
- `/actuator/info`：应用信息
- `/actuator/metrics`：指标信息
- `/actuator/prometheus`：Prometheus 格式的指标

> prod profile 下 Actuator 端点默认可能被限制，`application-prod.yml` 里已显式重新开启。

### 2. Prometheus

`prometheus/prometheus.yml`（容器版）：

- 抓取间隔：15s
- 目标：Prometheus 自身（`localhost:9090`）、后端服务（`backend:8090/actuator/prometheus`）

`prometheus/prometheus-local.yml`（本地版）：目标改为 `host.docker.internal:8090`，抓取间隔 5s。

### 3. Grafana

数据源自动装配在 `grafana/provisioning/datasources/prometheus.yml`。

## Grafana 看板现状与缺口

`grafana/provisioning/dashboards/ai-overview.json`（文件夹 "AI Overview"，标题「AI Overview · 应用与 RAG 业务看板」）共 **9 个面板**：

| 面板 | 查询 |
| --- | --- |
| RAG 问答速率（按结果） | `sum(rate(ai_rag_questions_total[5m])) by (outcome)` |
| RAG 拒答率 | `sum(rate(ai_rag_questions_total{outcome="rejected"}[30m])) / clamp_min(sum(rate(ai_rag_questions_total[30m])), 0.0001)` |
| 检索命中片段数（均值） | `avg(ai_rag_sources_sum / clamp_min(ai_rag_sources_count, 0.0001))` |
| 向量检索耗时 p95 | `histogram_quantile(0.95, sum(rate(ai_rag_retrieval_seconds_bucket[5m])) by (le))` |
| HTTP 请求速率（按 URI / 状态码） | `sum(rate(http_server_requests_seconds_count[5m])) by (uri, status)` |
| 首字延迟（TTFT）p50 / p95 | `histogram_quantile(0.95, sum(rate(ai_rag_ttft_seconds_bucket[5m])) by (le))` |
| Token 消耗速率（按模型 / 类型） | `sum(rate(ai_llm_tokens_total[5m])) by (model, type)` |
| 限流触发（5m） | `sum(increase(ai_rag_ratelimited_total[5m]))` |
| 检索命中分数（均值） | `ai_rag_score_sum / clamp_min(ai_rag_score_count, 0.0001)` |

**两个已知缺口**（指标已上报，只是看板没画）：

1. **没有提示词优化器的专属面板**——`ai_optimizer_ttft_seconds` / `ai_optimizer_requests_total` 在 Prometheus 里能查到，但看板上看不到；
2. **Token 面板会串场景**——该面板只按 `(model, type)` 聚合，RAG 与提示词优化器的 token 会混在同一条线里。要看单场景，在 Explore 里按 `scene` 过滤，或给看板加 `by (scene, model, type)`。

> 「首字延迟」面板目前只查 `ai_rag_ttft_seconds`，不含优化器。想同时看两个应用的首字延迟，需要新增面板或把查询改成两个 target。

## 常用 PromQL

```promql
# 拒答率
sum(rate(ai_rag_questions_total{outcome="rejected"}[30m])) / sum(rate(ai_rag_questions_total[30m]))

# 检索 p95
histogram_quantile(0.95, sum(rate(ai_rag_retrieval_seconds_bucket[5m])) by (le))

# RAG 首 token p95
histogram_quantile(0.95, sum(rate(ai_rag_ttft_seconds_bucket[5m])) by (le))

# 优化器首 token p50 / p95（按模型）
histogram_quantile(0.95, sum(rate(ai_optimizer_ttft_seconds_bucket[5m])) by (le, model))

# 单次 RAG 问答平均输入 token
rate(ai_llm_tokens_total{type="prompt", scene="rag-qa"}[5m]) / rate(ai_rag_questions_total{outcome="answered"}[5m])

# 优化器 token 速率（按输入/输出）
sum(rate(ai_llm_tokens_total{scene="prompt-optimizer"}[5m])) by (type)
```

## 使用说明

### Prometheus

- 浏览器访问 http://localhost:9090
- `Status` → `Targets` 看抓取是否成功（`ai-overview-backend` 应为 `up`）
- `Graph` 页面查询指标

### Grafana

- 浏览器访问 http://localhost:3000（默认 admin/admin，可用 `GF_SECURITY_ADMIN_PASSWORD` 覆盖）
- `Dashboards` → 文件夹 "AI Overview" 看自动装配的看板
- `Explore` 可直接查 Prometheus 指标

### 命令行快速验证

```bash
# 后端是否在暴露业务指标
curl -s http://localhost:8090/actuator/prometheus | grep -E "^ai_optimizer|^ai_llm_tokens|^ai_rag"

# Prometheus 是否抓到了（替换 <job> 为 ai-overview-backend）
curl -s "http://localhost:9090/api/v1/targets" | python3 -c "import json,sys;d=json.load(sys.stdin);[print(t['labels']['job'], t['health'], t.get('lastError','')) for t in d['data']['activeTargets']]"
```

## 常见问题

| 现象 | 排查方向 |
| --- | --- |
| Prometheus 抓取失败 | 后端是否在跑；容器版看 `backend:8090`，本地版看 `host.docker.internal:8090` 是否配错；8090 端口是否有服务监听 |
| Grafana 连不上 Prometheus | `grafana/provisioning/datasources/prometheus.yml` 的 URL 是否为 `http://prometheus:9090`；prometheus 容器是否在运行 |
| 看板无数据 | Prometheus `Targets` 是否 `up`；是否还没产生对应业务流量（Counter/Timer 只在有请求后才出现） |
| 指标里有 RAG 但没有优化器 | 容器是否为新镜像（旧镜像无优化器埋点）；是否还没调用过优化器接口 |
| Token 面板为 0 | `rag.usage-in-stream` 是否被关；当前模型是否支持 `stream_options`（智谱不支持） |

## 预设第三方仪表盘（可选）

- Spring Boot 2.1 Statistics：`10280`
- JVM Micrometer：`4701`
