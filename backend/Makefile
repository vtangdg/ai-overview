## 条件导入环境变量（如果文件存在）
ifneq (,$(wildcard .env))
include .env
export
endif

## 变量定义
DEEPSEEK_API_KEY ?= your_api_key_here_please_set_in_env_file
IMAGE_NAME ?= ai-overview-backend
IMAGE_TAG ?= latest
CONTAINER_NAME ?= ai-overview-backend
HOST_PORT ?= 8090
CONTAINER_PORT ?= 8090

## 初始化环境文件
env-init:
	@if [ ! -f .env ]; then \
		echo "创建 .env 文件..."; \
		echo "DEEPSEEK_API_KEY=your_api_key_here_please_set_in_env_file" > .env; \
		echo "✅ 请编辑 .env 文件设置你的 DEEPSEEK_API_KEY"; \
	else \
		echo "✅ .env 文件已存在"; \
	fi

## 检查 API Key
check-env:
	@if [ "$(DEEPSEEK_API_KEY)" = "your_api_key_here_please_set_in_env_file" ]; then \
		echo "❌ 错误: 请在 .env 文件中设置 DEEPSEEK_API_KEY"; \
		echo "💡 运行: make env-init 然后编辑 .env 文件"; \
		exit 1; \
	fi
	@echo "✅ 环境变量检查通过"

## Docker remove and build images (完整清理和构建)
docker-remove-build:
	@echo "=== 清理并重新构建镜像 ==="
	@echo "1. 停止并删除现有容器..."
	-@docker stop $(CONTAINER_NAME) 2>/dev/null || echo "无运行中的容器"
	-@docker rm $(CONTAINER_NAME) 2>/dev/null || echo "无容器可删除"
	@echo "2. 删除现有镜像..."
	-@docker rmi $(IMAGE_NAME):$(IMAGE_TAG) 2>/dev/null || echo "无镜像可删除"
	@echo "3. 构建新镜像..."
	@docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .
	@echo "✅ 镜像构建完成: $(IMAGE_NAME):$(IMAGE_TAG)"

## Docker 构建镜像 (直接构建)
docker-build:
	@echo "=== 构建镜像 ==="
	@docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .
	@echo "✅ 镜像构建完成: $(IMAGE_NAME):$(IMAGE_TAG)"

## Docker 运行容器
docker-run: check-env
	@echo "=== 启动容器 ==="
	@echo "1. 清理现有容器..."
	-@docker stop $(CONTAINER_NAME) 2>/dev/null || echo "无运行中的容器"
	-@docker rm $(CONTAINER_NAME) 2>/dev/null || echo "无容器可删除"
	@echo "2. 启动新容器..."
	@docker run -d \
		-p $(HOST_PORT):$(CONTAINER_PORT) \
		-e DEEPSEEK_API_KEY=$(DEEPSEEK_API_KEY) \
		--name $(CONTAINER_NAME) \
		$(IMAGE_NAME):$(IMAGE_TAG)
	@echo "✅ 容器启动成功!"
	@echo "📊 查看日志: docker logs -f $(CONTAINER_NAME)"
	@echo "🌐 访问地址: http://localhost:$(HOST_PORT)"

## 其他目标保持不变...
docker-remove-build-run: docker-remove-build docker-run
	@echo "✅ 完整流程执行完毕!"

.PHONY: docker-remove-build docker-build  docker-run docker-remove-build-run check-env env-init