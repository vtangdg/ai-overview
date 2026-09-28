---
title: "Spring AI实战：从ChatClient到RAG"
description: "用Spring AI在JVM上构建AI应用：ChatClient与流式输出、结构化输出、Advisors机制，以及基于pgvector的完整Java版RAG实现。"
tags: ["Spring AI", "Java", "RAG", "pgvector", "实战"]
difficulty: "进阶"
readTime: 16
order: 5
author: "degang"
createdAt: "2026-09-19"
updatedAt: "2026-09-19"
---

# Spring AI实战：从ChatClient到RAG

[转型路径](/notes/04-java-ai-transition) 里说过：Java 工程师做 AI 应用不需要换语言赛道。这篇就是那条路线阶段二、三的实战展开——用 Spring AI 把"调模型"到"Java 版 RAG"完整走一遍。

## Spring AI 是什么？

Spring 官方的 AI 应用框架，2025 年发布 1.0 GA 后进入稳定迭代。它把 AI 能力翻译成了 Spring 的母语：

- **ChatClient** 之于对话，就像 `RestTemplate`/`WebClient` 之于 HTTP——统一门面，换模型只改配置
- **EmbeddingModel / VectorStore** 抽象向量化和检索，pgvector、Milvus 等实现开箱即用
- **ETL Pipeline** 内置文档读取（PDF/Word/Markdown）与切分器
- Boot 自动装配、配置管理、可观测性端点——全是你熟悉的那套

和 [LangChain4j](/notes/01-langchain-quickstart) 的取舍：Spring AI 的抽象更"Spring 味"，与现有架构无缝；LangChain4j 概念更"AI 原生"，跟随 Python 生态更快。**团队已深度使用 Spring，选 Spring AI**。

## 起步：依赖与配置

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-model-openai</artifactId>
</dependency>
```

```yaml
# application.yml —— 任何 OpenAI 兼容服务都能接
spring:
  ai:
    openai:
      api-key: ${LLM_API_KEY}
      base-url: https://api.example-model.com   # 换 base-url 即可切到本地 vLLM
      chat:
        options:
          model: your-model-name
          temperature: 0.7
```

[本地部署篇](/notes/03-local-llm) 的结论在这里直接复用：开发期指向 Ollama，生产指向 vLLM，**Java 侧代码一行不改**。

## ChatClient 三板斧

### 1. 流式输出（SSE）

用户体感的核心——别让用户盯着空白等 10 秒：

```java
@GetMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> chat(@RequestParam String q) {
    return chatClient.prompt()
            .user(q)
            .stream()
            .content();          // 逐 token 推给前端
}
```

### 2. 结构化输出

让模型直接返回强类型对象，告别手写 JSON 解析：

```java
record MovieReview(String title, int rating, List<String> pros, List<String> cons) {}

MovieReview review = chatClient.prompt()
        .user("分析这部影片：" + intro)
        .call()
        .entity(MovieReview.class);   // 自动生成格式约束 + 反序列化
```

### 3. Advisors：Spring AI 的"拦截器链"

Prompt 增强、记忆、RAG 注入都是 Advisor，可插拔组合——这是理解 Spring AI 架构的关键：

```java
chatClient.prompt()
    .user(question)
    .advisors(
        new MessageChatMemoryAdvisor(chatMemory),   // 多轮对话记忆
        new QuestionAnswerAdvisor(vectorStore)      // RAG：自动检索并注入上下文
    )
    .call()
    .content();
```

## 完整实战：Java 版 RAG

### 第一步：文档进库（离线 ETL）

```java
// 读取 PDF → 切分 → 向量化 → 存入 pgvector
List<Document> docs = new TokenTextSplitter()
        .apply(new TikaDocumentReader("classpath:/docs/员工手册.pdf").get());

vectorStore.add(docs);   // Embedding 与入库自动完成
```

### 第二步：配置 pgvector

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS vector_store (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content text, metadata json, embedding vector(1024)
);
```

```yaml
spring:
  ai:
    vectorstore:
      pgvector:
        dimensions: 1024        # 必须与 Embedding 模型维度一致
        distance-type: COSINE_DISTANCE
```

Embedding 原理不熟悉的，先补 [Embedding与语义检索](/notes/05-embeddings-and-semantic-search)。

### 第三步：检索问答（在线）

```java
@PostMapping("/ask")
public Answer ask(@RequestBody Question q) {
    return chatClient.prompt()
            .user(q.text())
            .advisors(new QuestionAnswerAdvisor(vectorStore,
                    SearchRequest.builder()
                            .topK(4)
                            .similarityThreshold(0.6)
                            .build()))
            .call()
            .entity(Answer.class);
}
```

### 第四步：别忘了评测

上面每一步的效果（切分大小、topK、阈值）都应该由评测集说了算，方法见 [AI应用评测入门](/notes/06-eval-basics)——**Java 侧写 JUnit 包住评测脚本**，跑进 CI 就是你熟悉的那套流程。

## 生产化注意点

- **连接与超时**：模型 API 按外部依赖对待——配置超时、重试（对幂等的查询类调用）、熔断降级
- **大文档处理**：PDF 解析放异步任务（消息队列 + 批处理），别在请求线程里做 ETL
- **向量库连接池**：pgvector 复用你现有的 Postgres 连接池配置即可，这是选它的最大红利
- **多租户隔离**：metadata 里带上租户 ID，检索时用 Filter 表达式过滤——在应用层做，别依赖模型"自觉"

## 小结

Spring AI 的学习成本对 Java 工程师来说几乎是"零新概念"：ChatClient 是门面、Advisors 是拦截器链、VectorStore 是 DAO、ETL 是数据管道。**一篇 RAG 的全部复杂度，都在数据质量与评测上，而不在框架上**——这正是 Java 工程师的主场优势。

下一步自然是把 RAG 升级成能"动手做事"的系统：把内部服务封装成工具让 Agent 调用，见 [Agent化企业系统](/notes/06-agentize-spring-services)。
