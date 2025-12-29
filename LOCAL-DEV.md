# 本地开发指南

本项目提供了专门的本地开发配置，以便在本地环境中进行开发和调试，同时不影响生产环境配置。

## 文件说明

- `docker-compose-local.yml`: 本地开发专用的Docker Compose配置，只包含监控服务(Prometheus和Grafana)
- `prometheus/prometheus-local.yml`: 本地开发专用的Prometheus配置，使用`host.docker.internal`访问宿主机上的后端服务
- `start-dev.sh`: 本地开发环境启动脚本

## 快速开始

### 方式一：使用启动脚本（推荐）

```bash
# 在项目根目录执行
./start-dev.sh
```

### 方式二：手动启动

1. 启动监控服务：
   ```bash
   docker compose -f docker-compose-local.yml up -d
   ```

2. 启动后端服务（选择一种方式）：
   
   **方式A：本地运行**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   
   **方式B：Docker运行**
   ```bash
   cd backend
   make docker-run
   ```

3. 启动前端服务：
   ```bash
   cd frontend
   pnpm install
   pnpm run dev
   ```

## 访问地址

- 前端应用: http://localhost:3000
- 后端API: http://localhost:8090
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (用户名/密码: admin/admin)

## 环境变量

在启动后端服务前，请确保设置以下环境变量：

```bash
export DEEPSEEK_API_KEY=your_api_key_here
```

或者在backend目录下创建.env文件：

```
DEEPSEEK_API_KEY=your_api_key_here
```

## 停止服务

```bash
# 停止监控服务
docker compose -f docker-compose-local.yml down

# 停止后端服务（如果在本地运行）
# Ctrl+C 或 kill 进程

# 停止前端服务（如果在本地运行）
# Ctrl+C 或 kill 进程
```

## 注意事项

1. 本地开发配置使用`host.docker.internal`来访问宿主机上的服务，这只在Docker Desktop环境中有效
2. 如果您使用的是Linux系统，可能需要使用`--network="host"`模式或修改配置
3. 确保本地后端服务在8090端口运行
4. 确保没有其他服务占用3000端口（Grafana和前端默认都使用3000端口）

## 生产环境部署

生产环境请使用原始的`docker-compose.yml`文件，它包含了完整的后端服务配置。