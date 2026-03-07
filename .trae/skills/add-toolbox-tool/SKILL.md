---
name: "add-toolbox-tool"
description: "在AI工具箱页面新增工具。Invoke when user wants to add new AI tools to the toolbox, update tool categories, or generate tool detail documentation."
---

# 工具箱工具新增技能

此技能用于在AI工具箱页面新增工具，包括更新工具数据、生成分类和创建工具详情文档。

## 文件结构

```
frontend/
├── src/lib/tools.ts              # 工具数据和分类定义
├── src/components/tools/         # 工具箱组件
│   ├── tools-page.tsx
│   ├── tool-card.tsx
│   └── tool-detail.tsx
└── public/lib/tools/             # 工具详情Markdown文件
```

## 数据模型

### Category (分类)
```typescript
interface Category {
  id: number;           // 分类ID，1-9为现有分类
  name: string;         // 分类名称
  icon: string;         // 分类图标（emoji或图片路径）
  subcategories: SubCategory[];
}
```

### AITool (工具)
```typescript
interface AITool {
  id: number;           // 工具ID，格式：categoryId * 1000 + 序号
  name: string;         // 工具名称
  categoryId: number;   // 所属分类ID
  subcategoryId: number;// 子分类ID，无则为0
  icon: string;         // 图标（emoji或图片路径）
  breifDesc: string;    // 简短描述
}
```

## ID分配规则

- 分类ID：1-9（现有），新增分类从10开始
- 工具ID：categoryId * 1000 + 序号（如1001, 1002...）
- 子分类ID：categoryId * 100 + 序号（如401, 402...）

## 现有分类

1. AI对话聊天 (💬) - id: 1
2. AI提示词 (📝) - id: 2
3. AI写作工具 (✍️) - id: 3
4. AI图像工具 (🖼️) - id: 4
5. AI语音工具 (🔊) - id: 5
6. AI视频工具 (🎬) - id: 6
7. AI编程工具 (💻) - id: 7
8. AI开发平台 (🚀) - id: 8
9. AI办公 (🏢) - id: 9

## 执行步骤

### 1. 解析工具数据

读取用户提供的工具数据，格式示例：
```
AI对话聊天：DeepSeek,豆包,腾讯元宝
AI图像工具
    插画生成：Midjourney
    背景移除：Remove.bg
```

- 冒号前为分类名称
- 冒号后为工具列表（逗号分隔）
- 缩进表示子分类

### 2. 检查现有工具

读取 `/Users/degang/workplace/mysystem/ai-overview/frontend/src/lib/tools.ts` 获取：
- 现有分类列表 (mockCategories)
- 现有工具列表 (aiTools)
- 已使用的ID

读取 `/Users/degang/workplace/mysystem/ai-overview/frontend/public/lib/tools/` 目录获取：
- 已存在的工具详情文件

### 3. 更新分类

如需新增分类，在 `mockCategories` 数组中添加：
```typescript
{
  id: 10,
  name: "新分类",
  icon: "🆕",
  subcategories: []
}
```

如需新增子分类：
```typescript
{
  id: 401,  // 4 * 100 + 1
  name: "子分类名称"
}
```

### 4. 添加工具数据

在 `aiTools` 数组中添加新工具：
```typescript
{
  id: 1008,  // 根据categoryId计算
  name: '新工具',
  categoryId: 1,
  subcategoryId: 0,
  icon: '🆕',  // 或图片路径 '/tool-icon/newtool.png'
  breifDesc: '简短描述，20-30字'
}
```

### 5. 生成工具详情文档

对于每个新工具，生成Markdown文件到 `frontend/public/lib/tools/{toolName}.md`

文档结构：
```markdown
【产品基本信息】
- 工具名称：{toolName}
- 一句话定位：
- 核心技术/模型：
- 官网地址：[https://example.com/](https://example.com/)

【核心功能与场景】
- 功能1：描述
- 功能2：描述

【使用场景】
- 场景1：描述
- 场景2：描述

【技术优势与特点】
- 优势1：
- 优势2：

【亮点】
（特别亮点或差异化特点，展示的话换行展示）
```

### 6. 验证

- 检查所有ID唯一性
- 确保分类和工具关联正确
- 验证生成的Markdown文件格式正确

## 注意事项

1. **图标选择**：优先使用emoji，如需自定义图标使用 `/tool-icon/` 路径
2. **描述长度**：breifDesc 控制在20-30个汉字
3. **文件命名**：工具详情文件使用工具名称，空格保留
4. **ID连续性**：同一分类下的工具ID保持连续
5. **分类排序**：新增分类放在合适的位置，保持逻辑顺序
