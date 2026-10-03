# 提示词优化应用技术方案

## 1. 概述

### 1.1 功能定位
在应用广场中新增"提示词优化器"应用，为用户提供智能提示词生成、优化、管理和测试能力。

### 1.2 核心价值
- 降低提示词编写门槛，提高AI交互效果
- 沉淀提示词最佳实践，形成可复用模板库
- 提供数据驱动的提示词质量评估方法

---

## 2. 整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                          前端层 (Next.js)                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ PromptEditor │  │TemplateLib   │  │ABTestView    │              │
│  │  编辑器组件   │  │ 模板库组件    │  │ A/B测试组件  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ PromptMgmt   │  │EffectPreview │  │PromptCompare │              │
│  │  管理组件    │  │ 效果预览     │  │ 对比组件     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                                ↕ REST API
┌─────────────────────────────────────────────────────────────────────┐
│                    API网关层 (Next.js Rewriter)                      │
└─────────────────────────────────────────────────────────────────────┘
                                ↕
┌─────────────────────────────────────────────────────────────────────┐
│                        服务层 (Spring Boot)                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              PromptOptimizerService (核心服务)                │  │
│  │  - generatePrompt()      生成初始提示词                        │  │
│  │  - optimizePrompt()      优化提示词                            │  │
│  │  - comparePrompts()      对比提示词效果                        │  │
│  │  - evaluateQuality()     评估提示词质量                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              PromptTemplateService (模板服务)                  │  │
│  │  - getTemplates()       获取模板列表                           │  │
│  │  - getTemplateById()    获取模板详情                           │  │
│  │  - saveTemplate()       保存自定义模板                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              PromptManagementService (管理服务)                │  │
│  │  - savePrompt()         保存提示词                             │  │
│  │  - getPrompts()         获取提示词列表                         │  │
│  │  - searchPrompts()      搜索提示词                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              ABTestService (A/B测试服务)                       │  │
│  │  - createTest()         创建测试                               │  │
│  │  - executeTest()        执行测试                               │  │
│  │  - getTestResult()      获取测试结果                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                ↕
┌─────────────────────────────────────────────────────────────────────┐
│                        AI模型层 (Spring AI)                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  DeepSeek    │  │    豆包      │  │     GLM      │              │
│  │  ChatClient  │  │  ChatClient  │  │  ChatClient  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                                ↕
┌─────────────────────────────────────────────────────────────────────┐
│                        数据持久层                                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │  SQLite         │  │  File System    │  │  Redis Cache    │     │
│  │  (提示词/模板)   │  │  (模板库MD)     │  │  (会话缓存)     │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. 数据模型设计

### 3.1 核心实体

```java
// 提示词实体
@Entity
public class Prompt {
    private Long id;
    private String title;              // 标题
    private String content;            // 提示词内容
    private String category;           // 分类
    private List<String> tags;         // 标签
    private String model;              // 使用的模型
    private Integer version;           // 版本号
    private Long parentId;             // 父版本ID（用于版本历史）
    private Double qualityScore;       // 质量评分
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;          // 创建人（session标识）
}

// 提示词模板
@Entity
public class PromptTemplate {
    private Long id;
    private String name;               // 模板名称
    private String description;        // 描述
    private String category;           // 分类
    private String content;            // 模板内容（支持变量占位符）
    private List<String> variables;    // 模板变量列表
    private List<String> tags;         // 标签
    private Integer usageCount;        // 使用次数
    private Double rating;             // 评分
    private Boolean isOfficial;        // 是否官方模板
    private LocalDateTime createdAt;
}

// A/B测试
@Entity
public class PromptABTest {
    private Long id;
    private String testName;           // 测试名称
    private String taskDescription;    // 任务描述
    private List<PromptVariant> variants; // 变体列表
    private String testModel;          // 测试使用的模型
    private String status;             // 状态: RUNNING, COMPLETED
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}

// 提示词变体（用于A/B测试）
@Entity
public class PromptVariant {
    private Long id;
    private Long testId;               // 所属测试ID
    private String promptContent;      // 提示词内容
    private String variantName;        // 变体名称（如"A版本"、"B版本"）
    private Integer executionCount;    // 执行次数
    private Double avgQualityScore;    // 平均质量评分
    private Integer avgResponseTime;   // 平均响应时间(ms)
    private String aiResponse;         // AI响应结果
    private Double responseRating;     // 响应质量评分
}

// 优化历史
@Entity
public class PromptOptimizeHistory {
    private Long id;
    private Long promptId;             // 提示词ID
    private String originalPrompt;     // 原始提示词
    private String optimizedPrompt;    // 优化后提示词
    private String optimizeReason;     // 优化理由/用户反馈
    private String modelUsed;          // 使用的模型
    private Double qualityImprovement; // 质量提升幅度
    private LocalDateTime createdAt;
}
```

### 3.2 数据库表设计

```sql
-- 提示词表
CREATE TABLE prompts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    tags VARCHAR(500),                 -- JSON数组
    model VARCHAR(50),
    version INT DEFAULT 1,
    parent_id BIGINT,
    quality_score DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    INDEX idx_category (category),
    INDEX idx_tags (tags),
    INDEX idx_created_by (created_by)
);

-- 提示词模板表
CREATE TABLE prompt_templates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    content TEXT NOT NULL,
    variables VARCHAR(500),            -- JSON数组
    tags VARCHAR(500),
    usage_count INT DEFAULT 0,
    rating DOUBLE DEFAULT 0,
    is_official BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_is_official (is_official)
);

-- A/B测试表
CREATE TABLE prompt_ab_tests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    test_name VARCHAR(200) NOT NULL,
    task_description TEXT,
    test_model VARCHAR(50),
    status VARCHAR(20) DEFAULT 'RUNNING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 提示词变体表
CREATE TABLE prompt_variants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    test_id BIGINT NOT NULL,
    prompt_content TEXT NOT NULL,
    variant_name VARCHAR(50),
    execution_count INT DEFAULT 0,
    avg_quality_score DOUBLE,
    avg_response_time INT,
    ai_response TEXT,
    response_rating DOUBLE,
    FOREIGN KEY (test_id) REFERENCES prompt_ab_tests(id)
);

-- 优化历史表
CREATE TABLE prompt_optimize_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    prompt_id BIGINT,
    original_prompt TEXT,
    optimized_prompt TEXT,
    optimize_reason TEXT,
    model_used VARCHAR(50),
    quality_improvement DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id)
);
```

---

## 4. 后端API设计

### 4.1 提示词生成与优化

```java
@RestController
@RequestMapping("/api/prompt-optimizer")
public class PromptOptimizerController {

    // 1. 生成初始提示词
    // POST /api/prompt-optimizer/generate
    // Request: { taskDescription: string, model: string, context?: string }
    // Response: { generatedPrompt: string, suggestions: string[] }

    // 2. 优化提示词
    // POST /api/prompt-optimizer/optimize
    // Request: { currentPrompt: string, feedback: string, model: string }
    // Response: { optimizedPrompt: string, improvements: string[], qualityBefore: double, qualityAfter: double }

    // 3. 流式生成（SSE）
    // GET /api/prompt-optimizer/generate-stream?task=xxx&model=xxx
    // Response: text/stream (流式返回生成内容)

    // 4. 评估提示词质量
    // POST /api/prompt-optimizer/evaluate
    // Request: { prompt: string, model: string }
    // Response: { qualityScore: double, issues: string[], suggestions: string[] }
}
```

### 4.2 模板库管理

```java
@RestController
@RequestMapping("/api/prompt-templates")
public class PromptTemplateController {

    // 1. 获取模板列表
    // GET /api/prompt-templates?category=xxx&tags=xxx&page=0&size=20
    // Response: { content: [...], totalElements: 100 }

    // 2. 获取模板详情
    // GET /api/prompt-templates/{id}
    // Response: PromptTemplate对象

    // 3. 使用模板（填充变量）
    // POST /api/prompt-templates/{id}/apply
    // Request: { variables: { key: value } }
    // Response: { filledPrompt: string }

    // 4. 保存自定义模板
    // POST /api/prompt-templates
    // Request: PromptTemplate对象
    // Response: 创建的模板ID

    // 5. 更新模板使用次数
    // POST /api/prompt-templates/{id}/use
}
```

### 4.3 提示词管理

```java
@RestController
@RequestMapping("/api/prompts")
public class PromptManagementController {

    // 1. 保存提示词
    // POST /api/prompts
    // Request: { title, content, category, tags, model }
    // Response: 创建的提示词ID

    // 2. 获取我的提示词列表
    // GET /api/prompts?category=xxx&tags=xxx&keyword=xxx
    // Response: { content: [...], totalElements: 50 }

    // 3. 获取提示词详情
    // GET /api/prompts/{id}
    // Response: Prompt对象

    // 4. 获取提示词版本历史
    // GET /api/prompts/{id}/versions
    // Response: [Prompt版本列表]

    // 5. 搜索提示词
    // GET /api/prompts/search?q=keyword
    // Response: 搜索结果列表

    // 6. 删除提示词
    // DELETE /api/prompts/{id}
}
```

### 4.4 A/B测试

```java
@RestController
@RequestMapping("/api/prompt-abtest")
public class ABTestController {

    // 1. 创建A/B测试
    // POST /api/prompt-abtest/create
    // Request: { testName, taskDescription, variants: [{ content, name }], model }
    // Response: { testId, status }

    // 2. 执行测试
    // POST /api/prompt-abtest/{testId}/execute
    // Request: { variantId: string }
    // Response: { aiResponse, executionTime, qualityScore }

    // 3. 获取测试结果
    // GET /api/prompt-abtest/{testId}/results
    // Response: { testId, variants: [{ name, avgScore, avgTime, response }] }

    // 4. 获取测试列表
    // GET /api/prompt-abtest?status=RUNNING
    // Response: 测试列表
}
```

---

## 5. 前端组件设计

### 5.1 页面结构

```
/prompt-optimizer                    # 主页面
├── 主工作区
│   ├── 任务描述输入区
│   ├── 模型选择器
│   ├── 生成按钮 + 流式输出区
│   └── 快速优化按钮 + 优化结果
├── 右侧面板
│   ├── 模板库快捷入口
│   ├── 我的提示词
│   └── A/B测试入口
└── 底部面板
    └── 效果预览区（对比展示）

/prompt-optimizer/templates          # 模板库页面
├── 分类导航
├── 搜索和筛选
├── 模板卡片列表
└── 模板详情弹窗

/prompt-optimizer/my-prompts         # 我的提示词
├── 提示词列表（卡片/表格）
├── 标签筛选
├── 搜索框
└── 操作按钮（编辑、删除、新建版本）

/prompt-optimizer/ab-test           # A/B测试页面
├── 测试创建向导
├── 测试列表
├── 测试执行区
└── 结果对比展示
```

### 5.2 核心组件

```typescript
// 1. 主编辑器组件
interface PromptEditorProps {
  onGenerate: (task: string, model: string) => Promise<void>;
  onOptimize: (currentPrompt: string, feedback: string) => Promise<void>;
  models: ModelOption[];
  isGenerating: boolean;
  isOptimizing: boolean;
}

// 2. 模型选择器组件
interface ModelSelectorProps {
  models: ModelOption[];
  selectedModel: string;
  onModelChange: (model: string) => void;
}

// 3. 模板库组件
interface TemplateLibraryProps {
  category?: string;
  tags?: string[];
  onSelectTemplate: (template: PromptTemplate) => void;
}

// 4. 效果预览组件
interface EffectPreviewProps {
  originalPrompt: string;
  optimizedPrompt: string;
  model: string;
  onCompare: () => Promise<CompareResult>;
}

// 5. A/B测试组件
interface ABTestViewProps {
  testId?: string;
  onCreateTest: (config: TestConfig) => Promise<string>;
  onExecuteTest: (testId: string, variantId: string) => Promise<TestResult>;
}

// 6. 提示词管理组件
interface PromptManagementProps {
  prompts: Prompt[];
  onSave: (prompt: Prompt) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onSearch: (keyword: string) => void;
}
```

---

## 6. 核心算法设计

### 6.1 提示词生成算法

```
输入: taskDescription, model, context
输出: generatedPrompt, suggestions

算法流程:
1. 任务分析
   - 识别任务类型（写作、编程、分析、创意等）
   - 提取关键要素（主题、约束、输出格式等）

2. 模板匹配
   - 从模板库中检索相似任务模板
   - 选择最佳匹配模板作为基础

3. 上下文增强
   - 根据用户提供的历史数据、偏好进行个性化
   - 注入领域知识（如编程风格、行业术语）

4. 提示词构建
   - 应用提示词工程最佳实践
   - 使用CoT（思维链）、Few-shot等技巧
   - 添加角色设定、任务说明、输出要求

5. 质量评估
   - 使用启发式规则评估生成质量
   - 返回改进建议
```

### 6.2 提示词优化算法

```
输入: currentPrompt, userFeedback, model
输出: optimizedPrompt, improvements, qualityBefore, qualityAfter

算法流程:
1. 问题诊断
   - 分析当前提示词的潜在问题
   - 使用AI评估提示词质量（清晰度、完整性、 specificity）

2. 优化策略选择
   - 缺少上下文 → 增加背景信息
   - 指令模糊 → 明确任务要求
   - 缺少示例 → 添加Few-shot示例
   - 输出格式不明 → 指定输出格式
   - 角色不清 → 增加角色设定

3. AI辅助改写
   - 将问题和用户反馈作为输入
   - 调用AI模型生成优化版本
   - 应用多个优化策略，生成多个候选

4. 质量对比
   - 评估优化前后质量分数
   - 确保质量提升才采用

5. 改进说明
   - 生成详细的改进点说明
   - 展示优化前后对比
```

### 6.3 提示词质量评估

```
评估维度:
1. 清晰度 (Clarity): 指令是否明确无歧义
2. 完整性 (Completeness): 是否包含必要信息
3. 具体性 (Specificity): 是否有具体细节和约束
4. 结构化 (Structure): 是否有良好的组织结构
5. 上下文 (Context): 是否提供足够背景

评估方法:
- 规则评估: 基于启发式规则的快速评分
- AI评估: 使用小模型进行深度评估
- 用户反馈: 收集实际使用效果数据

质量分数 = weighted_sum(各维度分数)
```

### 6.4 A/B测试执行流程

```
1. 创建测试
   - 定义测试任务
   - 创建2-5个提示词变体
   - 选择测试模型

2. 执行测试
   - 对每个变体执行N次（建议3-5次）
   - 记录每次的响应质量和时间
   - 使用相同种子确保可重复性

3. 结果分析
   - 计算每个变体的平均质量分数
   - 统计响应时间分布
   - 使用统计显著性检验

4. 报告生成
   - 生成可视化对比图表
   - 给出最优变体推荐
   - 提供改进建议
```

---

## 7. 多模型支持设计

### 7.1 模型配置扩展

```yaml
# application.yml
spring:
  ai:
    # DeepSeek配置（已有）
    openai:
      api-key: ${DEEPSEEK_API_KEY}
      base-url: https://api.deepseek.com
      chat:
        options:
          model: deepseek-chat
          temperature: 0.7

    # 豆包配置（新增）
    doubao:
      api-key: ${DOUBAO_API_KEY}
      base-url: https://ark.cn-beijing.volces.com/api/v3
      chat:
        options:
          model: ep-20241205113451-w8ggm
          temperature: 0.7

    # 智谱GLM配置（新增）
    glm:
      api-key: ${GLM_API_KEY}
      base-url: https://open.bigmodel.cn/api/paas/v4
      chat:
        options:
          model: glm-4-flash
          temperature: 0.7
```

### 7.2 模型服务工厂

```java
@Service
public class ModelClientFactory {

    private final Map<String, ChatClient> clientMap = new HashMap<>();

    @PostConstruct
    public void init() {
        // 初始化DeepSeek客户端
        ChatClient deepSeekClient = ChatClient.builder(buildDeepSeekOptions()).build();
        clientMap.put("deepseek", deepSeekClient);

        // 初始化豆包客户端
        ChatClient doubaoClient = ChatClient.builder(buildDoubaoOptions()).build();
        clientMap.put("doubao", doubaoClient);

        // 初始化GLM客户端
        ChatClient glmClient = ChatClient.builder(glmOptions()).build();
        clientMap.put("glm", glmClient);
    }

    public ChatClient getClient(String model) {
        return clientMap.getOrDefault(model, clientMap.get("deepseek"));
    }
}
```

---

## 8. 缓存策略设计

### 8.1 缓存层次

```
1. 提示词生成缓存
   - Key: hash(taskDescription + model)
   - TTL: 7天
   - 用途: 相同任务快速返回

2. 模板库缓存
   - Key: "templates:" + category
   - TTL: 1天
   - 用途: 减少数据库查询

3. 质量评估缓存
   - Key: hash(prompt + model)
   - TTL: 30天
   - 用途: 避免重复评估

4. A/B测试结果缓存
   - Key: "abtest:" + testId
   - TTL: 永久（直到测试删除）
```

### 8.2 缓存配置

```java
@Bean
public CacheManager cacheManager() {
    CaffeineCacheManager cacheManager = new CaffeineCacheManager();
    cacheManager.setCaffeine(Caffeine.newBuilder()
            .expireAfterWrite(1, TimeUnit.DAYS)
            .maximumSize(1000));
    cacheManager.setCacheNames(Arrays.asList(
            "promptGenerate",    // 提示词生成缓存
            "promptTemplates",   // 模板库缓存
            "promptEvaluate",    // 质量评估缓存
            "abTestResults",     // A/B测试结果缓存
            "concepts",          // 概念解释缓存（已有）
            "conceptComparisons" // 概念比较缓存（已有）
    ));
    return cacheManager;
}
```

---

## 9. 前端状态管理

### 9.1 状态结构

```typescript
interface PromptOptimizerState {
  // 编辑器状态
  currentPrompt: string;
  taskDescription: string;
  selectedModel: string;
  isGenerating: boolean;
  isOptimizing: boolean;

  // 模板状态
  templates: PromptTemplate[];
  selectedTemplate: PromptTemplate | null;

  // 我的提示词
  myPrompts: Prompt[];
  currentPromptId: number | null;

  // A/B测试
  currentTest: ABTest | null;
  testResults: TestResult[];

  // 效果预览
  compareResult: CompareResult | null;
}
```

### 9.2 API调用封装

```typescript
// src/services/promptOptimizerApi.ts
export const promptOptimizerApi = {
  // 生成提示词
  generate: async (task: string, model: string) => {
    return fetch('/api/prompt-optimizer/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskDescription: task, model })
    }).then(r => r.json());
  },

  // 流式生成
  generateStream: async (task: string, model: string, onChunk: (chunk: string) => void) => {
    const response = await fetch(`/api/prompt-optimizer/generate-stream?task=${encodeURIComponent(task)}&model=${model}`);
    const reader = response.body?.getReader();
    // ... 流式处理逻辑
  },

  // 优化提示词
  optimize: async (prompt: string, feedback: string, model: string) => {
    return fetch('/api/prompt-optimizer/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPrompt: prompt, feedback, model })
    }).then(r => r.json());
  },

  // 获取模板列表
  getTemplates: async (category?: string, tags?: string[]) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (tags) tags.forEach(t => params.append('tags', t));
    return fetch(`/api/prompt-templates?${params}`).then(r => r.json());
  },

  // 保存提示词
  savePrompt: async (prompt: Partial<Prompt>) => {
    return fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt)
    }).then(r => r.json());
  },

  // 创建A/B测试
  createABTest: async (config: TestConfig) => {
    return fetch('/api/prompt-abtest/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    }).then(r => r.json());
  },

  // 执行A/B测试
  executeABTest: async (testId: string, variantId: string) => {
    return fetch(`/api/prompt-abtest/${testId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId })
    }).then(r => r.json());
  }
};
```

---

## 10. 实施计划

### Phase 1: MVP核心功能（2周）
- [ ] 提示词生成（任务描述 → 提示词）
- [ ] 提示词快速优化
- [ ] 基础模板库（10-20个官方模板）
- [ ] 模型选择（DeepSeek）
- [ ] 简单的保存和管理

### Phase 2: 增强功能（2周）
- [ ] 多模型支持（豆包、GLM）
- [ ] 流式生成
- [ ] 提示词质量评估
- [ ] 标签和分类管理
- [ ] 搜索功能

### Phase 3: 高级功能（2周）
- [ ] A/B测试
- [ ] 版本控制
- [ ] 效果预览对比
- [ ] 使用数据分析
- [ ] 自定义模板保存

### Phase 4: 优化和迭代（1周）
- [ ] 性能优化
- [ ] 用户体验优化
- [ ] 数据埋点和分析
- [ ] 文档完善

---

## 11. 技术依赖

### 后端新增依赖

```xml
<!-- pom.xml -->
<dependencies>
    <!-- 已有依赖 -->
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-starter-model-openai</artifactId>
    </dependency>

    <!-- 新增：流式响应支持 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>
</dependencies>
```

### 前端新增依赖

```json
{
  "dependencies": {
    "react-markdown": "^9.0.0",        // 已有
    "diff2html": "^3.4.0",             // 新增：文本对比展示
    "recharts": "^2.10.0",             // 新增：A/B测试图表
    "react-hot-toast": "^2.4.0"        // 新增：消息提示
  }
}
```

---

## 12. 关键技术点

### 12.1 流式生成实现

```java
@GetMapping(value = "/generate-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
Flux<String> generateStream(@RequestParam String task, @RequestParam String model) {
    ChatClient client = modelClientFactory.getClient(model);

    return client.prompt()
            .user(buildPrompt(task))
            .stream()
            .content()
            .map(chunk -> {
                // 转换为SSE格式
                return "data: " + chunk + "\n\n";
            });
}
```

### 12.2 提示词工程最佳实践模板

```java
private static final String PROMPT_ENGINEERING_TEMPLATE = """
    你是一个专业的提示词工程师。请根据以下要求生成高质量的提示词：

    ## 任务描述
    {taskDescription}

    ## 提示词结构要求
    1. 角色设定：明确AI的角色和身份
    2. 背景上下文：提供必要的背景信息
    3. 任务说明：清晰描述需要完成的任务
    4. 输出要求：明确指定输出格式和要求
    5. 约束条件：列出需要遵守的约束
    6. 示例（可选）：提供Few-shot示例

    ## 质量标准
    - 指令清晰无歧义
    - 信息完整具体
    - 结构合理层次分明
    - 包含适当的上下文
    - 有明确的输出格式

    请直接输出优化后的提示词，不需要额外解释。
    """;
```

### 12.3 版本控制实现

```java
public Prompt createNewVersion(Long promptId, String newContent) {
    Prompt original = promptRepository.findById(promptId).orElseThrow();

    Prompt newVersion = new Prompt();
    newVersion.setTitle(original.getTitle());
    newVersion.setContent(newContent);
    newVersion.setCategory(original.getCategory());
    newVersion.setTags(original.getTags());
    newVersion.setModel(original.getModel());
    newVersion.setVersion(original.getVersion() + 1);
    newVersion.setParentId(promptId);
    newVersion.setCreatedBy(SessionUtils.getCurrentUserId());

    return promptRepository.save(newVersion);
}
```

---

## 13. 安全和性能考虑

### 13.1 安全措施
- API密钥安全存储（环境变量）
- 用户输入验证和清理
- 速率限制（防止滥用）
- 敏感信息过滤

### 13.2 性能优化
- 多级缓存策略
- 异步处理（流式生成）
- 数据库索引优化
- CDN加速静态资源

### 13.3 成本控制
- 缓存优先策略
- 智能模型选择（简单任务用小模型）
- Token使用监控
- 请求频率限制

---

## 14. 监控和指标

### 14.1 业务指标
- 提示词生成次数
- 优化成功率
- 模板使用率
- A/B测试参与度
- 用户留存率

### 14.2 技术指标
- API响应时间
- 缓存命中率
- 模型调用次数
- 错误率
- Token消耗量

### 14.3 Prometheus指标配置

```java
@Service
public class MetricsService {

    private final Counter promptGenerateCounter;
    private final Counter promptOptimizeCounter;
    private final Timer promptGenerateTimer;

    @Autowired
    public MetricsService(MeterRegistry registry) {
        this.promptGenerateCounter = Counter.builder("prompt_generate_total")
                .description("Total prompt generations")
                .tag("model", "all")
                .register(registry);

        this.promptOptimizeCounter = Counter.builder("prompt_optimize_total")
                .description("Total prompt optimizations")
                .register(registry);

        this.promptGenerateTimer = Timer.builder("prompt_generate_duration")
                .description("Prompt generation duration")
                .register(registry);
    }
}
```

---

## 15. 用户界面设计要点

### 15.1 主界面布局
```
+----------------------------------------------------------+
|  [返回] 提示词优化器              [模型选择器▼] [刷新]  |
+----------------------------------------------------------+
|  任务描述                                                  |
|  [输入框：简要描述你的任务...]                             |
|                                    [生成Prompt按钮]       |
+----------------------------------------------------------+
|  生成的Prompt                              [优化按钮]     |
|  +----------------------------------------------------+  |
|  | 你是一个专业的AI助手...                           |  |
|  | [流式展示生成内容]                                |  |
|  +----------------------------------------------------+  |
+----------------------------------------------------------+
|  优化建议                                                  |
|  • 增加更多上下文信息                                      |
|  • 添加输出格式要求                                        |
+----------------------------------------------------------+
```

### 15.2 交互流程
1. 用户输入任务描述 → 选择模型 → 点击生成
2. 流式展示生成的提示词
3. 用户可点击"优化"提供反馈
4. 展示优化前后对比
5. 保存到"我的提示词"或使用模板

---

## 16. 总结

本技术方案基于项目现有的Spring AI架构，通过模块化设计实现提示词优化功能。核心特点：

1. **复用现有架构**：基于Spring AI ChatClient，无缝集成
2. **多模型支持**：统一接口支持DeepSeek、豆包、GLM等
3. **缓存优化**：多级缓存减少API调用成本
4. **模块化设计**：各功能模块独立，易于扩展
5. **数据驱动**：A/B测试、质量评估提供量化依据
6. **用户体验**：流式生成、实时预览、可视化对比

实施优先级建议：
- Phase 1（MVP）快速验证核心价值
- Phase 2-3逐步完善功能
- Phase 4优化和迭代

预期收益：
- 降低AI使用门槛
- 提升提示词质量
- 沉淀提示词资产
- 数据驱动优化
