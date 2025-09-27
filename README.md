# AI Overview 项目

AI Overview 是一个综合性人工智能技术概览与学习平台，旨在帮助开发者、研究者和AI爱好者了解和掌握最新的人工智能技术、应用和趋势。

## 项目结构

```
ai-overview
├── .github/workflows/     # GitHub Actions 工作流配置
│   ├── frontend-ci.yml    # 前端CI流程
│   └── backend-cd.yml     # 后端部署流程
├── frontend/              # 前端项目 (Next.js)
│   ├── src/               # 前端源代码
│   ├── public/            # 静态资源
│   ├── package.json       # 前端依赖配置
│   ├── next.config.js     # Next.js配置
│   └── tailwind.config.js # Tailwind CSS配置
├── backend/               # 后端项目 (Spring Boot)
│   ├── src/               # 后端源代码
│   ├── pom.xml            # Maven依赖配置
│   └── Dockerfile         # 后端Docker配置
├── docs/                  # 项目文档
├── .gitignore             # Git忽略配置
├── README.md              # 项目总说明
└── docker-compose.yml     # 本地开发环境配置
```

## 技术栈

### 前端
- **框架**: Next.js 14 (React 18)
- **构建工具**: Webpack, Babel
- **样式**: Tailwind CSS 3
- **类型检查**: TypeScript
- **测试**: Jest

### 后端
- **框架**: Spring Boot 3
- **数据库**: PostgreSQL 15
- **ORM**: Spring Data JPA
- **认证**: Spring Security + JWT
- **容器化**: Docker

### 开发与部署
- **版本控制**: Git
- **CI/CD**: GitHub Actions
- **容器编排**: Docker Compose

## 快速开始

### 前提条件
- 安装 [Docker](https://www.docker.com/get-started) 和 [Docker Compose](https://docs.docker.com/compose/install/)
- 安装 [Node.js](https://nodejs.org/en/download/) (v18 或更高版本)
- 安装 [Java JDK](https://www.oracle.com/java/technologies/downloads/) (v17 或更高版本)
- 安装 [Maven](https://maven.apache.org/download.cgi)

### 使用 Docker Compose 启动

最简单的方式是使用 Docker Compose 启动整个项目：

```bash
# 克隆仓库
git clone https://github.com/yourusername/ai-overview.git
cd ai-overview

# 启动所有服务
docker-compose up -d
```

服务启动后，可以通过以下地址访问：
- 前端: http://localhost:3000
- 后端 API: http://localhost:8080
- 数据库: localhost:5432

### 单独启动开发环境

#### 前端开发

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:3000 启动。

#### 后端开发

```bash
cd backend
mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动。

## 功能特性

### 前端功能
- 响应式设计，支持各种设备
- 现代化UI，基于Tailwind CSS
- 动态路由和页面过渡
- API请求代理和数据获取
- 用户认证和授权

### 后端功能
- RESTful API 设计和实现
- 用户管理和认证系统
- 数据持久化和查询
- 安全控制和权限管理
- API文档 (通过Swagger)

## 开发指南

### 代码规范
- 前端: 遵循 ESLint 和 TypeScript 规范
- 后端: 遵循 Spring Boot 最佳实践

### 提交代码
- 提交前运行测试: `npm test` (前端) 或 `mvn test` (后端)
- 提交前运行格式化: `npm run format` (前端) 或 `mvn spotless:apply` (后端)

## CI/CD 流程

项目使用 GitHub Actions 实现自动化的 CI/CD 流程：

- **前端 CI**: 当推送到 main 分支或创建 PR 时，自动运行 lint、测试和构建
- **后端 CD**: 当推送到 main 分支时，自动构建、测试、打包 Docker 镜像并部署

## 文档

项目文档位于 `docs/` 目录，包括：
- 系统架构设计
- API 文档
- 数据库设计
- 开发指南

## 贡献

欢迎贡献代码！请按照以下流程：
1. Fork 仓库
2. 创建功能分支
3. 提交更改
4. 创建 PR

## 许可

本项目使用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件。

## 联系方式

如有任何问题或建议，请联系：
- 邮箱: contact@aioverview.com
- GitHub: https://github.com/yourusername/ai-overview/issues