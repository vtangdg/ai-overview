---
title: "LangChain快速入门"
description: "使用LangChain构建AI应用的基础教程，涵盖核心概念和实战代码。"
tags: ["LangChain", "框架", "教程", "RAG", "Agent"]
difficulty: "入门"
readTime: 18
order: 1
author: "degang"
createdAt: "2026-01-19"
updatedAt: "2026-01-19"
---

# LangChain快速入门

LangChain是一个强大的框架，用于开发由大语言模型驱动的应用程序。它提供了丰富的工具和抽象，简化了AI应用的开发流程。

## 什么是LangChain？

LangChain是一个开源框架，旨在帮助开发者快速构建基于LLM的应用。它提供了：

- **模型抽象**：统一接口调用不同的LLM
- **链（Chains）**：组合多个组件完成复杂任务
- **代理（Agents）**：让LLM决定使用哪些工具
- **记忆（Memory）**：管理对话历史
- **向量存储**：实现语义搜索和RAG

## 安装

```bash
# 基础包
pip install langchain

# OpenAI集成
pip install langchain-openai

# 其他可选包
pip install langchain-community  # 社区集成
pip install langchain-anthropic  # Claude
pip install chromadb             # 向量数据库
```

## 核心概念

### 1. 模型（Models）

LangChain支持多种模型类型：

#### LLMs（大语言模型）

```python
from langchain_openai import ChatOpenAI

# 初始化模型
llm = ChatOpenAI(
    model="gpt-4",
    temperature=0.7,
    api_key="your-api-key"
)

# 简单调用
response = llm.invoke("什么是机器学习？")
print(response.content)
```

#### Chat Models（聊天模型）

```python
from langchain.schema import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="你是一个AI助手"),
    HumanMessage(content="用简单的话解释Transformer")
]

response = llm.invoke(messages)
```

### 2. 提示词模板（Prompts）

```python
from langchain.prompts import ChatPromptTemplate

# 创建模板
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个{role}"),
    ("human", "{input}")
])

# 填充变量
formatted_prompt = prompt.format(
    role="Python专家",
    input="解释什么是装饰器"
)

# 使用模板
chain = prompt | llm
response = chain.invoke({
    "role": "Python专家",
    "input": "解释什么是装饰器"
})
```

### 3. 输出解析器（Output Parsers）

```python
from langchain.output_parsers import StructuredOutputParser
from langchain.schema import OutputParser

# 定义输出格式
parser = StructuredOutputParser.from_response_schemas([
    {
        "name": "sentiment",
        "type": "string",
        "description": "情感倾向：positive/negative/neutral"
    },
    {
        "name": "confidence",
        "type": "number",
        "description": "置信度0-1"
    }
])

# 使用解析器
prompt = ChatPromptTemplate.from_messages([
    ("human", "{input}\n{format_instructions}")
])

chain = prompt | llm | parser

response = chain.invoke({
    "input": "这个产品太棒了！",
    "format_instructions": parser.get_format_instructions()
})
```

### 4. 链（Chains）

链是LangChain的核心概念，用于组合多个组件。

#### LLMChain（基础链）

```python
from langchain.chains import LLMChain

chain = LLMChain(
    llm=llm,
    prompt=prompt,
    output_parser=parser
)

response = chain.run({
    "role": "Python专家",
    "input": "解释装饰器"
})
```

#### Sequential Chain（顺序链）

```python
from langchain.chains import SequentialChain

# 第一个链：总结文本
summary_chain = LLMChain(
    llm=llm,
    prompt=ChatPromptTemplate.from_template("总结以下内容：\n{content}")
)

# 第二个链：翻译成英文
translate_chain = LLMChain(
    llm=llm,
    prompt=ChatPromptTemplate.from_template("翻译成英文：\n{summary}")
)

# 组合链
overall_chain = SequentialChain(
    chains=[summary_chain, translate_chain],
    input_variables=["content"],
    output_variables=["summary", "english_text"]
)

result = overall_chain({"content": "长文本..."})
```

#### 使用LCEL（LangChain Expression Language）

```python
# LCEL是更现代的语法
from langchain_core.output_parsers import StrOutputParser

chain = (
    prompt           # 提示词模板
    | llm            # LLM
    | StrOutputParser()  # 输出解析器
)

response = chain.invoke({"input": "你好"})
```

### 5. 记忆（Memory）

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

# 创建记忆
memory = ConversationBufferMemory()

# 创建对话链
conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True
)

# 多轮对话
response1 = conversation.run("我叫张三")
response2 = conversation.run("我叫什么名字？")
print(response2)  # 我记得你叫张三
```

### 6. 检索增强生成（RAG）

RAG是LangChain最强大的功能之一，结合向量搜索和LLM。

```python
from langchain.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA

# 1. 加载文档
loader = TextLoader("document.txt")
documents = loader.load()

# 2. 分割文本
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
splits = text_splitter.split_documents(documents)

# 3. 创建向量存储
vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=OpenAIEmbeddings()
)

# 4. 创建检索器
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3}
)

# 5. 创建QA链
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True
)

# 6. 查询
result = qa_chain({"query": "文档的主要观点是什么？"})
print(result["result"])
```

### 7. 代理（Agents）

代理可以自主决定使用哪些工具来完成任务。

```python
from langchain.agents import AgentType, initialize_agent
from langchain.tools import Tool
from langchain.utilities import SerpAPIWrapper

# 定义工具
search = SerpAPIWrapper()
tools = [
    Tool(
        name="Search",
        func=search.run,
        description="用于搜索实时信息"
    )
]

# 创建代理
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

# 运行代理
result = agent.run("今天北京的天气怎么样？")
```

## 实战示例

### 示例1：文档问答系统

```python
from langchain.document_loaders import PyPDFLoader
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory

# 加载PDF
loader = PyPDFLoader("manual.pdf")
pages = loader.load()

# 创建向量存储
vectorstore = FAISS.from_documents(
    pages,
    OpenAIEmbeddings()
)

# 创建对话记忆
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

# 创建对话链
qa = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=vectorstore.as_retriever(),
    memory=memory
)

# 对话
query = "如何使用这个产品？"
result = qa({"question": query})
print(result["answer"])
```

### 示例2：代码分析助手

```python
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

code_template = PromptTemplate(
    input_variables=["code", "language"],
    template="""
你是一位资深的代码审查专家。

请分析以下{language}代码：

{code}

请提供：
1. 代码质量评估
2. 潜在bug
3. 优化建议
4. 最佳实践建议
"""
)

code_chain = LLMChain(llm=llm, prompt=code_template)

code = """
def calculate(a, b):
    return a + b
"""

result = code_chain.run(code=code, language="Python")
print(result)
```

### 示例3：多语言翻译链

```python
from langchain.chains import SimpleSequentialChain

# 检测语言
detect_chain = LLMChain(
    llm=llm,
    prompt=ChatPromptTemplate.from_template(
        "检测以下文本的语言：\n{text}\n只返回语言名称"
    )
)

# 翻译
translate_chain = LLMChain(
    llm=llm,
    prompt=ChatPromptTemplate.from_template(
        "将以下文本翻译成英文：\n{text}"
    )
)

# 组合
full_chain = SimpleSequentialChain(
    chains=[detect_chain, translate_chain]
)

result = full_chain.run("你好世界")
```

## 最佳实践

### 1. 错误处理

```python
from langchain.retry import RetryCallback

class MyRetryCallback(RetryCallback):
    def on_retry(self, retry_state):
        print(f"重试 {retry_state.attempts} 次")

chain.with_retry(
    stop_after_attempt=3,
    callbacks=[MyRetryCallback()]
)
```

### 2. 流式输出

```python
for chunk in llm.stream("讲个故事"):
    print(chunk.content, end="", flush=True)
```

### 3. 成本追踪

```python
from langchain.callbacks import get_openai_callback

with get_openai_callback() as cb:
    response = llm.invoke("...")
    print(f"总tokens: {cb.total_tokens}")
    print(f"总成本: ${cb.total_cost}")
```

## 常见问题

### Q: 如何选择合适的向量数据库？

**A**:
- **ChromaDB**: 快速开始，本地开发
- **Pinecone**: 生产环境，托管服务
- **FAISS**: 高性能，纯本地
- **Weaviate**: 支持多模态

### Q: 如何优化RAG的检索质量？

**A**:
1. 使用更好的分块策略
2. 使用混合检索（关键词+语义）
3. 重排序（Reranking）
4. 调整检索的top-k值

## 总结

LangChain的核心要点：

1. **模块化设计**：每个组件独立可组合
2. **LCEL语法**：简洁的链式调用
3. **丰富的集成**：支持多种LLM和工具
4. **RAG能力**：轻松构建知识库问答
5. **Agent框架**：实现智能决策

下一步可以探索：
- 深入自定义组件
- 实现复杂的Agent
- 优化RAG系统
- 部署到生产环境
