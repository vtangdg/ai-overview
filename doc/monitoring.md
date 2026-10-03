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

后端跑在**宿主机**（IDEA / mvn）而不是容器时，容器里的 Prometheus 抓不到它——抓取目标写死为 `backend:8090`，指的是容器网络内的后端。详见 [local-dev.md](local-dev.md) 第四节。

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

> Timer 的**直方图桶**默认不导出，看板里的 p95 查询会静默空白——`management.metrics.distribution` 已显式开启，详见下节「Grafana 看板」。

> prod profile 下 Actuator 端点默认可能被限制，`application-prod.yml` 里已显式重新开启。

### 2. Prometheus

`prometheus/prometheus.yml`：

- 抓取间隔：15s
- 目标：Prometheus 自身（`localhost:9090`）、后端服务（`backend:8090/actuator/prometheus`）

> 目标里的 `backend` 是容器网络内的服务名。后端跑在宿主机时抓不到，见 [local-dev.md](local-dev.md) 第四节。

### 3. Grafana

数据源自动装配在 `grafana/provisioning/datasources/prometheus.yml`。

## Grafana 看板

`grafana/provisioning/dashboards/` 下的 JSON 由 provisioning 自动装配（`provider.yml` 扫该目录），全部归入文件夹 **AI Overview**。当前两个：

| 文件 | 标题 | 面板数 | 覆盖范围 |
| --- | --- | --- | --- |
| `ai-overview.json` | AI Overview · 应用与 RAG 业务看板 | 9 | 平台面（HTTP / Token）+ RAG 知识问答 |
| `ai-overview-optimizer.json` | AI Overview · 提示词优化器看板 | 7 | 提示词优化器专属 |

### 应用与 RAG 业务看板（`ai-overview.json`）

| 面板 | 查询 |
| --- | --- |
| RAG 问答速率（按结果） | `sum(rate(ai_rag_questions_total[5m])) by (outcome)` |
| RAG 拒答率 | `sum(rate(ai_rag_questions_total{outcome="rejected"}[30m])) / clamp_min(sum(rate(ai_rag_questions_total[30m])), 0.0001)` |
| 检索命中片段数（均值） | `avg(ai_rag_sources_sum / clamp_min(ai_rag_sources_count, 0.0001))` |
| 向量检索耗时 p95 | `histogram_quantile(0.95, sum(rate(ai_rag_retrieval_seconds_bucket[5m])) by (le))` |
| HTTP 请求速率（按 URI / 状态码） | `sum(rate(http_server_requests_seconds_count[5m])) by (uri, status)` |
| RAG 首字延迟（TTFT）p50 / p95 | `histogram_quantile(0.95, sum(rate(ai_rag_ttft_seconds_bucket[5m])) by (le))` |
| Token 消耗速率（按场景 / 模型 / 类型） | `sum(rate(ai_llm_tokens_total[5m])) by (scene, model, type)` |
| 限流触发（5m） | `sum(increase(ai_rag_ratelimited_total[5m]))` |
| 检索命中分数（均值） | `ai_rag_score_sum / clamp_min(ai_rag_score_count, 0.0001)` |

### 提示词优化器看板（`ai-overview-optimizer.json`）

| 面板 | 查询 |
| --- | --- |
| 优化器请求速率（按操作 / 结果） | `sum(rate(ai_optimizer_requests_total[5m])) by (operation, outcome)` |
| 成功率（30m） | `sum(rate(ai_optimizer_requests_total{outcome="success"}[30m])) / clamp_min(sum(rate(ai_optimizer_requests_total[30m])), 0.0001)` |
| 错误请求（5m） | `sum(increase(ai_optimizer_requests_total{outcome="error"}[5m]))` |
| 首字延迟（TTFT）p50 / p95 | `histogram_quantile(0.95, sum(rate(ai_optimizer_ttft_seconds_bucket[5m])) by (le))` |
| 请求量（按模型） | `sum(rate(ai_optimizer_requests_total[5m])) by (model)` |
| Token 消耗速率（输入 / 输出） | `sum(rate(ai_llm_tokens_total{scene="prompt-optimizer"}[5m])) by (type)` |
| 单次请求 Token 强度（输入 / 输出） | `sum(increase(ai_llm_tokens_total{scene="prompt-optimizer", type="prompt"}[5m])) / clamp_min(sum(increase(ai_optimizer_requests_total{outcome="success"}[5m])), 0.0001)` |

> 「首字延迟」面板最值得盯：思考模式一旦被打开（或换回会导致思考开启的模型），TTFT 会从 ~1s 跳到 10s 量级。历史实测见 [model-config.md](model-config.md)。

### ⚠️ Timer 直方图必须显式开启，否则 p95 面板永远空白

Micrometer 的 Timer 默认**只上报** `_count` / `_sum` / `_max`，**不上报** `_bucket`。而 `histogram_quantile()` 必须吃 `_bucket` 序列（靠 `le` 标签分桶）——所以不开直方图时，看板上所有 `xxx_bucket` 查询会**静默返回空**（不报错、不提示，只是三条线都画不出来），极易被误判成「监控没生效」。

`application.yml` 里已按 meter 名逐个开启（与代码里 `meterRegistry.timer("xxx")` 的字符串一致）：

```yaml
management:
  metrics:
    distribution:
      percentiles-histogram:
        ai.optimizer.ttft: true
        ai.rag.retrieval: true
        ai.rag.ttft: true
      minimum-expected-value:      # 收敛桶边界，避免默认 1ms~30s 全量桶白涨序列数
        ai.optimizer.ttft: 100ms
        ai.rag.retrieval: 10ms
        ai.rag.ttft: 100ms
      maximum-expected-value:
        ai.optimizer.ttft: 60s
        ai.rag.retrieval: 10s
        ai.rag.ttft: 60s
```

一条命令验证桶有没有出来（有输出即正常）：

```bash
curl -s http://localhost:8090/actuator/prometheus | grep -c "_bucket"
```

**两个容易误判的点**：

1. **重启后刚开始一定是 0。** Micrometer 的滑动窗口直方图在「当前窗口内还没有任何观测」时不上报桶，所以后端刚起来、还没打过一次优化器/RAG 请求时，`_bucket` 计数就是 0；发一次请求立刻就有 45 条桶。别拿刚启动的 0 当成配置没生效。
2. **桶数会随观测增长。** `_bucket` 是累积计数，Prometheus 侧最早几十分钟内 `rate()` 可能还是 0（首个样本从「无序列」跳到 1，不算增长），`histogram_quantile` 会返回 `NaN`；攒到第 2 次以上请求就正常了。

实测（2026-10-03，`ai.optimizer.ttft`，deepseek-flash 关思考）：单次请求后导出 45 条桶，边界 `0.1s → 60s`；两次请求后 `histogram_quantile` 输出 p95≈0.80s / p50≈0.76s。

> Counter / DistributionSummary（`ai_rag_sources`、`ai_rag_score`）用 `_sum / _count` 求均值，**不需要**桶，与本节无关。

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

# 优化器成功率
sum(rate(ai_optimizer_requests_total{outcome="success"}[30m])) / clamp_min(sum(rate(ai_optimizer_requests_total[30m])), 0.0001)

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
| **p95 / p50 面板空白，但同页的速率/计数面板有数** | Timer 直方图桶没开——`curl -s localhost:8090/actuator/prometheus \| grep -c "_bucket"` 返回 0 就是它；对照本节「Timer 直方图必须显式开启」补 `management.metrics.distribution.percentiles-histogram` 后**重建镜像**（改的是 jar 内配置，`docker compose restart` 不生效） |
| 指标里有 RAG 但没有优化器 | 容器是否为新镜像（旧镜像无优化器埋点）；是否还没调用过优化器接口 |
| Token 面板为 0 | `rag.usage-in-stream` 是否被关；当前模型是否支持 `stream_options`（智谱不支持） |

## 预设第三方仪表盘（可选）

- Spring Boot 2.1 Statistics：`10280`
- JVM Micrometer：`4701`
