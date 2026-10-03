# 本地开发指南

> 最后核对：2026-10-03

## 端口分配

| 服务 | 端口 | 说明 |
| --- | --- | --- |
| 前端 | 3010 | 在 `frontend/package.json` 的 `dev` 脚本里写死，**不是** Next.js 默认的 3000 |
| 后端 | 8090 | `application.yml` 的 `server.port` |
| Prometheus | 9090 | |
| Grafana | 3000 | 与前端不冲突（前端用 3010） |

## 一、配置 API Key

两种启动方式读的是**不同的来源**，两边都配好最省事：

| 启动方式 | Key 来源 |
| --- | --- |
| 容器（docker compose） | 仓库根目录 `.env`，compose 原生读取 |
| 本地 mvn / IDEA | 进程环境变量（shell `export` 或 IDEA 运行配置里的 Environment variables） |

仓库根目录 `.env`：

```bash
DEEPSEEK_API_KEY=sk-xxxxx        # 对话模型
GLM_API_KEY=xxxxx                # 智谱：RAG 的 Embedding 必需
```

本地跑后端时（例如写在 `~/.zshrc`）：

```bash
export DEEPSEEK_API_KEY=sk-xxxxx
export GLM_API_KEY=xxxxx
```

> 缺 `GLM_API_KEY` 的后果不只是「GLM 对话不可用」——RAG 的向量化也走智谱，没 key 时索引建不起来、问答会失败。

## 二、启动后端

本地开发必须带 **dev profile**（SQLite 数据源、RAG 本地路径、MyBatis 调试日志都定义在 `application-dev.yml` 里），否则启动会因为缺少数据源配置失败。

### 方式 A：IDEA（最省事）

运行配置里设置：
- Active profiles: `dev`
- Working directory: `backend/`

工作目录是 `backend/` 时，`application-dev.yml` 里的相对路径（`./ai-demo/db/visitor_stats.db`、`../frontend/public/lib/notes`）刚好都对，**不需要任何额外参数**。

### 方式 B：命令行（已实测）

```bash
cd backend
mvn spring-boot:run -pl ai-demo -Dspring-boot.run.profiles=dev \
  -Dspring-boot.run.workingDirectory=$(pwd)
```

两个参数都不能省：

- **`-pl ai-demo`**：父 pom 没有 mainClass，不加会报「Unable to find a suitable main class」；
- **`workingDirectory=$(pwd)`**：`spring-boot:run` 默认 fork 在**模块目录 `ai-demo/`** 下，此时 dev 配置里的相对路径会漂移——SQLite 会找 `ai-demo/ai-demo/db/...`、笔记目录会找 `ai-demo/../frontend/...`、向量索引会写到别处。手动指定工作目录为 `backend/` 后与 IDEA 行为一致。

  不想用这个参数的话，就得逐个覆盖路径：

  ```bash
  mvn spring-boot:run -pl ai-demo -Dspring-boot.run.profiles=dev \
    -Dspring-boot.run.arguments="--spring.datasource.url=jdbc:sqlite:./db/visitor_stats.db --rag.notes-paths=../../frontend/public/lib/notes --rag.store-path=./db/rag-store.json"
  ```

启动成功的标志（日志）：

```
Started AIDemoApplication in 5.3 seconds
RagIndexService - 复用本地向量索引 .../backend/./db/rag-store.json，未调用 embedding 服务（当前笔记 20 篇）
```

### 方式 C：容器

```bash
cd backend
make docker-compose-up-build
```

⚠️ 容器版和本地版**抢同一个 8090 端口**，同一时间只能跑一个。另外容器用的是 prod profile（`Dockerfile` 里 `SPRING_PROFILES_ACTIVE=prod`），数据库文件在 volume 里。改代码后必须重建镜像，见 [makefile.md](makefile.md)。

## 三、启动前端

```bash
cd frontend
pnpm install
pnpm dev        # http://localhost:3010
```

前端通过 `next.config.ts` 的 rewrites 把 `/api/**` 代理到 `BACKEND_API_URL`（默认 `http://localhost:8090`），`/api/notes/**` 例外，走 Next.js 自己的 API 路由。

```bash
# 后端不在本机默认端口时
BACKEND_API_URL=http://192.168.1.10:8090 pnpm dev
```

## 四、让监控看到本地的后端

后端跑在本地、监控跑在容器时，Prometheus 必须用 `host.docker.internal` 才能抓到宿主机：

| 后端跑在哪 | Prometheus 配置 | 目标地址 |
| --- | --- | --- |
| 容器内 | `prometheus/prometheus.yml` | `backend:8090`（容器网络内） |
| 宿主机（IDEA / mvn） | `prometheus/prometheus-local.yml` | `host.docker.internal:8090` |

`docker-compose-local.yml` 本来就是为此准备的（挂载 `prometheus-local.yml`），但**它里面的 prometheus 和 grafana 服务目前全被注释掉了**，直接 `up` 起不来任何东西。两种做法：

```bash
# 做法一（推荐）：用主编排的 monitoring profile —— 后端也一起进容器
cd backend && make docker-compose-monitoring

# 做法二：后端本地跑，只把监控放容器 —— 需要先把 docker-compose-local.yml 里注释的服务取消注释
docker compose -f docker-compose-local.yml up -d
```

Grafana 在两种做法下都由 `grafana/provisioning/` 自动装配数据源与看板。

> 指标口径与看板说明见 [monitoring.md](monitoring.md)。

## 五、`start-dev.sh` 的现状（暂不可用）

根目录的 `start-dev.sh` 是早期的一键脚本，**目前跑不通**，原因有三：

1. 它执行 `docker compose -f docker-compose-local.yml up -d`，而该文件里的服务全被注释 → 起不来监控，但脚本仍会打印「✅ 监控服务启动成功」；
2. 它提示的 `./mvnw spring-boot:run` 不存在（`backend/` 下没有 Maven Wrapper）；
3. 它提示的 `make docker-run` 这个 target 在 `backend/Makefile` 里也没有。

需要修的话，按第二节方式 B + 第四节的监控做法替换即可。

## 六、常见问题

| 现象 | 原因 / 处理 |
| --- | --- |
| 启动报「Unable to find a suitable main class」 | 漏了 `-pl ai-demo` |
| 启动报数据源/表不存在、或找不到笔记目录 | 漏了 `-Dspring-boot.run.workingDirectory=$(pwd)`，或没带 `dev` profile |
| 8090 端口被占用 | 容器版与本地版同时在跑，停一个 |
| 请求模型返回 401 | 环境变量里的 `DEEPSEEK_API_KEY` 没传进进程（本地 mvn/IDEA 读的是进程环境变量，不是 `.env`）；确认 key 前后没有引号或空格 |
| 改了 `frontend/public/lib/notes/` 下的笔记，问答还是旧内容 | 需要重建向量索引：`POST /api/rag/index/rebuild` |
| 想换某个应用用的模型 | 见 [model-config.md](model-config.md) |
