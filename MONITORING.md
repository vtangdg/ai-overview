# Prometheus 和 Grafana 监控配置

本项目集成了 Prometheus 和 Grafana，用于监控后端服务的运行状态。监控栈在 `docker-compose.yml` 中归属于 `monitoring` profile，**默认 `docker compose up` 不启动**（避免日常占用资源），按需一条命令拉起。

## 版本信息

- Prometheus: v3.8.0
- Grafana: 12.3

## 启动方式

```bash
# 日常：只启动后端（不启动监控）
docker compose up -d

# 需要监控时：一键拉起 Prometheus + Grafana
docker compose --profile monitoring up -d

# 只想看某个服务
docker compose up -d prometheus
```

## 自定义业务指标（RAG + LLM）

除 Micrometer 默认的 JVM / HTTP 指标外，RAG 链路额外暴露以下业务指标：

| 指标（Prometheus 名称） | 类型 | 含义 |
| --- | --- | --- |
| `ai_rag_questions_total{outcome="answered\|rejected\|error"}` | Counter | 问答请求计数，按结果维度区分（成功流式回答 / 库外拒答 / 异常） |
| `ai_rag_retrieval_seconds` | Timer | 向量检索耗时分布（p50/p95 可用 `histogram_quantile` 查询） |
| `ai_rag_ttft_seconds` | Timer | **首字延迟**（TTFT）：从进入处理逻辑到第一个回答增量到达，流式体验的核心感知指标 |
| `ai_rag_sources` | DistributionSummary | 每次问答检索命中的知识片段数（反映 topK 命中质量） |
| `ai_rag_score` | DistributionSummary | 检索命中片段的相似度分数分布，整体下移说明检索质量在漂移 |
| `ai_rag_ratelimited_total` | Counter | 限流触发次数（用于评估 20 次/小时阈值是否合理） |
| `ai_llm_tokens_total{scene="rag-qa", model, type="prompt\|completion"}` | Counter | **Token 消耗**，输入输出分开计，按模型与场景打 tag，Grafana 中乘单价即成本面板 |

Token 计量实现说明：
- 流式链路不用 `.stream().content()`（该捷径会丢掉 usage 元数据），改为 `.stream().chatResponse()`，从流末尾的 usage chunk 读取 prompt/completion tokens；
- 请求侧通过 `OpenAiChatOptions.streamUsage(true)` 要求上游返回 usage（`rag.usage-in-stream` 配置项可关——个别 OpenAI 兼容端点不支持 `stream_options` 参数时会 400，此时关闭该项，代价是没有 token 指标）；
- usage 用 `AtomicBoolean` 防重复累计。

已随仓库提供自动装配的 Grafana 看板（`grafana/provisioning/dashboards/ai-overview.json`，文件夹 "AI Overview"），9 个面板：问答速率（按结果）、拒答率、命中片段数、检索耗时 p50/p95、HTTP 请求速率、**首字延迟 p50/p95、Token 消耗速率、限流触发、命中分数均值**。

常用 PromQL：
- 拒答率：`sum(rate(ai_rag_questions_total{outcome="rejected"}[30m])) / sum(rate(ai_rag_questions_total[30m]))`
- 检索 p95：`histogram_quantile(0.95, sum(rate(ai_rag_retrieval_seconds_bucket[5m])) by (le))`
- 首 token p95：`histogram_quantile(0.95, sum(rate(ai_rag_ttft_seconds_bucket[5m])) by (le))`
- 单次问答平均输入 token：`rate(ai_llm_tokens_total{type="prompt"}[5m]) / rate(ai_rag_questions_total{outcome="answered"}[5m])`

## 配置说明

### 1. 后端配置

后端服务已添加以下依赖：
- `spring-boot-starter-actuator`：提供监控端点
- `micrometer-registry-prometheus`：将指标导出为 Prometheus 格式

配置文件中已启用 Actuator 并暴露了以下端点：
- `/actuator/health`：健康检查
- `/actuator/info`：应用信息
- `/actuator/metrics`：指标信息
- `/actuator/prometheus`：Prometheus 格式的指标

### 2. Prometheus 配置

Prometheus 配置文件位于 `prometheus/prometheus.yml`，主要配置了：
- 抓取间隔：15秒
- 监控目标：
  - Prometheus 自身（localhost:9090）
  - 后端服务（backend:8090/actuator/prometheus）

### 3. Grafana 配置

Grafana 已配置自动发现 Prometheus 数据源，配置文件位于 `grafana/provisioning/datasources/prometheus.yml`。

## 运行方式

### 使用 Docker Compose 运行

1. 在项目根目录下执行以下命令：
   ```bash
   docker compose up -d
   ```

2. 访问以下地址：
   - 后端服务：http://localhost:8090
   - Prometheus：http://localhost:9090
   - Grafana：http://localhost:3000（默认用户名/密码：admin/admin）

### 手动运行

1. 运行后端服务
2. 运行 Prometheus：
   ```bash
   prometheus --config.file=prometheus/prometheus.yml
   ```
3. 运行 Grafana：
   ```bash
   grafana-server
   ```

## 使用说明

### 1. 访问 Prometheus

- 在浏览器中访问 http://localhost:9090
- 点击 "Status" -> "Targets"，查看是否成功抓取后端指标
- 在 "Graph" 页面可以查询和可视化指标

### 2. 访问 Grafana

- 在浏览器中访问 http://localhost:3000
- 使用默认用户名/密码登录（admin/admin）
- 点击 "Explore" 可以直接查询 Prometheus 指标
- 点击 "Dashboards" -> "Import" 可以导入预设的仪表盘模板

## 预设仪表盘

推荐导入以下 Grafana 仪表盘模板：
- Spring Boot 2.1 Statistics：10280
- JVM Micrometer：4701

## 常见问题

1. **Prometheus 无法抓取后端指标**
   - 检查后端服务是否正常运行
   - 检查 Prometheus 配置中的目标地址是否正确
   - 检查后端配置是否正确暴露了 Prometheus 端点

2. **Grafana 无法连接到 Prometheus**
   - 检查 Prometheus 服务是否正常运行
   - 检查 Grafana 数据源配置中的 URL 是否正确

3. **仪表盘显示无数据**
   - 检查 Prometheus 是否成功抓取到指标
   - 检查仪表盘查询语句是否正确