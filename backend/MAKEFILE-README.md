# Makefile 使用说明

## 概述

本 Makefile 提供了一系列便捷命令，用于管理 AI Overview 项目的后端服务。主要功能包括环境变量配置、Docker Compose 服务管理以及镜像清理等。

## 前置条件

- 已安装 Docker 和 Docker Compose v2+
- 已克隆项目代码库
- 当前工作目录(根据自己的项目路径)：`/workplace/mysystem/ai-overview/backend`

## 环境变量配置

### 1. 初始化环境文件

```bash
make env-init
```

- **功能**：创建仓库根目录 `../.env` 文件并设置默认值（与 docker-compose.yml 同级，compose 原生可读）
- **使用场景**：首次使用项目时初始化环境配置
- **输出示例**：
  ```
  创建 ../.env 文件...
  ✅ 请编辑仓库根目录的 .env 文件设置你的 DEEPSEEK_API_KEY 和 GLM_API_KEY
  ```
  或
  ```
  ✅ .env 文件已存在
  ```

### 2. 检查 API Key 配置

```bash
make check-env
```

- **功能**：验证仓库根目录 `.env` 中的 `DEEPSEEK_API_KEY` 和 `GLM_API_KEY` 是否正确设置
- **使用场景**：在启动服务前确保 API Key 已配置
- **输出示例**：
  ```
  ✅ 环境变量检查通过
  ```
  或
  ```
  ❌ 错误: 请在仓库根目录 .env 中设置 DEEPSEEK_API_KEY
  💡 运行: make env-init 然后编辑 ../.env 文件
  ```
  或
  ```
  ❌ 错误: 请在仓库根目录 .env 中设置 GLM_API_KEY
  💡 运行: make env-init 然后编辑 ../.env 文件
  ```

## Docker Compose 服务管理

### 3. 停止所有服务

```bash
make docker-compose-stop
```

- **功能**：停止并移除所有服务容器（保留网络和卷）
- **使用场景**：需要临时停止服务时
- **输出示例**：
  ```
  === 停止所有服务 ===
  ✅ 所有服务已停止
  ```

### 4. 清理容器和网络（保留数据卷）

```bash
make docker-compose-clean
```

- **功能**：停止并移除容器和网络，保留数据卷
- **使用场景**：需要清理运行环境但保留数据时
- **输出示例**：
  ```
  === 清理容器和网络（保留卷） ===
  ✅ 容器和网络已清理，卷已保留
  ```

### 5. 完全清理所有资源（包括数据卷）

```bash
make docker-compose-clean-full
```

- **功能**：停止并移除所有容器、网络和数据卷
- **使用场景**：需要完全重置开发环境时
- **注意**：此操作会删除所有持久化数据（数据库、监控数据等）
- **输出示例**：
  ```
  === 完全清理所有资源（包括卷） ===
  ✅ 所有资源（包括卷）已清理
  ```

### 6. 启动服务（不重新构建）

```bash
make docker-compose-up
```

- **功能**：启动所有服务（使用已有镜像，不重新构建）
- **使用场景**：代码未修改，仅需重启服务时
- **输出示例**：
  ```
  === 启动服务 ===
  ✅ 所有服务已启动
  📊 查看日志: docker compose -f ../docker-compose.yml logs -f
  🌐 后端访问地址: http://localhost:8090
  📈 Prometheus访问地址: http://localhost:9090
  📊 Grafana访问地址: http://localhost:3000
  ```

### 7. 构建并启动服务（一步完成）

```bash
make docker-compose-up-build
```

- **功能**：智能构建有变化的镜像并启动所有服务
- **使用场景**：修改代码后需要重新构建并启动服务时（推荐日常使用）
- **特点**：仅重新构建有变化的服务，提高效率
- **输出示例**：
  ```
  === 构建并启动服务（一步完成） ===
  ✅ 所有服务已构建并启动
  📊 查看日志: docker compose -f ../docker-compose.yml logs -f
  🌐 后端访问地址: http://localhost:8090
  📈 Prometheus访问地址: http://localhost:9090
  📊 Grafana访问地址: http://localhost:3000
  ```

## 监控与维护

### 8. 查看服务日志

```bash
make docker-compose-logs
```

- **功能**：交互式查看服务日志，支持查看指定服务或所有服务
- **使用场景**：调试服务问题或监控服务运行状态
- **交互示例**：
  ```
  === 查看服务日志 ===
  请输入要查看的服务名称（留空查看所有）: backend
  ```

### 9. 查看容器状态

```bash
make docker-compose-status
```

- **功能**：查看所有服务容器的运行状态
- **使用场景**：快速检查服务是否正常运行
- **输出示例**：
  ```
  === 容器状态 ===
  NAME                     COMMAND                  SERVICE             STATUS              PORTS
  ai-overview-backend-1    "java -jar /app/ai-d…"   backend             running             0.0.0.0:8090->8090/tcp
  ai-overview-grafana-1    "/run.sh"                grafana             running             0.0.0.0:3000->3000/tcp
  ai-overview-prometheus-1 "/bin/prometheus --c…"   prometheus          running             0.0.0.0:9090->9090/tcp
  ```

### 10. 清理悬空 Docker 镜像

```bash
make docker-clean-images-dangling
```

- **功能**：清理无标签且未被任何容器使用的镜像（构建过程中产生的中间镜像）
- **使用场景**：释放磁盘空间，不影响正在运行的服务
- **输出示例**：
  ```
  === 清理悬空镜像（无标签且未使用） ===
  ✅ 悬空镜像已清理
  ```

### 11. 清理所有未使用的 Docker 镜像

```bash
make docker-clean-images-unused
```

- **功能**：清理所有未被任何容器使用的镜像（包括有标签但未使用的镜像）
- **使用场景**：需要更多磁盘空间时
- **输出示例**：
  ```
  === 清理所有未使用的镜像（不影响容器和卷） ===
  ✅ 未使用的镜像已清理
  ```

## 常用工作流示例

### 1. 首次使用项目

```bash
make env-init
# 编辑仓库根目录的 .env 文件设置 DEEPSEEK_API_KEY
make check-env
make docker-compose-up-build
```

### 2. 日常开发流程

```bash
# 修改代码后
git add .
git commit -m "修改说明"
make docker-compose-up-build  # 智能构建并启动
make docker-compose-status    # 检查服务状态
make docker-compose-logs      # 查看日志
```

### 3. 清理无用镜像

```bash
# 安全清理（仅清理悬空镜像）
make docker-clean-images-dangling

# 彻底清理（清理所有未使用镜像）
make docker-clean-images-unused
```

### 4. 重置开发环境

```bash
# 保留数据卷的重置
make docker-compose-clean
make docker-compose-up-build

# 完全重置（包括数据）
make docker-compose-clean-full
make docker-compose-up-build
```

## 注意事项

1. **API Key 安全**：请妥善保管你的 DEEPSEEK_API_KEY，不要泄露到代码仓库中
2. **数据卷清理**：`docker-compose-clean-full` 会删除所有持久化数据，请谨慎使用
3. **镜像选择**：`docker-compose-up-build` 仅重新构建有变化的服务，效率更高
4. **日志查看**：按 `Ctrl+C` 可退出日志查看模式
5. **默认配置**：Docker Compose 文件默认使用 `../docker-compose.yml`

## 命令列表

| 命令 | 功能描述 |
|------|----------|
| `env-init` | 初始化环境文件 |
| `check-env` | 检查 API Key 配置 |
| `docker-compose-stop` | 停止所有服务 |
| `docker-compose-clean` | 清理容器和网络（保留卷） |
| `docker-compose-clean-full` | 完全清理所有资源（包括卷） |
| `docker-compose-up` | 启动服务（不重新构建） |
| `docker-compose-up-build` | 构建并启动服务（一步完成） |
| `docker-compose-logs` | 查看服务日志 |
| `docker-compose-status` | 查看容器状态 |
| `docker-clean-images-dangling` | 清理悬空镜像 |
| `docker-clean-images-unused` | 清理所有未使用镜像 |