---
title: "Agent与Function Calling入门"
description: "理解大模型Agent的核心机制：Function Calling原理、ReAct模式、多Agent协作与MCP协议。"
tags: ["Agent", "Function Calling", "ReAct", "MCP", "LLM"]
difficulty: "进阶"
readTime: 16
order: 4
author: "degang"
createdAt: "2026-09-25"
updatedAt: "2026-09-25"
---

# Agent与Function Calling入门

如果说 RAG 让大模型"有据可依"，那 Agent 就是让大模型"有事可做"。Agent = **LLM + 工具 + 循环**：模型不再只输出文字，而是能决定调用什么工具、观察结果、继续下一步，直到完成任务。

## Function Calling：Agent的基石

### 工作原理

Function Calling（工具调用）的本质是一次**结构化输出约定**：

1. 你把工具的**名称、描述、参数 Schema（JSON Schema）**随请求发给模型
2. 模型判断需要调用工具时，不输出自然语言，而是输出一个结构化的调用请求（工具名 + 参数）
3. **你的代码**执行真正的函数调用（查数据库、调 API……）
4. 把执行结果作为消息回传给模型，模型继续推理

关键认知：**模型从不执行任何函数，它只负责"决定调什么、传什么参数"，执行永远发生在你的代码里**。这也是安全边界的所在。

### 最小示例

```python
from openai import OpenAI

client = OpenAI()

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "查询指定城市的当前天气",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "城市名，如：北京"},
            },
            "required": ["city"],
        },
    },
}]

messages = [{"role": "user", "content": "北京今天适合穿什么？"}]
resp = client.chat.completions.create(
    model="gpt-5.5", messages=messages, tools=tools
)

# 模型决定调用工具
tool_call = resp.choices[0].message.tool_calls[0]
# tool_call.function.name  == "get_weather"
# tool_call.function.arguments == '{"city": "北京"}'

# 你的代码执行真正逻辑（模型只产出参数）
result = get_weather(**json.loads(tool_call.function.arguments))

# 回传结果，让模型继续生成最终回答
messages.append(resp.choices[0].message)
messages.append({"role": "tool", "tool_call_id": tool_call.id,
                 "content": json.dumps(result)})
final = client.chat.completions.create(
    model="gpt-5.5", messages=messages, tools=tools
)
```

## 从工具调用到Agent：加上循环

单次工具调用只是"问一句答一句"。Agent 的区别在于**把"推理 → 调用 → 观察"放进一个循环**，直到模型认为任务完成：

```
while True:
    resp = LLM(messages, tools)
    if resp 不包含工具调用:
        return resp  # 任务完成
    for call in resp.tool_calls:
        result = execute(call)
        messages.append(observation(result))
```

这就是 Agent 的全部骨架。剩下的复杂度都在"循环里的策略"。

### ReAct模式

ReAct（Reasoning + Acting）是最经典的 Agent 范式，让模型显式地交替输出：

```
Thought: 我需要先查北京的天气，再给出穿衣建议
Action: get_weather(city="北京")
Observation: 晴，-2°C，西北风3级
Thought: 已经拿到天气信息，可以回答了
Answer: 北京今天晴、零下2度且有风，建议穿羽绒服……
```

推理（Thought）让每一步行动有依据，行动（Action）获取新信息，观察（Observation）反哺下一步推理。相比直接输出，ReAct 大幅减少了复杂任务的出错率。

## 多Agent协作

单 Agent 复杂任务容易"一条道走到黑"，多 Agent 模式通过分工提升质量：

- **主管-执行者（Supervisor）**：一个"经理"Agent 负责拆解和分派任务，多个"专员"Agent 各有所长（搜索、写代码、写文案）
- **流水线（Pipeline）**：写手 → 审稿人 → 修订者，通过角色对抗提升产出质量
- **辩论（Debate）**：多个 Agent 独立作答再互相挑错，适合需要严谨推理的场景

实用建议：**能单 Agent 解决就不要上多 Agent**。每多一个 Agent，成本和不可控性都会指数级上升。

## MCP：工具生态的标准化

MCP（Model Context Protocol）是 2024 年底 Anthropic 推出的开放协议，解决一个痛点：**每接入一个新工具给一个新应用，都要重写一遍适配代码**——"应用 × 工具"的组合数带来的是乘法级的重复劳动。

MCP 把工具提供方（MCP Server）和 AI 应用（MCP Client）解耦：

- 工具方实现一次 MCP Server（如：数据库查询、浏览器操作、GitHub）
- 任何支持 MCP 的 AI 应用都能即插即用这些工具
- 类比：USB-C 接口——设备（工具）和电脑（AI应用）各自遵循标准即可互通

Claude、Cursor 等主流工具都已支持 MCP，"给 Agent 生态写工具"正在成为新的开发方向。

## 现实挑战

- **可靠性**：多步任务错误会级联，步数越多成功率越低——把任务拆小是第一原则
- **成本与延迟**：每一轮循环都是一次完整的 LLM 调用，注意设置最大迭代次数
- **死循环**：模型可能反复调用同一工具，需要检测和熔断机制
- **安全**：工具执行要有权限控制和沙箱，永远不要让模型直接决定"执行删除"这类高危操作

## 小结

Agent 的核心不神秘：**Function Calling 提供手和脚，循环提供自主性，Prompt 提供目标**。入门路径建议：先吃透 Function Calling 的消息流转 → 手写一个 ReAct 循环 → 再用框架提效（Python 侧用 LangChain 的 `create_agent`，OpenAI 侧用 Responses API + Agents SDK）。工具是 Agent 的边界——模型能力再强，没有好工具也做不成事。

> 顺带提醒：OpenAI 的 **Assistants API 已于 2026 年 8 月 26 日正式停服**，官方迁移路径是 Responses API + Conversations API，不要再基于 Assistants 做新项目。
