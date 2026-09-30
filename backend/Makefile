## 条件导入环境变量（统一放仓库根目录，与 docker-compose.yml 同级，compose 原生可读）
ifneq (,$(wildcard ../.env))
include ../.env
endif

## 显式导出白名单变量给子进程（docker compose）。
## 不要用裸 export：那会把 CURDIR/SHELL 等 make 内建变量一并导出污染容器环境，
## 且 .env 里若出现 PATH 等名字会覆盖 make 自身运行环境
export DEEPSEEK_API_KEY GLM_API_KEY

## 变量定义
DEEPSEEK_API_KEY ?= your_api_key_here_please_set_in_env_file
GLM_API_KEY ?= your_api_key_here_please_set_in_env_file
DOCKER_COMPOSE_FILE ?= ../docker-compose.yml

## 初始化环境文件（仓库根目录）
env-init:
	@if [ ! -f ../.env ]; then \
		echo "创建 ../.env 文件..."; \
		echo "DEEPSEEK_API_KEY=your_api_key_here_please_set_in_env_file" > ../.env; \
		echo "GLM_API_KEY=your_api_key_here_please_set_in_env_file" >> ../.env; \
		echo "✅ 请编辑仓库根目录的 .env 文件设置你的 DEEPSEEK_API_KEY 和 GLM_API_KEY"; \
	else \
		echo "✅ .env 文件已存在"; \
	fi

## 检查 API Key
check-env:
	@if [ "$(DEEPSEEK_API_KEY)" = "your_api_key_here_please_set_in_env_file" ]; then \
		echo "❌ 错误: 请在仓库根目录 .env 中设置 DEEPSEEK_API_KEY"; \
		echo "💡 运行: make env-init 然后编辑 ../.env 文件"; \
		exit 1; \
	fi
	@if [ "$(GLM_API_KEY)" = "your_api_key_here_please_set_in_env_file" ]; then \
		echo "❌ 错误: 请在仓库根目录 .env 中设置 GLM_API_KEY"; \
		echo "💡 运行: make env-init 然后编辑 ../.env 文件"; \
		exit 1; \
	fi
	@echo "✅ 环境变量检查通过"

## Docker Compose 停止所有服务
docker-compose-stop:
	@echo "=== 停止所有服务 ==="
	@docker compose -f $(DOCKER_COMPOSE_FILE) down
	@echo "✅ 所有服务已停止"

## Docker Compose 清理容器和网络（保留卷）
docker-compose-clean:
	@echo "=== 清理容器和网络（保留卷） ==="
	@docker compose -f $(DOCKER_COMPOSE_FILE) down --remove-orphans
	@echo "✅ 容器和网络已清理，卷已保留"

## Docker Compose 完全清理所有资源（包括卷和网络）
docker-compose-clean-full:
	@echo "=== 完全清理所有资源（包括卷） ==="
	@docker compose -f $(DOCKER_COMPOSE_FILE) down -v --remove-orphans
	@echo "✅ 所有资源（包括卷）已清理"

## Docker Compose 启动服务（先校验 API Key，避免占位符被静默传进容器）
docker-compose-up: check-env
	@echo "=== 启动服务 ==="
	@docker compose -f $(DOCKER_COMPOSE_FILE) up -d
	@echo "✅ 所有服务已启动"
	@echo "📊 查看日志: docker compose -f $(DOCKER_COMPOSE_FILE) logs -f"
	@echo "🌐 后端访问地址: http://localhost:8090"
	@echo "ℹ️  监控栈（Prometheus/Grafana）按需启动: make docker-compose-monitoring"

## Docker Compose 构建并启动服务（一步完成）
docker-compose-up-build: check-env
	@echo "=== 构建并启动服务（一步完成） ==="
	@docker compose -f $(DOCKER_COMPOSE_FILE) up --build -d
	@echo "✅ 所有服务已构建并启动"
	@echo "📊 查看日志: docker compose -f $(DOCKER_COMPOSE_FILE) logs -f"
	@echo "🌐 后端访问地址: http://localhost:8090"
	@echo "ℹ️  监控栈（Prometheus/Grafana）按需启动: make docker-compose-monitoring"

## 启动监控栈（Prometheus + Grafana，monitoring profile，按需占用资源）
docker-compose-monitoring: check-env
	@echo "=== 启动监控栈 ==="
	@docker compose -f $(DOCKER_COMPOSE_FILE) --profile monitoring up -d
	@echo "✅ 监控栈已启动"
	@echo "📈 Prometheus访问地址: http://localhost:9090"
	@echo "📊 Grafana访问地址: http://localhost:3000（看板已自动装配，文件夹 AI Overview）"

## Docker Compose 查看日志
docker-compose-logs:
	@echo "=== 查看服务日志 ==="
	@read -p "请输入要查看的服务名称（留空查看所有）: " service; \
	if [ -n "$$service" ]; then \
		docker compose -f $(DOCKER_COMPOSE_FILE) logs -f $$service; \
	else \
		docker compose -f $(DOCKER_COMPOSE_FILE) logs -f; \
	fi

## 查看所有容器状态
docker-compose-status:
	@echo "=== 容器状态 ==="
	@docker compose -f $(DOCKER_COMPOSE_FILE) ps

## 清理悬空 Docker 镜像（无标签且未使用）
docker-clean-images-dangling:
	@echo "=== 清理悬空镜像（无标签且未使用） ==="
	@docker image prune -f
	@echo "✅ 悬空镜像已清理"

## 清理所有未使用的 Docker 镜像（不影响容器和卷）
docker-clean-images-unused:
	@echo "=== 清理所有未使用的镜像（不影响容器和卷） ==="
	@docker image prune -af
	@echo "✅ 未使用的镜像已清理"

.PHONY: env-init check-env docker-compose-stop docker-compose-clean docker-compose-clean-full docker-compose-up docker-compose-up-build docker-compose-monitoring docker-compose-logs docker-compose-status docker-clean-images-dangling docker-clean-images-unused