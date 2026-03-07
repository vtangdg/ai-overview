# AI Overview - Claude AI 助手指南

本项目是一个综合性人工智能技术概览与学习平台，帮助开发者了解和掌握AI技术。

**技术栈**: Next.js 15 + Spring Boot 3.5.9 | **架构**: 前后端分离

---

## 快速导航

- [快速开始](#快速开始)
- [设计原则](#设计原则)
- [常见任务](#常见任务)
- [部署指南](#部署指南)
- [重要注意事项](#重要注意事项)

---

## 快速开始

### 前置要求
- JDK 21+, Node.js 18+, pnpm 8+, Maven 3.8+
- Docker & Docker Compose（可选）

### 启动命令

**后端**:
```bash
cd backend/ai-demo
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**前端**:
```bash
cd frontend
pnpm install
pnpm dev
```

**访问地址**:
- 前端: http://localhost:3000
- 后端API: http://localhost:8090
- 健康检查: http://localhost:8090/actuator/health

---

## 设计原则

### 关注点分离

**前端目录组织**:
- `components/功能名/` - UI组件层
- `components/demos/` - 应用广场组件聚合
- `features/功能名/lib/` - 业务逻辑层
- `app/功能名/` - 路由和页面组装
- `app/demos/[id]/` - 动态路由支持多应用

**后端分层**:
- `controller/` - HTTP请求处理
- `service/` - 业务逻辑（含策略模式实现）
- `dao/` - 数据访问
- `model/` - 实体与DTO

### 多模型策略模式

通过策略模式支持多AI模型切换：
- **DeepSeek**: 默认模型，通用对话
- **智谱GLM**: 长文本处理，提示词优化默认使用

新增模型只需实现 `ChatModelStrategy` 接口并注册到工厂。

### 代码规范

**命名**:
- 前端页面: PascalCase (如 `PromptEditor.tsx`)
- 前端工具: camelCase (如 `formatDate.ts`)
- 后端Controller: `XxxController`
- 后端Service: `XxxService` (接口) + `XxxServiceImpl` (实现)

**导入顺序**: React → 第三方库 → 项目组件 → 项目功能 → 类型 → 样式

**日志**: 使用 SLF4J / Logback
```java
@Slf4j
public class XxxService {
    public void someMethod() {
        log.info("关键信息: {}", value);
        log.debug("调试信息: {}", debugValue);
        log.error("错误信息", exception);
    }
}
```

---

## 常见任务

### 添加新的AI模型

1. 创建策略类: `backend/.../strategy/XxxModelStrategy.java`
2. 注册到工厂: `ChatModelStrategyFactory`
3. 更新配置: `application.yml` 添加模型配置

### 添加新的应用广场卡片

编辑 `frontend/src/components/demos/demos-page.tsx`:
```typescript
{
  id: 'app-id',
  icon: <IconName className="w-6 h-6" />,
  title: '应用名称',
  description: '应用描述',
  available: true,
  tags: ['标签1', '标签2'],
  url: '/app-route'
}
```

**新增页面检查清单**:
- [ ] 创建页面组件
- [ ] 配置路由
- [ ] **更新 `visitorStats.ts` 中的 `PATH_MAP`**

### 添加新的知识笔记

1. 创建文件: `frontend/public/lib/notes/分类/文件名.md`
2. 添加 Front Matter:
```markdown
---
title: 笔记标题
category: 分类
tags: ['标签1', '标签2']
author: degang
date: 2024-01-01
---

# 正文内容
```

### 修改API配置

**后端配置文件**:
- `application.yml` - 主配置
- `application-dev.yml` - 开发环境
- `application-prod.yml` - 生产环境

**环境变量**: `backend/.env`
```bash
DEEPSEEK_API_KEY=sk-xxxxx
GLM_API_KEY=xxxxx
```

---

## 部署指南

### Docker 部署

```bash
docker-compose up -d
```

**相关配置**:
- `docker-compose.yml` - 生产环境编排
- `backend/Dockerfile` - 后端镜像构建

### 数据持久化

访问统计数据存储在 Docker volume:
```yaml
volumes:
  visitor_stats_data:  # 访客统计数据卷
```

SQLite数据文件: `/app/db/visitor_stats.db`（容器内）

---

## 重要注意事项

### API 密钥管理
- 生产环境使用环境变量
- 不要将 `.env` 文件提交到版本控制
- `.env` 已在 `.gitignore` 中

### 前端 API 代理
Next.js 通过 rewrite 代理 API 请求到后端，配置在 `next.config.ts`

### 数据库
- SQLite 用于访问统计
- 数据文件: `/app/db/visitor_stats.db`（容器内）
- Docker volume 持久化: `visitor_stats_data`
