# Prometheus 和 Grafana 监控配置

本项目集成了 Prometheus 和 Grafana，用于监控后端服务的运行状态。

## 版本信息

- Prometheus: v3.8.0
- Grafana: 12.3

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