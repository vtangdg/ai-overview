---
title: "LangChain快速入门"
description: "基于 LangChain 1.x 的入门教程：模型调用、提示词、结构化输出、LCEL、记忆、RAG 与 Agent。"
tags: ["LangChain", "框架", "教程", "RAG", "Agent"]
difficulty: "入门"
readTime: 20
order: 1
author: "degang"
createdAt: "2026-01-19"
updatedAt: "2026-09-28"
---

# LangChain快速入门

LangChain 是构建 LLM 应用最主流的开发框架。它把"调用模型、组织提示词、接入工具、检索知识、维护记忆"这些重复劳动抽象成可组合的组件，让你把精力放在业务逻辑上。

> **版本提示**：本文基于 **LangChain 1.x**（2025 年 10 月发布 GA）。1.0 是一次大幅瘦身：主包 `langchain` 只保留 Agent 相关核心，旧的 Chain、Memory、`RetrievalQA` 等全部移入 `langchain-classic`。如果你在看网上 2024 年之前的教程，代码里的 `LLMChain`、`ConversationBufferMemory`、`initialize_agent` 都已经不是主包 API 了——文末有一张迁移对照表。

## 什么是LangChain？

LangChain 是一个开源框架，旨在帮助开发者快速构建基于 LLM 的应用。它提供了：

- **模型抽象**：统一接口调用不同厂商的 LLM，换模型只改一个字符串
- **提示词模板**：把 Prompt 参数化、可复用、可版本管理
- **LCEL**：用 `|` 把组件串成数据管道，取代了旧版的 Chain
- **检索（RAG）**：文档加载、切分、向量化、检索的一站式组件
- **Agent**：让模型自己决定调用哪些工具、调用几次
- **记忆**：基于 LangGraph 的多轮会话状态管理

## 安装

```bash
pip install langchain langchain-openai   # 核心包 + OpenAI 集成

# 按需安装
pip install langchain-community          # 社区集成（文档加载器、部分向量库）
pip install langchain-text-splitters     # 文本切分
pip install langgraph                    # 状态图 / 会话记忆持久化
pip install langchain-chroma             # Chroma 向量库（可选）
```

LangChain 1.x 要求 **Python 3.10+**。

## 核心概念

### 1. 模型（Models）

v1 推荐用 `init_chat_model` 统一初始化，切换供应商（provider）只需要改字符串：

```python
from langchain.chat_models import init_chat_model

model = init_chat_model("openai:gpt-5.5", temperature=0.7)

# 换供应商（需先装对应集成包）
# model = init_chat_model("anthropic:claude-sonnet-4-6")
# model = init_chat_model("ollama:qwen2.5:7b")

response = model.invoke("什么是机器学习？")
print(response.content)
```

也可以直接用具体类：

```python
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-5.5", temperature=0.7)
```

**一个容易搞混的点**：LangChain 里有 `LLM`（纯文本补全接口）和 `Chat Model`（消息列表接口）两类。现代应用**几乎都用 Chat Model**——它支持 system/user/assistant 角色、工具调用、多模态，带消息历史，能力是纯文本补全接口的超集。本文所有示例都是 Chat Model。

```python
from langchain.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage("你是一个AI助手"),
    HumanMessage("用简单的话解释Transformer"),
]

response = model.invoke(messages)
print(response.content)
```

### 2. 提示词模板（Prompts）

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个{role}"),
    ("human", "{input}"),
])

chain = prompt | model
response = chain.invoke({"role": "Python专家", "input": "解释什么是装饰器"})
print(response.content)
```

`prompt | model` 就是 LCEL 的第一个例子——用管道符把"准备输入"和"调用模型"串起来。

### 3. 结构化输出（Structured Output）

想让模型返回可编程处理的数据，v1 的标准做法是 `with_structured_output` + Pydantic 模型（旧版的 `StructuredOutputParser` 已不再是主包 API）：

```python
from pydantic import BaseModel, Field

class Sentiment(BaseModel):
    sentiment: str = Field(description="情感倾向：positive / negative / neutral")
    confidence: float = Field(description="置信度，0-1 之间")
    keywords: list[str] = Field(description="主要关键词")

structured_model = model.with_structured_output(Sentiment)

result = structured_model.invoke("这个产品太棒了，物流也很快！")
print(result.sentiment, result.confidence, result.keywords)
```

字段的 `description` 会成为给模型看的说明——**字段描述写清楚，比在提示词里啰嗦更有效**。

### 4. 链（Chains）与 LCEL

LCEL（LangChain Expression Language）用 `|` 组合组件，是 v1 里"链"的唯一推荐写法：

```python
from langchain_core.output_parsers import StrOutputParser

chain = prompt | model | StrOutputParser()
print(chain.invoke({"role": "Python专家", "input": "解释装饰器"}))
```

**多步串联**也不需要 `SequentialChain`，直接接管道，上一步的输出自动成为下一步的输入：

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

summary_prompt = ChatPromptTemplate.from_template("用一段话总结以下内容：\n\n{content}")
translate_prompt = ChatPromptTemplate.from_template("把下面这段总结翻译成英文：\n\n{summary}")

summary_chain = summary_prompt | model | StrOutputParser()
translate_chain = translate_prompt | model | StrOutputParser()

# summary_chain 输出的是字符串，用一个小函数包装成 translate_chain 需要的 {summary}
overall = summary_chain | (lambda s: {"summary": s}) | translate_chain

print(overall.invoke({"content": "长文本……"}))
```

LCEL 的好处是**自动流式 + 自动异步 + 自动并行**：把 `invoke` 换成 `stream` / `ainvoke`，整条链都跟着变，不用改结构。

### 5. 记忆（Memory）

v1 里内存模块被移除了，会话记忆统一由 **LangGraph checkpointer** 承担——把记忆挂在 Agent 上即可：

```python
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    model=model,
    tools=[],
    system_prompt="你是一个友好的助手，回答使用中文。",
    checkpointer=InMemorySaver(),      # 记忆存这里（进程内，重启即失）
)

# 同一个 thread_id 就是同一段会话
config = {"configurable": {"thread_id": "user-1"}}

agent.invoke({"messages": [{"role": "user", "content": "我叫张三"}]}, config)
result = agent.invoke({"messages": [{"role": "user", "content": "我叫什么名字？"}]}, config)

print(result["messages"][-1].content)   # 你叫张三
```

生产环境把 `InMemorySaver` 换成数据库版 checkpointer（如 Postgres）即可持久化，接口不变。

### 6. 检索增强生成（RAG）

RAG 需要"加载 → 切分 → 向量化 → 检索 → 生成"五步。前四步是纯数据管道，最后一步用 LCEL 拼装：

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# 1. 加载文档
documents = TextLoader("document.txt").load()

# 2. 切分
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = splitter.split_documents(documents)

# 3. 向量化并入库
vectorstore = Chroma.from_documents(splits, OpenAIEmbeddings())

# 4. 创建检索器
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# 5. 检索 + 生成
prompt = ChatPromptTemplate.from_template(
    "请仅根据以下参考资料回答问题，资料中没有的信息请明确说明。\n\n"
    "参考资料：\n{context}\n\n问题：{question}"
)

def format_docs(docs):
    return "\n\n".join(d.page_content for d in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt | model | StrOutputParser()
)

print(rag_chain.invoke("文档的主要观点是什么？"))
```

`{"context": retriever | format_docs, "question": RunnablePassthrough()}` 这段是 LCEL 的经典写法：**同一个输入分两路走**——一路去检索并拼成上下文，一路原样透传成问题，两路汇合后进 prompt。

### 7. 代理（Agents）

Agent = **模型 + 工具 + 循环**。v1 用 `create_agent` 一行创建，工具用 `@tool` 装饰器定义：

```python
from langchain.agents import create_agent
from langchain.tools import tool

@tool
def search(query: str) -> str:
    """搜索实时信息。当需要新闻、天气、最新数据时使用。"""
    return f"关于「{query}」的搜索结果：……"

agent = create_agent(
    model=model,
    tools=[search],
    system_prompt="你是一个乐于助人的助手。需要实时信息时，调用搜索工具。",
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "今天北京适合穿什么？"}]
})
print(result["messages"][-1].content)
```

**工具能不能被正确调用，取决于函数的 docstring 和参数名**——它们会自动成为模型看到的工具描述。写法上把它当成"写给模型看的 API 文档"。

## 实战示例

### 示例1：文档问答助手（带记忆的 Agentic RAG）

```python
from langchain_community.document_loaders import PyPDFLoader
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.agents import create_agent
from langchain.tools import tool
from langgraph.checkpoint.memory import InMemorySaver

# 建立索引
pages = PyPDFLoader("manual.pdf").load()
vectorstore = FAISS.from_documents(pages, OpenAIEmbeddings())
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# 把检索器包装成工具
@tool
def search_manual(query: str) -> str:
    """在产品手册中检索相关内容。回答手册相关问题时必须先调用它。"""
    docs = retriever.invoke(query)
    return "\n\n".join(d.page_content for d in docs)

# 带记忆的问答 Agent
agent = create_agent(
    model=model,
    tools=[search_manual],
    system_prompt="你是产品手册助手，回答必须基于 search_manual 的检索结果。",
    checkpointer=InMemorySaver(),
)

config = {"configurable": {"thread_id": "doc-qa-1"}}
result = agent.invoke(
    {"messages": [{"role": "user", "content": "如何使用这个产品？"}]},
    config,
)
print(result["messages"][-1].content)
```

这是"Agentic RAG"：模型自己决定检索几次、用什么关键词，比固定流程的 RAG 更灵活，代价是多花几轮 Token。

### 示例2：代码审查助手

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

code_prompt = ChatPromptTemplate.from_template("""
你是一位资深的代码审查专家。

请分析以下{language}代码：

{code}

请提供：
1. 代码质量评估
2. 潜在 bug
3. 优化建议
4. 最佳实践建议
""")

code_chain = code_prompt | model | StrOutputParser()

code = """
def calculate(a, b):
    return a + b
"""

print(code_chain.invoke({"code": code, "language": "Python"}))
```

### 示例3：多语言翻译链

用 `RunnablePassthrough.assign` 在保留原文的同时追加中间结果：

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

detect_prompt = ChatPromptTemplate.from_template("检测以下文本的语言，只返回语言名称：\n{text}")
translate_prompt = ChatPromptTemplate.from_template("把以下{language}文本翻译成英文：\n\n{text}")

detect = detect_prompt | model | StrOutputParser()
translate = translate_prompt | model | StrOutputParser()

# assign 会把 detect 的结果挂到 language 字段，同时保留原始 text
full_chain = RunnablePassthrough.assign(language=detect) | translate

print(full_chain.invoke({"text": "你好世界"}))
```

## 最佳实践

### 1. 错误处理：自动重试

网络抖动、限流在线上很常见，用 `.with_retry()` 统一处理（指数退避 + 抖动，避免重试风暴）：

```python
chain = prompt | model | StrOutputParser()

robust_chain = chain.with_retry(
    stop_after_attempt=3,
    wait_exponential_jitter=True,
)

result = robust_chain.invoke({"role": "助手", "input": "你好"})
```

### 2. 流式输出

`stream` 对任何 LCEL 链都生效，是"首字延迟"体验的关键：

```python
for chunk in model.stream("讲个故事"):
    print(chunk.content, end="", flush=True)
```

### 3. Token 用量与成本

每次响应都带 `usage_metadata`，自己乘单价即可算成本：

```python
resp = model.invoke("你好")
print(resp.usage_metadata)
# {'input_tokens': 12, 'output_tokens': 48, 'total_tokens': 60}
```

线上规模化的观测建议接 **LangSmith** 或 **Langfuse**——两者都能自动记录每一步的输入输出、耗时和 Token，比手工埋点省事得多。

## 常见问题

### Q: 如何选择合适的向量数据库？

- **Chroma**：快速起步，本地开发
- **pgvector**：已有 Postgres 时最省事
- **Qdrant / Milvus**：规模和生产级过滤需求上来后再考虑
- **FAISS**：纯本地、离线批量检索

选型细节见 [向量数据库选型实战](/notes/02-vector-databases)。

### Q: 如何优化 RAG 的检索质量？

1. 优化分块策略（按语义/结构切，而不是死按字数）
2. 混合检索（关键词 + 语义）
3. 重排序（Rerank）
4. 查询改写，再调 top-k

## 从旧版本迁移：常见写法对照

| 旧写法（≤ 0.3） | 1.x 现状 |
|---|---|
| `LLMChain` / `SequentialChain` / `ConversationChain` | 移入 `langchain-classic`，新代码用 LCEL |
| `ConversationBufferMemory` 等 memory 模块 | 移除，改用 LangGraph checkpointer |
| `RetrievalQA` | 移除，用 LCEL 拼检索链，或 `create_agent` + 检索工具 |
| `initialize_agent` + `AgentType` | 移除，改用 `create_agent` |
| `langchain.document_loaders` / `vectorstores` | → `langchain_community.*`（部分独立成包） |
| `langchain.text_splitter` | → `langchain_text_splitters` |
| `langchain.embeddings` / `prompts` / `schema` | → `langchain_openai` / `langchain_core.*` |
| `create_react_agent`（langgraph.prebuilt） | → `langchain.agents.create_agent` |

## 总结

LangChain 1.x 的核心要点：

1. **LCEL 优先**：`|` 组合组件，取代了旧版各种 Chain 类
2. **模型统一入口**：`init_chat_model`，换供应商改一个字符串
3. **结构化输出**：`with_structured_output` + Pydantic
4. **Agent 一行创建**：`create_agent` + `@tool`
5. **记忆交给 LangGraph**：checkpointer + `thread_id`

下一步可以探索：自定义工具与中间件、多 Agent 编排、RAG 效果优化与评测、上线观测。可继续阅读 [RAG从零到一](/notes/03-rag-basics)、[Agent与Function Calling](/notes/04-agent-function-calling) 与 [AI应用评测入门](/notes/06-eval-basics)。
