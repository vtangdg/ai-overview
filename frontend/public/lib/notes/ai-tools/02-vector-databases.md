---
title: "向量数据库选型实战"
description: "Milvus、Qdrant、pgvector、Chroma、FAISS 深度对比：索引原理、性能指标与选型决策树。"
tags: ["向量数据库", "Milvus", "Qdrant", "pgvector", "RAG"]
difficulty: "进阶"
readTime: 14
order: 2
author: "degang"
createdAt: "2026-09-15"
updatedAt: "2026-09-15"
---

# 向量数据库选型实战

做 RAG 绕不开向量数据库，但市面上选择太多：Milvus、Qdrant、pgvector、Chroma、FAISS……这篇不讲安装教程，讲**怎么根据你的场景做决策**。

## 先分清：向量库 vs 向量插件 vs 向量索引库

这三类经常被混着叫，但定位完全不同：

- **向量索引库**（FAISS、HNSWlib）：只是一个算法库，解决"向量怎么快速搜"。索引可以序列化落盘复用，但没有内置的存储服务与元数据管理，也没有标量过滤和完整的增删改支持。适合研究或嵌入自建系统
- **专用向量数据库**（Milvus、Qdrant）：为向量检索而生，分布式、标量过滤、混合检索、多租户一应俱全
- **传统数据库的向量插件**（pgvector、Redis Stack）：在成熟数据库上加向量能力，胜在"顺手"

## 核心指标怎么看

评估向量数据库，盯着三个指标：

- **召回率（Recall）**：近似检索（ANN）可能漏掉真正的最近邻，召回率衡量"该找到的找到了多少"。99% 是常见的合格线
- **延迟（Latency）**：P99 延迟决定线上体验，重点关注
- **内存占用**：向量很吃内存（100 万条 768 维 float32 ≈ 3GB），量化（PQ、SQ）能换内存但会牺牲召回率

**三者互为权衡**：索引参数调激进 → 延迟低、内存省，但召回率掉。选型时别只看厂商官网的 benchmark，那是他们调优过的参数。

### 主流索引：HNSW 与 IVF

- **HNSW**（分层可导航小世界图）：目前事实标准。查询快、召回高，但构建慢、内存占用大
- **IVF**（倒排文件）：先聚类再搜桶。内存省、构建快，召回率略低于 HNSW
- 绝大多数场景**闭眼选 HNSW**；内存敏感或超大规模再考虑 IVF/PQ 组合

## 五个候选怎么选

| 产品 | 类型 | 适合场景 | 注意点 |
|------|------|---------|--------|
| **FAISS** | 索引库 | 实验、原型、离线批量检索 | 索引需自行序列化落盘；无过滤与增删改，生产慎用 |
| **Chroma** | 轻量数据库 | 原型、小项目、快速起步 | 百万级以上规模乏力 |
| **pgvector** | Postgres 插件 | 已有 PG、数据量 < 千万级 | 运维零新增，HNSW 索引可用 |
| **Qdrant** | 专用向量库 | 中小规模生产、Rust 单机性能 | 原生支持 payload 过滤 |
| **Milvus** | 分布式向量库 | 亿级向量、多租户、重负载 | 组件较多，运维成本最高 |

## 决策树

```
数据量 < 10万，或只是做个 Demo？
  → Chroma 或 FAISS（本地嵌入即可）

团队已经在用 Postgres，数据量 < 1000万？
  → pgvector，别引入新组件（强推荐先试这条路）

千万级以上、需要标量过滤 + 混合检索、单机扛得住？
  → Qdrant

亿级向量、多团队多租户、需要弹性扩缩容？
  → Milvus
```

一个常被忽略的事实：**大多数 RAG 应用的知识库撑死几十万 chunk，pgvector 或 Qdrant 单机绰绰有余**。为 10 万向量上 Milvus 集群，是用大炮打蚊子。

## 代码对比：体验差异

三家的 API 风格高度相似（毕竟都是"upsert + search"），迁移成本不高：

```python
# Qdrant：带过滤条件的向量检索
from qdrant_client import QdrantClient, models

client = QdrantClient(url="http://localhost:6333")
client.upsert(collection_name="docs", points=[
    models.PointStruct(id=1, vector=[0.1, 0.2, ...],
                       payload={"category": "faq", "lang": "zh"})
])
hits = client.query_points(
    collection_name="docs",
    query=query_vector,
    limit=5,
    query_filter=models.Filter(must=[
        models.FieldCondition(key="category", match=models.MatchValue(value="faq"))
    ]),
).points
```

```python
# pgvector：就是一条 SQL
SELECT id, content, embedding <=> '[0.1, 0.2, ...]' AS distance
FROM documents
WHERE category = 'faq'
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 5;
```

## 别忽视的非功能因素

- **元数据过滤**：RAG 几乎必然需要"只在某些文档范围内检索"，过滤性能要实测（Milvus/Qdrant 原生强，pgvector 靠 btree 也够用）
- **混合检索**：原生支持 BM25 + 向量融合的（Qdrant、Milvus）能省不少自建工作
- **备份与迁移**：向量数据重建成本高（要重新 Embedding 全量文档），选型时确认有快照/导出能力

## 小结

选型公式可以压缩成一句话：**原型用 Chroma/FAISS，业务落地优先 pgvector，规模与过滤需求上来后 Qdrant，亿级或多租户再上 Milvus**。先用最小的方案跑通 RAG 链路、建好评测集，等检索真的成为瓶颈再升级——向量库的迁移成本远低于你想象的。
