# 提示词优化器 - 快捷版设计方案

## 1. 产品定位

**极简的提示词生成和优化工具**，3步搞定高质量提示词：
1. 输入任务描述
2. AI生成初始提示词
3. 一键优化改进

---

## 2. 功能清单

### 核心功能
- ✅ 提示词生成（流式输出）
- ✅ 快速优化（输入反馈意见）
- ✅ 多模型选择（DeepSeek、豆包、GLM）
- ✅ 精选模板库（10-20个常用模板）
- ✅ 本地保存（浏览器localStorage）

### 不做的功能
- ❌ A/B测试
- ❌ 版本控制
- ❌ 用户登录系统
- ❌ 效果预览对比
- ❌ 使用统计分析
- ❌ 复杂标签系统
- ❌ 搜索功能

---

## 3. 界面设计

```
+--------------------------------------------------------------+
|  提示词优化器                           [模型: DeepSeek ▼]  |
+--------------------------------------------------------------+
|                                                              |
|  任务描述                                                    |
|  +--------------------------------------------------------+  |
|  | 请帮我写一个Python爬虫，爬取知乎热榜                    |  |
|  |                                                        |  |
|  +--------------------------------------------------------+  |
|                                                              |
|                        [生成提示词]                         |
|                                                              |
+--------------------------------------------------------------+
                                                              ↓ 生成后
+--------------------------------------------------------------+
|  生成的提示词                              [复制] [优化]     |
|  +--------------------------------------------------------+  |
|  | 你是一个专业的Python开发工程师...                       |  |
|  |                                                        |  |
|  | # 任务                                                 |  |
|  | 请编写一个Python爬虫程序，从知乎获取热榜数据...        |  |
|  |                                                        |  |
|  | # 要求                                                 |  |
|  | - 使用requests库                                       |  |
|  | - 数据保存为CSV格式                                    |  |
|  | - 添加异常处理                                         |  |
|  +--------------------------------------------------------+  |
+--------------------------------------------------------------+
                                                              ↓ 点击优化
+--------------------------------------------------------------+
|  优化意见（可选）                                            |
|  +--------------------------------------------------------+  |
|  | 希望加上反爬处理和代理设置                             |  |
|  +--------------------------------------------------------+  |
|                        [开始优化]                          |
+--------------------------------------------------------------+
```

---

## 4. 后端实现

### 4.1 目录结构

```
backend/ai-demo/src/main/java/.../aidemo/
├── controller/
│   └── PromptOptimizerController.java      # 唯一控制器
├── service/
│   └── PromptOptimizerService.java         # 唯一服务
└── model/
    └── dto/
        ├── GenerateRequest.java            # 生成请求
        ├── OptimizeRequest.java            # 优化请求
        └── PromptResponse.java             # 响应DTO
```

### 4.2 Controller

```java
@RestController
@RequestMapping("/api/prompt-optimizer")
@CrossOrigin(origins = "*")
public class PromptOptimizerController {

    @Autowired
    private PromptOptimizerService optimizerService;

    /**
     * 生成提示词
     */
    @PostMapping("/generate")
    public ResponseEntity<PromptResponse> generate(@RequestBody GenerateRequest request) {
        PromptResponse response = optimizerService.generatePrompt(
            request.getTask(),
            request.getModel()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * 流式生成提示词（SSE）
     */
    @GetMapping(value = "/generate-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> generateStream(
            @RequestParam String task,
            @RequestParam(defaultValue = "deepseek") String model) {
        return optimizerService.generatePromptStream(task, model);
    }

    /**
     * 优化提示词
     */
    @PostMapping("/optimize")
    public ResponseEntity<PromptResponse> optimize(@RequestBody OptimizeRequest request) {
        PromptResponse response = optimizerService.optimizePrompt(
            request.getCurrentPrompt(),
            request.getFeedback(),
            request.getModel()
        );
        return ResponseEntity.ok(response);
    }
}
```

### 4.3 Service

```java
@Service
public class PromptOptimizerService {

    private final ChatClient deepSeekClient;
    private final ChatClient doubaoClient;
    private final ChatClient glmClient;

    // 生成提示词的模板
    private static final String GENERATE_PROMPT = """
        你是一个专业的提示词工程师。请根据用户描述的任务，生成一个高质量的提示词。

        用户任务：%s

        要求：
        1. 包含角色设定
        2. 明确任务目标
        3. 列出具体要求
        4. 指定输出格式
        5. 添加必要的约束条件

        请直接输出提示词内容，不要有额外解释。
        """;

    // 优化提示词的模板
    private static final String OPTIMIZE_PROMPT = """
        你是一个专业的提示词优化专家。请根据用户的反馈意见，优化改进以下提示词。

        当前提示词：
        %s

        用户反馈：%s

        请输出优化后的提示词，保持原有结构，只进行针对性改进。
        """;

    public PromptResponse generatePrompt(String task, String model) {
        String prompt = String.format(GENERATE_PROMPT, task);
        String content = getClient(model).prompt()
            .user(prompt)
            .call()
            .content();
        return new PromptResponse(content, null);
    }

    public Flux<String> generatePromptStream(String task, String model) {
        String prompt = String.format(GENERATE_PROMPT, task);
        return getClient(model).prompt()
            .user(prompt)
            .stream()
            .content();
    }

    public PromptResponse optimizePrompt(String currentPrompt, String feedback, String model) {
        String prompt = String.format(OPTIMIZE_PROMPT, currentPrompt,
            feedback != null && !feedback.isEmpty() ? feedback : "请优化这个提示词，提高质量");
        String content = getClient(model).prompt()
            .user(prompt)
            .call()
            .content();
        return new PromptResponse(content, null);
    }

    private ChatClient getClient(String model) {
        return switch (model.toLowerCase()) {
            case "doubao" -> doubaoClient;
            case "glm" -> glmClient;
            default -> deepSeekClient;
        };
    }
}
```

### 4.4 DTO

```java
// 生成请求
public record GenerateRequest(
    String task,
    @DefaultValue("deepseek") String model
) {}

// 优化请求
public record OptimizeRequest(
    String currentPrompt,
    String feedback,
    @DefaultValue("deepseek") String model
) {}

// 响应
public record PromptResponse(
    String content,
    String error
) {}
```

### 4.5 配置扩展

```yaml
# application.yml
spring:
  ai:
    # DeepSeek（已有）
    openai:
      api-key: ${DEEPSEEK_API_KEY}
      base-url: https://api.deepseek.com
      chat:
        options:
          model: deepseek-chat
          temperature: 0.7

    # 豆包
    doubao:
      api-key: ${DOUBAO_API_KEY:-}
      base-url: https://ark.cn-beijing.volces.com/api/v3
      chat:
        options:
          model: ep-20241205113451-w8ggm

    # GLM（智谱）
    zhipu:
      api-key: ${GLM_API_KEY:-}
      base-url: https://open.bigmodel.cn/api/paas/v4
      chat:
        options:
          model: glm-4-flash
```

---

## 5. 前端实现

### 5.1 文件结构（风格2：关注点分离）

```
frontend/src/
├── app/
│   └── prompt-optimizer/
│       └── page.tsx                    # 页面入口和组装
│
├── components/
│   └── prompt-optimizer/               # UI组件层
│       ├── PromptEditor.tsx            # 编辑器组件
│       ├── TemplateLibrary.tsx         # 模板库组件
│       └── ModelSelector.tsx           # 模型选择器（可复用）
│
└── features/
    └── prompt-optimizer/               # 业务逻辑层
        └── lib/
            ├── api.ts                  # API调用封装
            ├── templates.ts            # 模板数据
            ├── storage.ts              # localStorage封装
            └── types.ts                # TypeScript类型定义
```

**职责划分：**
- `components/` - UI组件、展示层
- `features/` - 业务逻辑、数据层
- `app/` - 路由和页面组装

### 5.2 类型定义

```typescript
// src/features/prompt-optimizer/lib/types.ts
export interface GenerateRequest {
  task: string;
  model: string;
}

export interface OptimizeRequest {
  currentPrompt: string;
  feedback?: string;
  model: string;
}

export interface PromptResponse {
  content: string;
  error?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
}

export interface PromptTemplate {
  id: number;
  name: string;
  category: string;
  task: string;
  icon: string;
}
```

### 5.3 API 调用封装

```typescript
// src/features/prompt-optimizer/lib/api.ts
import type { GenerateRequest, OptimizeRequest, PromptResponse } from './types';

export const promptOptimizerApi = {
  /**
   * 生成提示词（流式）
   */
  async generateStream(task: string, model: string, onChunk: (chunk: string) => void) {
    const response = await fetch(`/api/prompt-optimizer/generate-stream?` +
      new URLSearchParams({ task, model }));

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('无法获取响应流');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          onChunk(line.slice(6));
        }
      }
    }
  },

  /**
   * 优化提示词
   */
  async optimize(request: OptimizeRequest): Promise<PromptResponse> {
    const response = await fetch('/api/prompt-optimizer/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    return response.json();
  }
};
```

### 5.4 模板数据

```typescript
// src/features/prompt-optimizer/lib/templates.ts
import type { PromptTemplate } from './types';

export const templates: PromptTemplate[] = [
  {
    id: 1,
    name: '代码审查',
    category: '编程',
    task: '请帮我审查以下代码，找出潜在问题和改进建议',
    icon: '🔍'
  },
  {
    id: 2,
    name: '文章写作',
    category: '写作',
    task: '请帮我写一篇关于{主题}的文章，要求结构清晰、内容专业',
    icon: '✍️'
  },
  {
    id: 3,
    name: '数据分析',
    category: '分析',
    task: '请分析以下数据，找出趋势和洞察',
    icon: '📊'
  },
  {
    id: 4,
    name: '问题诊断',
    category: '诊断',
    task: '请帮我分析以下问题出现的原因和解决方案',
    icon: '🔧'
  },
  {
    id: 5,
    name: '学习计划',
    category: '学习',
    task: '请为我制定一个{技能}的学习计划，我是{当前水平}',
    icon: '📚'
  },
  {
    id: 6,
    name: '邮件撰写',
    category: '写作',
    task: '请帮我写一封{类型}邮件，收件人是{对象}，目的是{目的}',
    icon: '📧'
  },
  {
    id: 7,
    name: '方案设计',
    category: '设计',
    task: '请帮我设计一个{产品/功能}的技术方案',
    icon: '📋'
  },
  {
    id: 8,
    name: '简历优化',
    category: '写作',
    task: '请帮我优化简历，突出我的{优势}，应聘{岗位}',
    icon: '💼'
  }
];

export const modelOptions = [
  { id: 'deepseek', name: 'DeepSeek', description: '高性能大语言模型' },
  { id: 'doubao', name: '豆包', description: '字节跳动AI助手' },
  { id: 'glm', name: '智谱GLM', description: '清华大语言模型' }
];
```

### 5.5 主页面

```typescript
// src/app/prompt-optimizer/page.tsx
'use client';

import { useState } from 'react';
import { PromptEditor } from '@/components/prompt-optimizer/PromptEditor';
import { TemplateLibrary } from '@/components/prompt-optimizer/TemplateLibrary';
import { Layout } from '@/components/common';

export default function PromptOptimizerPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold">提示词优化器</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：编辑器 */}
          <div className="lg:col-span-2">
            <PromptEditor initialTemplate={selectedTemplate} />
          </div>

          {/* 右侧：模板库 */}
          <div className="lg:col-span-1">
            <TemplateLibrary onSelect={setSelectedTemplate} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

### 5.6 编辑器组件

```typescript
// src/components/prompt-optimizer/PromptEditor.tsx
'use client';

import { useState, useRef } from 'react';
import { Sparkles, RotateCw, Copy, Check } from 'lucide-react';
import { modelOptions } from '@/features/prompt-optimizer/lib/templates';
import { promptOptimizerApi } from '@/features/prompt-optimizer/lib/api';

interface PromptEditorProps {
  initialTemplate?: string | null;
}

export function PromptEditor({ initialTemplate }: PromptEditorProps) {
  const [task, setTask] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [feedback, setFeedback] = useState('');
  const [selectedModel, setSelectedModel] = useState('deepseek');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // 生成提示词
  const handleGenerate = async () => {
    if (!task.trim()) return;

    setIsGenerating(true);
    setGeneratedPrompt('');

    try {
      await promptOptimizerApi.generateStream(task, selectedModel, (chunk) => {
        setGeneratedPrompt(prev => prev + chunk);
      });
    } catch (error) {
      console.error('生成失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 优化提示词
  const handleOptimize = async () => {
    if (!generatedPrompt) return;

    setIsOptimizing(true);
    try {
      const result = await promptOptimizerApi.optimize({
        currentPrompt: generatedPrompt,
        feedback,
        model: selectedModel
      });
      setGeneratedPrompt(result.content);
      setFeedback('');
    } finally {
      setIsOptimizing(false);
    }
  };

  // 复制到剪贴板
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 任务输入区 */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">1. 描述你的任务</h2>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="例如：帮我写一个Python爬虫，爬取知乎热榜数据..."
          className="w-full h-32 p-4 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* 模型选择 */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">2. 选择AI模型</h2>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {modelOptions.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* 生成按钮 */}
      <button
        onClick={handleGenerate}
        disabled={!task || isGenerating}
        className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <RotateCw className="w-5 h-5 animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            生成提示词
          </>
        )}
      </button>

      {/* 生成结果 */}
      {generatedPrompt && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">3. 生成的提示词</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{generatedPrompt}</pre>
          </div>
        </div>
      )}

      {/* 优化区 */}
      {generatedPrompt && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">4. 快速优化（可选）</h2>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="告诉AI如何改进，例如：增加反爬处理、指定输出格式..."
            className="w-full h-24 p-4 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary mb-4"
          />
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="w-full py-3 bg-secondary text-secondary-foreground rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-secondary/90 disabled:opacity-50"
          >
            {isOptimizing ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                优化中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                优化提示词
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
```

### 5.7 模板库组件

```typescript
// src/components/prompt-optimizer/TemplateLibrary.tsx
'use client';

import { templates } from '@/features/prompt-optimizer/lib/templates';

interface TemplateLibraryProps {
  onSelect: (task: string) => void;
}

export function TemplateLibrary({ onSelect }: TemplateLibraryProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">📝 快速模板</h2>
      <div className="space-y-2">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelect(template.task)}
            className="w-full p-4 text-left border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{template.icon}</span>
              <div>
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-muted-foreground">{template.category}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 6. 本地存储（可选）

如果用户想保存常用提示词：

```typescript
// src/features/prompt-optimizer/lib/storage.ts
const STORAGE_KEY = 'saved_prompts';

export interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  model: string;
  createdAt: string;
}

export function savePrompt(prompt: Omit<SavedPrompt, 'id' | 'createdAt'>) {
  const saved = getSavedPrompts();
  const newPrompt: SavedPrompt = {
    ...prompt,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  saved.unshift(newPrompt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.slice(0, 50))); // 最多50条
}

export function getSavedPrompts(): SavedPrompt[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function deletePrompt(id: string) {
  const saved = getSavedPrompts();
  const filtered = saved.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
```

---

## 7. 实施清单

### 后端（2-3天）
- [ ] `PromptOptimizerService.java` - 核心服务
- [ ] `PromptOptimizerController.java` - API控制器
- [ ] `GenerateRequest.java` - 请求DTO
- [ ] `OptimizeRequest.java` - 优化请求DTO
- [ ] `PromptResponse.java` - 响应DTO
- [ ] 配置多模型支持（DeepSeek、豆包、GLM）
- [ ] 单元测试

### 前端（2-3天）
- [ ] `app/prompt-optimizer/page.tsx` - 主页面
- [ ] `features/prompt-optimizer/lib/types.ts` - 类型定义
- [ ] `features/prompt-optimizer/lib/api.ts` - API封装
- [ ] `features/prompt-optimizer/lib/templates.ts` - 模板数据
- [ ] `features/prompt-optimizer/lib/storage.ts` - 本地存储（可选）
- [ ] `components/prompt-optimizer/PromptEditor.tsx` - 编辑器组件
- [ ] `components/prompt-optimizer/TemplateLibrary.tsx` - 模板库组件
- [ ] `components/prompt-optimizer/ModelSelector.tsx` - 模型选择器（可选）
- [ ] 样式调整

### 联调测试（1天）
- [ ] 流式生成测试
- [ ] 多模型切换测试
- [ ] 优化功能测试
- [ ] 模板选择测试
- [ ] 本地存储测试（可选）

**总计：5-7天**

---

## 8. 技术要点

### 8.1 流式响应处理
```typescript
const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader!.read();
  if (done) break;
  // 处理数据块
}
```

### 8.2 多模型切换
```java
private ChatClient getClient(String model) {
    return switch (model.toLowerCase()) {
        case "doubao" -> doubaoClient;
        case "glm" -> glmClient;
        default -> deepSeekClient;
    };
}
```

### 8.3 优化提示词模板
使用结构化的提示词工程最佳实践，确保生成高质量结果。

---

## 9. 成本估算

假设每天100次使用：
- DeepSeek：约 1000 tokens/次 × 100 = 10万 tokens/天
- 成本：约 ¥0.5/天（DeepSeek定价）

月成本约 ¥15，可忽略不计。

---

## 10. 后续扩展（如果需要）

1. **添加更多模板**：根据用户反馈扩充
2. **提示词分享**：用户可导出/导入提示词
3. **快捷键支持**：Ctrl+Enter 生成
4. **深色模式**：UI优化
5. **使用历史**：localStorage记录最近使用

---

## 11. 总结

**简化版核心特点**：
- 3个文件实现后端（Service、Controller、DTO）
- 3个组件实现前端（Page、Editor、Template）
- 无数据库、无用户系统、无复杂管理
- 开发周期5-7天
- 维护成本极低

**用户体验**：
- 打开即用，无需登录
- 3步生成高质量提示词
- 一键复制，快速使用
- 模板快捷入口
