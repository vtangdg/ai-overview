---
title: "MCP实战：让AI应用接入万物的标准协议"
description: "理解Model Context Protocol的架构与三原语，手写一个最小MCP Server，并搞清它和Function Calling的关系。"
tags: ["MCP", "Agent", "工具调用", "协议", "实战"]
difficulty: "进阶"
readTime: 14
order: 4
author: "degang"
createdAt: "2026-09-16"
updatedAt: "2026-09-16"
---

# MCP实战：让AI应用接入万物的标准协议

MCP（Model Context Protocol，模型上下文协议）是 Anthropic 在 2024 年底开源、如今已被主流 AI 应用广泛采纳的标准协议。它解决的是一个集成层的古老痛点：

**没有 MCP 的世界**：M 个 AI 应用要接 N 个数据源/工具，每个应用给每个工具写一遍适配——M×N 的集成成本，且全是重复劳动。

**有 MCP 的世界**：工具方实现一次 MCP Server，所有支持 MCP 的应用都能直接用——集成成本降为 M+N。

本质上，**MCP 之于 AI 工具调用，就像 USB 之于外设**：统一接口，即插即用。

## 架构：三个角色

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│  MCP Host    │      │  MCP Client  │      │  MCP Server  │
│ (Claude等    │◄────▶│  (1:1连接)    │◄────▶│ (文件/数据库/  │
│  AI应用本体) │      │              │      │  你的API封装) │
└─────────────┘      └──────────────┘      └──────────────┘
```

- **Host**：AI 应用本体（Claude Desktop、各类 IDE、你自己的 Agent），负责与模型对话
- **Client**：Host 内部与某个 Server 保持 1:1 连接的中间层
- **Server**：能力的提供方——一个暴露"工具/资源/提示"的轻量服务，可以是本地进程（stdio）或远程服务（HTTP/SSE）

## Server 的三种能力（三原语）

| 原语 | 作用 | 类比 |
|------|------|------|
| **Tools** | 模型可以"调用执行"的操作（查库、发消息、创建工单） | POST 接口 |
| **Resources** | 模型可以"读取"的上下文数据（文件、配置、记录） | GET 接口 |
| **Prompts** | 预置的提示模板，引导用户完成特定任务 | 快捷指令 |

日常说"MCP 工具"主要指第一个：**Tools**。Server 只需要声明"我有什么工具、参数是什么"，模型就会在需要时决定调用——执行仍发生在 Server 侧，数据不必交给模型厂商。

## 动手：一个最小的 MCP Server

以官方 Python SDK 为例，用装饰器把一个函数变成 MCP 工具：

```python
# pip install "mcp[cli]"
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("team-tools")

@mcp.tool()
def get_oncall(date: str) -> str:
    """查询某天（YYYY-MM-DD）的值班同学姓名和联系方式"""
    return db.query("SELECT name, phone FROM oncall WHERE date = ?", date)

@mcp.tool()
def create_ticket(title: str, priority: str = "P2") -> str:
    """创建一个运维工单，priority 可选 P0/P1/P2"""
    ticket_id = jira.create(title=title, priority=priority)
    return f"工单已创建：{ticket_id}"

if __name__ == "__main__":
    mcp.run()   # stdio 模式，供本地 Host 拉起
```

注意两个写法细节，**工具的描述（docstring）和参数名就是给模型看的接口文档**：

- docstring 写"什么时候该用我"（`查询某天的值班同学`），而不是"我怎么实现的"
- 参数名语义化（`date` 而不是 `arg1`），可选参数给默认值
- 返回值是人类可读的字符串，不要丢一个原始 JSON 对象给模型

写完在 Claude Desktop（或任何支持 MCP 的 Host）配置里注册，重启后模型就能回答"明天谁值班"并自动调用你的工具。

## 和 Function Calling 是什么关系？

这是最容易混淆的一点，直接给结论：

- **Function Calling 是模型层的能力**：大模型输出结构化的"我要调用某工具"的意图（见 [Agent与Function Calling](/notes/04-agent-function-calling)）
- **MCP 是集成层的协议**：规定"工具怎么被发现、怎么被描述、怎么被调用、结果怎么回传"

两者是上下游关系，不冲突。你自己写 Agent 时可以完全不用 MCP，直接在代码里注册工具；但**当工具需要跨应用复用、或想让生态里现成的 MCP Server 为你所用时**，MCP 的标准化价值就显现了。

## 安全：MCP 的"USB 接口"也在插 U 盘

工具一旦接入，模型就可能高频、自动地调用它——MCP Server 相当于给外部 AI 开了一个通往你系统的口子，安全上必须当真：

- **最小权限**：一个 Server 只暴露一类职责的工具，只读和写操作分开部署
- **鉴权与审计**：远程 Server 必须验证调用方身份，本地 Server 至少记录每次调用日志
- **危险操作加闸**：删除、转账、发邮件类工具，在 Server 侧加二次确认（human-in-the-loop），别指望模型自己"懂事"
- **第三方 Server 当依赖包审**：供应链投毒已出现过真实案例，接入前看清楚代码要访问什么

## 常见误区

- **"MCP = 只能接 Claude"**：协议是开放标准，主流 AI 应用和 Agent 框架都已支持，自己写的 Agent 也能当 Host
- **"工具越多越好"**：一次塞给模型 50 个工具，选择准确率会明显下降——按场景拆分 Server，让每个会话只挂相关的几个
- **"MCP 替代了 RAG"**：MCP 是拿数据的通道，RAG 是检索的方法；"用 MCP 工具触发一次 RAG 查询"是常见组合，见 [RAG从零到一](/notes/03-rag-basics)

## 小结

MCP 把 AI 应用的工具接入从"逐个适配的手工业"变成了"标准接口的流水线"：**Tools 暴露动作、Resources 暴露数据、Prompts 暴露模板，Host 负责调度，Server 负责执行与安全**。

上手路径建议：先用现成 MCP Server（文件系统、数据库、GitHub）体会 Host + Server 的协作，再把自己的内部 API 封装成 Server——这一步走完，你离 [Agent 化企业系统](/notes/06-agentize-spring-services) 就只差工程治理了。
