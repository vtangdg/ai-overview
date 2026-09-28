---
title: "RAG从零到一：检索增强生成详解"
description: "理解RAG的核心原理与完整流程：文档切分、向量检索、重排序与生成，解决大模型幻觉与私有知识问题。"
tags: ["RAG", "Embedding", "向量检索", "LLM", "最佳实践"]
difficulty: "进阶"
readTime: 18
order: 3
author: "degang"
createdAt: "2026-09-18"
updatedAt: "2026-09-18"
---

# RAG从零到一：检索增强生成详解

RAG（Retrieval-Augmented Generation，检索增强生成）是目前大模型应用落地里最主流的架构。它的思路很简单：**先从知识库里检索相关内容，再把检索结果交给大模型生成回答**——让模型"开卷考试"，而不是靠记忆"闭卷瞎猜"。

## 为什么需要RAG？

直接问大模型问题，会遇到三个硬伤：

- **幻觉**：模型会一本正经地编造不存在的答案
- **知识过时**：模型的训练数据有截止日期，不知道最新的信息
- **私有知识缺失**：你公司的内部文档、产品手册，模型从来没见过

RAG 针对性地解决这三个问题：答案基于检索到的真实文档生成，可溯源、可更新、可接入私有数据。相比之下，微调适合改变模型的"能力与风格"，而不是注入"事实知识"——这是两者最关键的分界线。

## 核心流程：两个阶段

### 索引阶段（离线）

把知识库变成"可检索"的状态：

```
原始文档 → 加载解析 → 文本切分(Chunking) → 向量化(Embedding) → 存入向量数据库
```

### 检索阶段（在线）

用户提问时的实时流程：

```
用户问题 → 查询向量化 → 向量库召回Top-K → (可选)重排序 → 拼装Prompt → LLM生成答案
```

这两条链路拆开看，每一环都有讲究。

## 文本切分（Chunking）

切分是 RAG 效果的第一道关卡。切太碎，语义不完整；切太大，检索不精准还会挤占上下文窗口。

常见策略：

- **固定长度切分**：按 500~1000 字符切，最简单，但可能把一句话拦腰斩断
- **递归字符切分**：优先按段落 → 句子 → 词逐级回退切分，是 LangChain 的默认方案，性价比最高
- **语义切分**：根据句向量相似度找语义断点，效果更好但成本更高

两个关键参数：

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,      # 每块最大长度
    chunk_overlap=50,    # 相邻块重叠，避免边界语义丢失
)
chunks = splitter.split_documents(docs)
```

经验法则：**chunk_size 在 300~800 之间起步，配合 10%~20% 的 overlap**，再根据检索效果迭代。结构化文档（如带标题的 Markdown）按标题层级切分效果远好于无脑定长切。

## Embedding与相似度

Embedding 模型把文本映射成高维向量（如 1024 维），语义相近的文本向量距离更近。检索时就是"以向量搜向量"：

- **余弦相似度**是最常用的度量
- 选型上，中文场景常用 BGE（BAAI）、M3E、text-embedding-3（OpenAI）等
- **重要**：索引和查询必须用同一个 Embedding 模型，换了模型要全量重建索引

## 检索优化：从"能用"到"好用"

裸的向量检索往往不够好，工业界常用三板斧：

### 混合检索（Hybrid Search）

向量检索擅长语义（"怎么退货"能匹配"七天无理由"），但对精确关键词（型号、错误码）不敏感。把 **BM25 关键词检索 + 向量检索**的结果融合（常用 RRF 倒数排序融合），覆盖率显著提升。

### 重排序（Rerank）

召回阶段追求"快"（从百万文档里捞出 Top 50），重排序阶段追求"准"（用 Cross-Encoder 精细打分，选出 Top 5）。典型的两阶段架构：

```
向量召回 Top-50 → Rerank 模型精排 → Top-5 进入 Prompt
```

### 查询改写（Query Rewriting）

用户的问题不一定适合直接检索。"这个报错怎么搞"可以先用 LLM 改写成"XX错误码的原因和解决方法"，检索质量立刻不同。进阶玩法还有多路查询（HyDE、Multi-Query）。

## 最小可用示例

用 LangChain 搭一个最小 RAG，核心不到 30 行：

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. 切分
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(docs)

# 2. 向量化并入库
vectorstore = FAISS.from_documents(chunks, OpenAIEmbeddings())

# 3. 检索
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
results = retriever.invoke("什么是自注意力机制？")

# 4. 拼装Prompt生成
context = "\n\n".join(r.page_content for r in results)
prompt = f"""请仅根据以下参考资料回答问题，资料中没有的信息请明确说明。

参考资料：
{context}

问题：什么是自注意力机制？"""
answer = ChatOpenAI(model="gpt-5.5").invoke(prompt)
```

注意 Prompt 里的那句"资料中没有的信息请明确说明"——**明确约束模型只依据检索内容作答**，是抑制幻觉的关键手段之一。

## 如何评估RAG效果

RAG 是一个链路系统，要分段评估：

- **检索侧**：召回率（该找到的文档找到了多少）、命中率（Top-K 里有没有正确答案）
- **生成侧**：忠实度（答案是否忠于检索内容）、答案相关性
- 常用工具：RAGAS、TruLens，或者先人工建一个 20~50 条的评测集快速回归

## 常见问题与最佳实践

- **切分质量差**：优先检查 chunk 是否语义完整，而不是急着换模型
- **检索到了但不回答**：八成是 Prompt 没有约束模型依据资料作答，或检索内容太多淹没了重点
- **表格/图片信息丢失**：切分阶段对表格做特殊处理（整表一块 + 摘要），多模态内容单独走通道
- **知识更新**：文档加个哈希指纹，增量更新而非全量重建
- **先评估再优化**：没有评测集的 RAG 调优全是玄学

## 小结

RAG 的本质是"**检索质量决定上限，生成约束决定下限**"。架构上它不复杂——切分、向量化、检索、生成四步；但每一环的效果调优才是真正的功夫所在。建议从最小可用版本起步，建好评测集，再逐环迭代。
