#!/bin/bash

# 本地开发启动脚本
# 此脚本用于启动本地开发环境，包括：
# 1. 本地运行后端服务
# 2. Docker运行监控服务(Prometheus和Grafana)

echo "=== AI Overview 本地开发环境启动 ==="

# 检查是否已设置DEEPSEEK_API_KEY环境变量
if [ -z "$DEEPSEEK_API_KEY" ]; then
    echo "⚠️  警告: DEEPSEEK_API_KEY环境变量未设置"
    echo "请设置此环境变量或创建backend/.env文件"
    echo "示例: export DEEPSEEK_API_KEY=your_api_key_here"
    echo ""
fi

# 启动监控服务
echo "1. 启动监控服务(Prometheus和Grafana)..."
docker compose -f docker-compose-local.yml up -d

# 检查监控服务是否启动成功
if [ $? -eq 0 ]; then
    echo "✅ 监控服务启动成功"
    echo "   - Prometheus: http://localhost:9090"
    echo "   - Grafana: http://localhost:3000 (admin/admin)"
else
    echo "❌ 监控服务启动失败"
    exit 1
fi

echo ""
echo "2. 请手动启动后端服务:"
echo "   cd backend"
echo "   ./mvnw spring-boot:run"
echo ""
echo "或者使用Docker运行后端:"
echo "   cd backend"
echo "   make docker-run"
echo ""
echo "=== 启动完成 ==="
echo "访问地址:"
echo "- 前端: http://localhost:3000 (需单独启动)"
echo "- 后端API: http://localhost:8090"
echo "- Prometheus: http://localhost:9090"
echo "- Grafana: http://localhost:3000"