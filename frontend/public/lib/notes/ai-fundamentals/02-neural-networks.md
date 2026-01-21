---
title: "神经网络入门"
description: "深度学习的基础：理解神经元、前向传播、反向传播等核心概念。"
tags: ["神经网络", "深度学习", "反向传播", "激活函数"]
difficulty: "入门"
readTime: 12
order: 2
author: "degang"
createdAt: "2026-01-16"
updatedAt: "2026-01-16"
---

# 神经网络入门

神经网络是深度学习的基础，它受人脑神经元结构的启发而设计。本文将介绍神经网络的核心概念和工作原理。

## 什么是神经网络？

神经网络是一种模拟人脑神经元连接结构的计算模型，由大量的节点（神经元）和连接（权重）组成。

```
输入层          隐藏层          输出层
  ┌──┐
  │x1│───┐
  └──┘   │
         ├──┐
  ┌──┐   │  │         ┌──┐
  │x2│───┼──┼────┬───▶│y1│
  └──┘   │  │    │    └──┘
         ├──┘    │
  ┌──┐   │       │    ┌──┐
  │x3│───┘       └───▶│y2│
  └──┘                 └──┘
```

## 神经网络的基本组成

### 神经元（节点）

每个神经元接收输入，进行加权求和，通过激活函数处理后输出：

```
输出 = 激活函数(Σ(输入 × 权重) + 偏置)
```

### 层

- **输入层**：接收原始数据
- **隐藏层**：进行特征提取和转换
- **输出层**：产生最终结果

### 权重和偏置

- **权重（Weight）**：控制输入信号的重要性
- **偏置（Bias）**：调整神经元的激活阈值

## 前向传播

前向传播是数据从输入层流向输出层的过程：

```python
# 简单的前向传播示例
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

# 输入
X = np.array([0.5, 0.3, 0.2])

# 权重和偏置
W1 = np.array([[0.1, 0.2, 0.3],
               [0.4, 0.5, 0.6]])
b1 = np.array([0.1, 0.2])

W2 = np.array([[0.7, 0.8],
               [0.9, 1.0]])
b2 = np.array([0.3, 0.4])

# 前向传播
h1 = sigmoid(np.dot(W1, X) + b1)  # 隐藏层
output = sigmoid(np.dot(W2, h1) + b2)  # 输出层

print(f"输出: {output}")
```

## 激活函数

激活函数引入非线性，使神经网络能够学习复杂的模式。

### 常用激活函数

**Sigmoid**：将输出压缩到 (0, 1)
```
σ(x) = 1 / (1 + e^(-x))
```

**ReLU**：最常用的激活函数
```
ReLU(x) = max(0, x)
```

**Tanh**：将输出压缩到 (-1, 1)
```
tanh(x) = (e^x - e^(-x)) / (e^x + e^(-x))
```

**Softmax**：用于多分类问题
```
softmax(x_i) = e^(x_i) / Σe^(x_j)
```

## 反向传播

反向传播是训练神经网络的核心算法，通过计算梯度来更新权重。

### 工作原理

1. **前向传播**：计算输出
2. **计算损失**：比较预测值与真实值
3. **反向传播**：计算梯度
4. **权重更新**：使用梯度下降更新权重

### 损失函数

- **均方误差（MSE）**：用于回归问题
```
MSE = (1/n) × Σ(y_true - y_pred)²
```

- **交叉熵损失**：用于分类问题
```
CE = -Σy_true × log(y_pred)
```

### 梯度下降

```python
# 梯度下降更新权重
learning_rate = 0.01
weight = weight - learning_rate * gradient
```

## 常见神经网络架构

### 前馈神经网络（FNN）

最基础的神经网络，信息单向传播。

### 卷积神经网络（CNN）

专门处理图像数据，通过卷积层提取空间特征。

**特点**：
- 局部连接
- 权重共享
- 池化层降维

### 循环神经网络（RNN）

处理序列数据，具有记忆功能。

**变体**：
- LSTM（长短期记忆网络）
- GRU（门控循环单元）

### Transformer

基于注意力机制的架构，是现代大语言模型的基础。

## 代码示例：使用PyTorch构建神经网络

```python
import torch
import torch.nn as nn

class SimpleNN(nn.Module):
    def __init__(self):
        super(SimpleNN, self).__init__()
        self.fc1 = nn.Linear(784, 128)  # 输入层到隐藏层
        self.fc2 = nn.Linear(128, 64)   # 隐藏层到隐藏层
        self.fc3 = nn.Linear(64, 10)    # 隐藏层到输出层
        self.relu = nn.ReLU()           # 激活函数

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.fc3(x)
        return x

# 创建模型
model = SimpleNN()
print(model)
```

## 训练神经网络

```python
import torch.optim as optim

# 定义损失函数和优化器
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# 训练循环
for epoch in range(num_epochs):
    for batch_x, batch_y in dataloader:
        # 前向传播
        outputs = model(batch_x)
        loss = criterion(outputs, batch_y)

        # 反向传播和优化
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
```

## 常见问题

### 梯度消失

深层网络中，梯度逐层衰减，导致前面层几乎不更新。

**解决方法**：
- 使用ReLU激活函数
- 使用Batch Normalization
- 使用残差连接（ResNet）

### 过拟合

模型在训练数据上表现很好，但在测试数据上表现差。

**解决方法**：
- Dropout
- L1/L2正则化
- 早停（Early Stopping）
- 数据增强

## 总结

神经网络是深度学习的基础，关键要点：

- 神经网络由输入层、隐藏层、输出层组成
- 前向传播计算输出，反向传播更新权重
- 激活函数引入非线性
- 损失函数衡量预测误差
- 梯度下降优化网络参数

掌握这些基础概念后，可以继续学习更高级的架构和技术。
