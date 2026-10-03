# backend/Makefile 使用说明

> 最后核对：2026-10-03。Makefile 位于 `backend/`（仓库根目录没有 Makefile），所有命令都要先 `cd backend`。

## 前置条件

- Docker + Docker Compose v2+
- 仓库根目录有 `.env`（`make env-init` 可生成），Makefile 通过 `include ../.env` 读取

## 命令一览

| 命令 | 功能 |
| --- | --- |
| `make env-init` | 创建仓库根目录 `../.env`（已存在则跳过） |
| `make check-env` | 校验 `DEEPSEEK_API_KEY` / `GLM_API_KEY` 已配置（占位值会直接报错退出） |
| `make docker-compose-up` | 启动服务（**用现有镜像**，不重新构建） |
| `make docker-compose-up-build` | 构建镜像并启动（默认 profile，只含 backend） |
| `make docker-compose-monitoring` | 启动监控栈（Prometheus + Grafana，`monitoring` profile） |
| `make docker-compose-stop` | 停止并移除所有服务容器（保留网络和卷） |
| `make docker-compose-clean` | 清理容器与网络，保留数据卷 |
| `make docker-compose-clean-full` | 完全清理（含数据卷，**会删数据**） |
| `make docker-compose-logs` | 交互式看日志（可指定服务名，留空看全部） |
| `make docker-compose-status` | 查看容器状态 |
| `make docker-clean-images-dangling` | 清理悬空镜像（无标签且未被使用） |
| `make docker-clean-images-unused` | 清理所有未被容器使用的镜像 |

## ⭐ 代码改动后的正确流程（最容易踩的坑）

`make docker-compose-monitoring` 执行的是 `docker compose --profile monitoring up -d`——**没有 `--build`**，它只复用现有镜像。改了后端代码后跑它，容器里跑的仍然是旧 jar。

而且 `backend/Dockerfile` 只做一件事：

```dockerfile
COPY ai-demo/target/backend-ai-demo-0.0.1-SNAPSHOT.jar app.jar
```

**它不在容器内编译**，所以重建镜像前必须先在本地把 jar 打包好。完整顺序：

```bash
cd backend

# 1. 本地打包（生成 ai-demo/target/*.jar）
mvn -pl ai-demo -am package -DskipTests

# 2. 重建 backend 镜像
docker compose -f ../docker-compose.yml build backend

# 3. 用新镜像重建容器
docker compose -f ../docker-compose.yml up -d backend
```

> 等价的一步写法：`make docker-compose-up-build`（= `docker compose up --build -d`）。它启的是默认 profile，只有 backend，**已经跑着的 Prometheus / Grafana 不受影响**。

**怎么确认容器里是新代码？**

```bash
# 看容器内 jar 的时间戳，应等于你本地打包的时间
docker exec ai-overview-backend-1 ls -l /app/app.jar

# 再看某个新类是否在 jar 里
docker exec ai-overview-backend-1 sh -c "unzip -l /app/app.jar | grep 你的新类名"
```

> 构建上下文注意：`.dockerignore` 用 `ai-demo/target/*` + `!…backend-ai-demo-0.0.1-SNAPSHOT.jar` 白名单，只放行 fat jar；`/target` 只匹配 `backend/target`，不覆盖 `ai-demo/target`。

## 启动与监控栈

```bash
# 只启动后端（日常）
make docker-compose-up

# 需要监控时再拉起监控栈（一条命令）
make docker-compose-monitoring

# 只想看某个服务
docker compose -f ../docker-compose.yml up -d prometheus
```

启动后：

| 服务 | 地址 |
| --- | --- |
| 后端 | http://localhost:8090 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000（默认 admin/admin，可用 `GF_SECURITY_ADMIN_PASSWORD` 覆盖） |

> ⚠️ 8090 端口被占用时会启动失败（比如本地 IDEA 里也跑着一份后端）；先停掉其中一个再启容器。
>
> 本地监控统一在 `docker-compose.yml` 的 `monitoring` profile 里，详见 [local-dev.md](local-dev.md) 第四节。

## 清理与重置

```bash
# 安全清理（仅悬空镜像）
make docker-clean-images-dangling

# 彻底清理未使用镜像
make docker-clean-images-unused

# 重置运行环境（保留数据）
make docker-compose-clean && make docker-compose-up-build

# 完全重置（含数据卷，慎用）
make docker-compose-clean-full && make docker-compose-up-build
```

## 各命令输出示例

```
$ make docker-compose-up-build
=== 构建并启动服务（一步完成） ===
✅ 所有服务已构建并启动
📊 查看日志: docker compose -f ../docker-compose.yml logs -f
🌐 后端访问地址: http://localhost:8090
ℹ️  监控栈（Prometheus/Grafana）按需启动: make docker-compose-monitoring
```

```
$ make docker-compose-monitoring
=== 启动监控栈 ===
✅ 监控栈已启动
📈 Prometheus访问地址: http://localhost:9090
📊 Grafana访问地址: http://localhost:3000（看板已自动装配，文件夹 AI Overview）
```

```
$ make docker-compose-status
=== 容器状态 ===
NAME                     SERVICE      STATUS    PORTS
ai-overview-backend-1    backend      running   0.0.0.0:8090->8090/tcp
ai-overview-prometheus-1 prometheus   running   0.0.0.0:9090->9090/tcp
ai-overview-grafana-1    grafana      running   0.0.0.0:3000->3000/tcp
```

## 注意事项

1. **API Key 安全**：不要把 `.env` 提交到仓库（已在 `.gitignore`）
2. `docker-compose-clean-full` 会删除数据库与监控历史数据，慎用
3. `docker-compose-up` 与 `docker-compose-up-build` 的区别就是**要不要重新构建**——改代码必须用后者（或按上文三段式）
4. 日志查看模式下按 `Ctrl+C` 退出
5. 默认编排文件是 `../docker-compose.yml`，可用 `DOCKER_COMPOSE_FILE=xxx make ...` 覆盖
