# 技术选型
## 前端
### 包管理器：npm vs pnpm => pnpm
#### 技术对比分析
| 特性 | npm | pnpm | 对你的项目影响 |
| :--- | :--- | :--- | :--- |
| **安装速度** | 较慢 | ⭐⭐⭐⭐⭐ **极快**（硬链接+并行安装） | 节省开发等待时间 |
| **磁盘空间** | 高（大量重复依赖） | ⭐⭐⭐⭐⭐ **极低**（内容可寻址存储） | 节省硬盘空间，特别适合Monorepo |
| **依赖管理** | 扁平化（有幽灵依赖风险） | ⭐⭐⭐⭐⭐ **严格**（非扁平化，无幽灵依赖） | 更可靠的构建结果 |
| **Monorepo支持** | 需要工具（如Lerna） | ⭐⭐⭐⭐⭐ **原生优秀支持**（workspace协议） | 完美匹配你的单仓库架构 |
| **稳定性** | 高（官方标准） | ⭐⭐⭐⭐ **很高**（已被大量大型项目验证） | 生产环境可靠 |

#### 选择 pnpm 的核心理由

1. **磁盘空间节省 - 对个人项目特别重要**
```bash
# 使用 npm 安装后的 node_modules 大小
du -sh node_modules  # create-next-app、shadcn初始化后，473M

# 使用 pnpm 安装后的 node_modules 大小  
du -sh node_modules  # 可能只有 100MB+，取决于本地是否有多项目复用相同包
```

**优势**：Next.js + Shadcn/ui 会有大量依赖，pnpm 的共享存储机制可以节省磁盘空间。

2. **安装速度优势 - 提升开发效率**
```bash
# 首次安装对比
time npm install    # 可能需要 2-3 分钟
time pnpm install   # 可能只需要 30-60 秒

# 后续安装（依赖缓存）
time npm install    # 仍然需要较长时间
time pnpm install   # 几乎瞬间完成（硬链接）
```

3. **完美的 Monorepo 支持**
```json
// 根目录 package.json
{
  "name": "ai-overview",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm --filter frontend dev",
    "build": "pnpm -r build"
  }
}
```

```json
// frontend/package.json - 可以这样引用本地包
{
  "dependencies": {
    "@ai-overview/ui": "workspace:*",
    "@ai-overview/utils": "workspace:*"
  }
}
```
#### 具体实施步骤
```bash
# 使用 npm 安装 pnpm（推荐方式）
npm install -g pnpm

# 或者使用独立安装脚本（更干净）
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### 2. **在前端项目中使用**
```bash
# 进入前端目录
cd frontend

# 使用 pnpm 初始化（如果还没有 package.json）
pnpm init

# 安装依赖（替代 npm install）
pnpm add next react react-dom typescript @types/node tailwindcss
pnpm add -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# 安装 Shadcn/ui 组件
pnpm add class-variance-authority clsx tailwind-merge
pnpm dlx shadcn-ui@latest init
pnpm dlx shadcn-ui@latest add button card input ...
```
