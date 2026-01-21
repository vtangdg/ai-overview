# AI Overview - Claude AI 助手指南

本项目是一个综合性人工智能技术概览与学习平台，帮助开发者了解和掌握AI技术。

## 项目概述

**项目名称**: AI Overview
**技术栈**: Next.js 15 + Spring Boot 3.5.9
**架构模式**: 前后端分离，RESTful API
**主要功能**: 概念库、AI工具箱、知识笔记、应用广场

---

## 快速导航

- [项目结构](#项目结构)
- [技术栈](#技术栈)
- [开发环境](#开发环境)
- [核心功能模块](#核心功能模块)
- [代码规范](#代码规范)
- [常见任务](#常见任务)
- [部署指南](#部署指南)

---

## 项目结构

```
ai-overview/
├── frontend/                    # Next.js 15 前端
│   │   ├── app/                # Next.js App Router
│   │   │   ├── api/                 # API路由（请求后端，或者后面可能会请求后端）
│   │   │   │   ├── notes/            # 笔记相关API
│   │   │   │   └── stats/            # 统计相关API
│   │   │   ├── concepts/            # 概念库页面
│   │   │   ├── tools/               # AI工具箱
│   │   │   ├── notes/               # 知识笔记
│   │   │   ├── demos/               # 应用广场
│   │   │   │   └── [id]/            # 动态路由（支持概念解释器和提示词优化器）
│   │   ├── components/
│   │   │   ├── common/              # 通用组件（Layout等）
│   │   │   ├── demos/               # 应用广场组件（包含概念解释器和提示词优化器）
│   │   │   └── ui/                  # UI基础组件
│   │   └── features/                # 业务逻辑层
│   │       ├── notes/lib/           # 知识笔记业务逻辑
│   │       └── prompt-optimizer/lib/# 提示词优化器业务逻辑
│   └── public/
│       └── lib/
│           ├── tools/               # AI工具文档（Markdown）
│           └── notes/               # 知识笔记文档（Markdown）
│
├── backend/                     # Spring Boot 后端
│   ├── ai-demo/
│   │   └── src/main/java/.../aidemo/
│   │       ├── controller/         # REST控制器
│   │       ├── service/            # 业务服务
│   │       │   └── strategy/       # 多模型策略模式
│   │       ├── dao/                # 数据访问层
│   │       ├── model/              # 数据模型
│   │       │   └── dto/             # 数据传输对象
│   │       └── config/             # 配置类
│   │   └── src/main/resources/
│   │       ├── application.yml     # 主配置
│   │       ├── application-dev.yml  # 开发配置
│   │       └── application-prod.yml # 生产配置
│   ├── .env                        # 环境变量（API密钥等）
│   ├── Dockerfile
│   └── Makefile                    # 构建脚本
│
└── doc/
    ├── tech/                       # 技术文档
```

---

## 技术栈

### 前端
- **框架**: Next.js 15 (App Router)
- **UI库**: Tailwind CSS
- **图标**: Lucide React
- **Markdown**: ReactMarkdown
- **状态管理**: React Hooks (useState, useEffect)
- **代码规范**: TypeScript, ESLint

### 后端
- **框架**: Spring Boot 3.5.9
- **Java版本**: 21
- **AI框架**: Spring AI 1.0.3
- **数据库**: SQLite (MyBatis)
- **缓存**: Caffeine
- **监控**: Spring Actuator + Prometheus
- **日志**: Logback

### AI 模型集成
- **DeepSeek** (默认): https://api.deepseek.com
- **智谱GLM**: https://open.bigmodel.cn/api/paas/v4
- 通过策略模式支持多模型扩展

---

## 开发环境

### 前置要求
- JDK 21+
- Node.js 18+
- pnpm 8+
- Maven 3.8+
- Docker & Docker Compose（可选）

### 本地开发启动

**1. 启动后端**:
```bash
cd backend/ai-demo
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**2. 启动前端**:
```bash
cd frontend
pnpm install
pnpm dev
```

**3. 访问应用**:
- 前端: http://localhost:3000
- 后端API: http://localhost:8090
- Actuator: http://localhost:8090/actuator/health

---

## 核心功能模块

### 1. 概念库
- **路径**: `/concepts`
- **功能**: AI核心概念学习和展示
- **实现**: 纯前端
- **特性**:
  - 概念分类浏览
  - 详细概念解释
  - 相关概念推荐

### 2. AI 概念解释器
- **路径**: `/demos/concept-explainer`
- **功能**: 使用AI解释AI相关概念
- **实现**: `ConceptExplainerController` + `ConceptExplainerService`
- **模型**: DeepSeek

### 3. 提示词优化器
- **路径**: `/demos/prompt-optimizer` (动态路由)
- **功能**: 生成和优化高质量提示词
- **实现**: `PromptOptimizerController` + `PromptOptimizerService`
- **模型**: GLM (默认), DeepSeek
- **特性**:
  - 模板库快速选择
  - 多模型支持

### 4. 知识笔记
- **路径**: `/notes`
- **功能**: Markdown笔记管理
- **实现**: 纯前端，文件系统扫描
- **特性**:
  - Front Matter 元数据解析
  - 分类浏览
  - 标签筛选

### 5. AI 工具箱
- **路径**: `/tools`
- **功能**: AI工具展示和介绍
- **实现**: 静态Markdown文件 + 动态加载

### 6. 应用广场
- **路径**: `/demos`
- **功能**: AI应用导航
- **组件**: `demos-page.tsx`
- **卡片配置**: 每个应用配置图标、标题、描述、标签、URL

---

## 代码规范

### 前端规范

**目录组织（关注点分离）**:
- `components/功能名/` - UI组件层
- `components/demos/` - 应用广场的组件聚合
- `features/功能名/lib/` - 业务逻辑层
- `app/功能名/` - 路由和页面组装
- `app/demos/` - 应用广场的应用（包括动态路由 `[id]` 支持多个应用）

**组件命名**:
- 页面组件: PascalCase (如 `PromptEditor.tsx`)
- 工具函数: camelCase (如 `formatDate.ts`)
- 类型定义: `types.ts` 或 `*.types.ts`

**导入顺序**:
```typescript
// 1. React相关
import { useState, useEffect } from 'react';

// 2. 第三方库
import { ArrowRight } from 'lucide-react';

// 3. 项目内部组件
import { Layout } from '@/components/common';

// 4. 项目内部功能
import { promptOptimizerApi } from '@/features/prompt-optimizer/lib/api';

// 5. 类型
import type { ModelOption } from '@/features/prompt-optimizer/lib/types';

// 6. 样式（如果有）
import './styles.css';
```

### 后端规范

**包结构**:
```
com.aioverview.backend.aidemo
├── controller/      # 控制器层（处理HTTP请求）
├── service/         # 服务层（业务逻辑）
│   └── strategy/    # 策略模式实现
├── dao/             # 数据访问层
├── model/           # 实体类
│   └── dto/         # 数据传输对象
└── config/          # 配置类
```

**命名规范**:
- Controller: `XxxController`
- Service: `XxxService` (接口) + `XxxServiceImpl` (实现)
- DTO: `XxxRequest` / `XxxResponse`
- 实体: PascalCase

**日志规范**:
```java
System.out.println("=== 功能名称 ===");
System.out.println("关键信息: " + value);
System.out.println("====================");
```

---

## 常见任务

### 添加新的AI模型

1. **创建策略类**: `backend/.../strategy/XxxModelStrategy.java`
2. **注册到工厂**: `ChatModelStrategyFactory`
3. **更新配置**: `application.yml` 添加模型配置

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

**使用 Docker Compose**:
```bash
docker-compose up -d
```

**相关配置**:
- `docker-compose.yml` - 生产环境编排
- `backend/Dockerfile` - 后端镜像构建

### 数据持久化

访问统计数据存储在 Docker volume 中:
```yaml
volumes:
  visitor_stats_data:  # 访客统计数据卷
```

### 监控



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

---

## 技术设计文档

---

## 故障排查

---

