---
title: "本地跑大模型：Ollama与vLLM实战"
description: "在本地部署大模型的两种主流方案：Ollama 快速上手与 vLLM 高吞吐服务，硬件要求与选型对比。"
tags: ["Ollama", "vLLM", "本地部署", "开源模型", "LLM"]
difficulty: "进阶"
readTime: 13
order: 3
author: "degang"
createdAt: "2026-09-22"
updatedAt: "2026-09-22"
---

# 本地跑大模型：Ollama与vLLM实战

把开源模型跑在自己机器上，好处很实际：**数据不出门、没有按 Token 计费、不依赖网络**。这篇讲两种主流方案的定位差异与实操：**Ollama 适合个人与开发，vLLM 适合生产与高并发**。

## 两个方案，两种定位

- **Ollama**：一条命令把模型跑起来，开箱即用，面向个人开发者
- **vLLM**：生产级推理引擎，主打高吞吐，面向需要并发服务的场景

它们不是竞争关系，更像"开发环境 vs 生产环境"。

## Ollama：五分钟跑起来

### 安装与使用

```bash
# macOS / Windows 安装后直接用，Linux 一行命令
curl -fsSL https://ollama.com/install.sh | sh

# 拉取并运行模型（首次自动下载）
ollama run qwen2.5:7b

# 命令行直接对话，也可以走 REST API
curl http://localhost:11434/api/chat -d '{
  "model": "qwen2.5:7b",
  "messages": [{"role": "user", "content": "用一句话解释RAG"}]
}'
```

### 两个实用细节

**1. 模型量化级别**：Ollama 默认拉取 Q4 量化版（4-bit），显存需求大致是"参数量（十亿）× 0.6~0.7 GB"。7B 模型的 Q4 版本 ≈ 4~5GB 显存，16GB 内存的笔记本也能跑；追求质量可以拉 `qwen2.5:14b-q5_K_M` 这类更高精度版本。

**2. Modelfile 定制**：把系统提示词、参数固化成一个"自己的模型"：

```
FROM qwen2.5:7b
SYSTEM """你是一个严谨的技术助手，回答使用中文。"""
PARAMETER temperature 0.7
```

```bash
ollama create my-assistant -f Modelfile
ollama run my-assistant
```

### 接入应用

Ollama 提供 OpenAI 兼容 API，LangChain/OpenAI SDK 改个 base_url 就能用：

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
resp = client.chat.completions.create(
    model="qwen2.5:7b",
    messages=[{"role": "user", "content": "你好"}],
)
```

## vLLM：生产级吞吐

Ollama 的问题在于推理吞吐——它用的是 llama.cpp，**单请求体验好，但并发能力有限**。当你需要给一个团队或应用提供 API 服务时，vLLM 是标准答案。

### 两大核心技术

- **PagedAttention**：借鉴操作系统虚拟内存分页管理 KV Cache，显存利用率从传统方案的 ~30% 提升到 ~90%
- **Continuous Batching**：请求随到随进批次，不用等整批完成，吞吐量比静态批处理高数倍

### 部署与调用

```bash
pip install vllm

# 启动 OpenAI 兼容的 API 服务
vllm serve Qwen/Qwen2.5-7B-Instruct \
  --max-model-len 8192 \
  --gpu-memory-utilization 0.9
```

```python
# 调用方式与 OpenAI 完全一致
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="empty")
resp = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[{"role": "user", "content": "你好"}],
)
```

## 硬件要求速查

| 模型规模 | 量化后显存（Q4） | Ollama 本地玩 | vLLM 生产服务 |
|---------|----------------|--------------|--------------|
| 7B / 8B | ~5 GB | 16GB 内存的笔记本/16GB 显存 | 24GB 显存起 |
| 14B | ~9 GB | 24GB 显存或 32GB 内存(CPU) | 48GB 显存 |
| 32B | ~20 GB | 48GB 显存 | A100/H100 或多卡 |
| 70B+ | ~40 GB | 基本告别 | 多卡集群 |

两个实用技巧：显存不够时优先换**更小参数量但更新**的模型（Qwen2.5-7B 好过旧版 14B）；上下文长度也吃显存，`max-model-len` 别无脑开满。

## 怎么选

- **自己开发调试、本地 RAG 实验、个人知识库** → Ollama，五分钟上手零配置
- **多用户 API 服务、高并发生产、GPU 利用率敏感** → vLLM
- **两者结合**：本地开发用 Ollama，部署上线换 vLLM——反正 API 都是 OpenAI 兼容，业务代码不用改

## 值得关注的进阶方向

- **推理优化参数**：vLLM 的 `--enable-prefix-caching` 对"同一系统提示词反复调用"的场景能大幅省算力
- **更小的专用模型**：不是所有环节都要大模型——Embedding、分类、抽取用 1B 级小模型又快又省
- **Apple Silicon**：Mac 用户关注 MLX 生态，M 系列芯片跑模型的能效比相当不错

## 小结

本地部署的决策链很短：**先想清楚是"自己玩"还是"给别人用"**——Ollama 是前者的事实标准，vLLM 是后者的性能标杆。开源模型 + OpenAI 兼容 API 的组合，让"换模型"变成改一个 URL 的事，这也是所有 LLM 应用应该遵循的架构原则：**业务代码与模型供应商解耦**。
