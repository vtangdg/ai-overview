# TODO

> 最后整理：2026-10-03

## 安全

- [ ] Prometheus 认证（监控栈已启用：`/actuator/prometheus` 与 Grafana（默认 admin/admin，用 GF_SECURITY_ADMIN_PASSWORD 覆盖）目前均无强认证，公网部署前需处理）

## 监控

- [ ] Grafana 看板补提示词优化器面板（`ai_optimizer_ttft_seconds`、`ai_optimizer_requests_total` 指标已上报但看板上没有）
- [ ] 「Token 消耗速率」面板改为按 `(scene, model, type)` 聚合——现在只按 `(model, type)`，RAG 与提示词优化器的 token 混在一条线上

## 工程清理

- [ ] `start-dev.sh` 已失效（依赖被注释的 `docker-compose-local.yml`、不存在的 `./mvnw` 与 `make docker-run`）：修好或直接删掉，目前状态见 [doc/local-dev.md](doc/local-dev.md) 第五节
- [ ] `docker-compose-local.yml` 里的 Prometheus / Grafana 服务被整段注释，配套的 `prometheus-local.yml` 形同虚设：要么恢复，要么删掉这两个文件，只保留 `docker-compose.yml` 的 `monitoring` profile
- [ ] 前端死代码：`features/prompt-optimizer/lib/templates.ts` 的 `modelOptions`/`availableModels`、`lib/api.ts` 的 `getAvailableModels()` 无任何组件引用
- [ ] 或者反过来：把模型选择真正做出来（前端下拉框 + 接后端 `/api/prompt-optimizer/models`），让「按场景配模型」在界面上也能切

## 功能

- [ ] 概念解释器跟随场景级模型配置（目前 `ConceptExplainerServiceImpl` 直接注入 `ChatClient.Builder`，`app.ai.*` 改不到它），见 [doc/model-config.md](doc/model-config.md) 第二节
