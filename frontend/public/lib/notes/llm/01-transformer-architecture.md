---
title: "Transformer架构详解"
description: "理解Attention机制和Transformer架构，这是现代大语言模型的基础。"
tags: ["Transformer", "Attention", "Self-Attention", "编码器", "解码器"]
difficulty: "进阶"
readTime: 20
order: 1
author: "degang"
createdAt: "2026-01-17"
updatedAt: "2026-01-17"
---

# Transformer架构详解

Transformer是2017年Google提出的革命性架构，彻底改变了自然语言处理领域。它是GPT、BERT、Claude等所有大语言模型的基础架构。

## 为什么需要Transformer？

在Transformer出现之前，主流的序列模型是RNN（循环神经网络），但它有明显的问题：

- **顺序计算**：无法并行处理，训练慢
- **长距离依赖**：难以捕捉长序列中的关系
- **梯度消失**：深层网络训练困难

Transformer通过**自注意力机制（Self-Attention）**解决了这些问题。

## Transformer整体架构

```
         编码器 (Encoder)                         解码器 (Decoder)
┌────────────────────────────┐      ┌──────────────────────────────────┐
│  自注意力 (Self-Attention)  │      │  掩码自注意力 (Masked Attention)   │
│             ↓              │      │              ↓                   │
│  前馈网络 + 残差 & 归一化    │      │  编码-解码注意力 ←───────────────┼── 编码器输出
│             ↓              │      │  (Cross-Attention)               │
│         重复 N×            │      │              ↓                   │
└─────────────┬──────────────┘      │  前馈网络 + 残差 & 归一化         │
              │                     │              ↓                   │
              └────────────────────▶│          重复 N×                 │
                                    └──────────────┬───────────────────┘
                                                   ↓
                                           线性层 + Softmax
                                                   ↓
                                             输出概率分布
```

编码器处理输入序列并产出表示，解码器在此基础上生成目标序列。解码器每个块里有**三个子层**：掩码自注意力（防止看到未来 Token）、编码-解码注意力（从编码器输出取信息）、前馈网络。

## 自注意力机制（Self-Attention）

### 核心思想

自注意力机制让序列中的每个位置都能关注到其他所有位置，直接建立依赖关系。

### 计算过程

```
1. 为每个输入生成三个向量：
   - Query (查询向量)：当前位置的查询
   - Key (键向量)：用于匹配查询
   - Value (值向量)：实际的信息内容

2. 计算注意力分数：
   score = Query × Key^T

3. 缩放和归一化：
   attention_weights = softmax(score / √d_k)

4. 加权求和：
   output = attention_weights × Value
```

### 数学表示

```
Attention(Q, K, V) = softmax(QK^T / √d_k) × V
```

其中：
- Q: Query矩阵 [seq_len, d_k]
- K: Key矩阵 [seq_len, d_k]
- V: Value矩阵 [seq_len, d_v]
- d_k: Key的维度

### 代码实现

```python
import math
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(query, key, value, mask=None):
    """
    缩放点积注意力
    Args:
        query: [batch_size, seq_len, d_k]
        key: [batch_size, seq_len, d_k]
        value: [batch_size, seq_len, d_v]
        mask: [batch_size, seq_len, seq_len] (可选)
    """
    d_k = query.size(-1)

    # 计算注意力分数
    scores = torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(d_k)

    # 应用掩码（可选）
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)

    # Softmax归一化
    attention_weights = F.softmax(scores, dim=-1)

    # 加权求和
    output = torch.matmul(attention_weights, value)

    return output, attention_weights
```

## 多头注意力（Multi-Head Attention）

### 为什么需要多头？

- 单头注意力只能关注一种模式
- 多头可以并行关注不同的关系和语义

### 架构

```
输入 X
    │
    ├─── Head 1 ───▶ concat ───▶ 线性投影 ───▶ 输出
    ├─── Head 2 ───▶
    ├─── Head 3 ───▶
    └─── Head h ───▶
```

每个头独立学习不同的注意力模式。

### 代码实现

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads

        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

    def forward(self, query, key, value, mask=None):
        batch_size = query.size(0)

        # 线性投影
        Q = self.W_q(query)  # [batch, seq_len, d_model]
        K = self.W_k(key)
        V = self.W_v(value)

        # 分割成多个头
        Q = Q.view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = K.view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = V.view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)

        # 应用注意力
        attn_output, _ = scaled_dot_product_attention(Q, K, V, mask)

        # 合并头
        attn_output = attn_output.transpose(1, 2).contiguous()
        attn_output = attn_output.view(batch_size, -1, self.d_model)

        # 最终线性投影
        output = self.W_o(attn_output)

        return output
```

## 位置编码（Positional Encoding）

Transformer本身不包含序列顺序信息，需要位置编码来注入位置信息。

### 正弦位置编码

```
PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
```

```python
import math
import torch
import torch.nn as nn

class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=5000):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() *
                             (-math.log(10000.0) / d_model))

        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)
        self.register_buffer('pe', pe)

    def forward(self, x):
        return x + self.pe[:, :x.size(1)]
```

## 前馈神经网络（FFN）

每个注意力层后都有一个两层的全连接网络：

```python
class PositionwiseFFN(nn.Module):
    def __init__(self, d_model, d_ff):
        super().__init__()
        self.linear1 = nn.Linear(d_model, d_ff)
        self.linear2 = nn.Linear(d_ff, d_model)
        self.relu = nn.ReLU()

    def forward(self, x):
        return self.linear2(self.relu(self.linear1(x)))
```

## 残差连接和层归一化

残差连接让梯度能绕过子层直接回流，是深层网络可训练的关键；层归一化则稳定每层的数值分布。**两者的先后顺序有两种排法，别搞混**：

```
Post-LN（原论文用的）：   Output = LayerNorm(Input + SubLayer(Input))
Pre-LN （现代大模型主流）：Output = Input + SubLayer(LayerNorm(Input))
```

Pre-LN 把归一化提到子层之前，残差通路全程无归一化干扰，训练更稳定、更容易堆深——GPT 系模型基本都用这一版。

```python
class AddNorm(nn.Module):
    """Pre-LN 实现：先归一化进子层，残差从原始输入直连"""

    def __init__(self, size):
        super().__init__()
        self.norm = nn.LayerNorm(size)

    def forward(self, x, sublayer):
        return x + sublayer(self.norm(x))
```

## 编码器和解码器

### 编码器

处理输入序列，提取特征表示。

### 解码器

基于编码器输出生成目标序列：
- 掩码自注意力：防止看到未来信息
- 编码-解码注意力：关注编码器的输出

## 完整的Transformer块

```python
class TransformerBlock(nn.Module):
    """Pre-LN 版 Transformer 块（现代大模型的主流写法）"""

    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super().__init__()
        self.attention = MultiHeadAttention(d_model, num_heads)
        self.ffn = PositionwiseFFN(d_model, d_ff)
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, mask=None):
        # 自注意力：先归一化再进子层，残差从原始 x 直连
        normed = self.norm1(x)
        x = x + self.dropout(self.attention(normed, normed, normed, mask))

        # 前馈网络：同样先归一化
        x = x + self.dropout(self.ffn(self.norm2(x)))

        return x
```

## Transformer的变体

### BERT（Bidirectional Encoder Representations from Transformers）

- 只使用编码器
- 双向上下文理解
- 用于理解任务

### GPT（Generative Pre-trained Transformer）

- 只使用解码器
- 单向（从左到右）
- 用于生成任务

### T5（Text-to-Text Transfer Transformer）

- 编码器-解码器架构
- 所有任务都转换为文本到文本

### BART

- 编码器-解码器
- 用于文本生成和理解

## 总结

Transformer的核心创新：

1. **自注意力机制**：直接建模序列中任意位置的关系
2. **多头注意力**：并行学习多种关系模式
3. **位置编码**：注入序列顺序信息
4. **残差连接和归一化**：稳定深层网络训练

这些设计使Transformer能够：
- 并行计算，训练高效
- 捕捉长距离依赖
- 易于扩展到大规模数据

理解Transformer是掌握现代大语言模型的关键第一步。
