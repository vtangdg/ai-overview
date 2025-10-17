# AI概念解释器 Demo

基于Spring Boot和Deepseek-v3模型实现的智能学习助手工具，用于解释和对比AI概念。

## 功能特性

1. **概念解释** - 对AI相关概念进行通俗易懂的解释
2. **概念对比** - 对比两个概念的相同点、不同点、适用场景等
3. **缓存优化** - 使用Caffeine缓存提高响应速度

## 技术栈

- Spring Boot 3.2.0
- RestTemplate (直接调用Deepseek API)
- Deepseek-v3 大模型
- Caffeine缓存
- Jackson (JSON处理)

## 快速开始

### 1. 配置API密钥

在运行前，需要设置Deepseek API密钥：

#### 1. 开发环境临时设置

```bash
export DEEPSEEK_API_KEY=your_actual_api_key
```

#### 2. 永久设置环境变量。
对于MacOS（使用zsh） ：

```
# 编辑.zshrc文件
nano ~/.zshrc

# 在文件末尾添加
DEEPSEEK_API_KEY=your_actual_api_key
export DEEPSEEK_API_KEY

# 保存后执行
source ~/.zshrc
```

对于Windows ：

- 右键点击"此电脑" → 属性 → 高级系统设置 → 环境变量
- 在"用户变量"或"系统变量"中添加新变量：
  - 变量名： DEEPSEEK_API_KEY
  - 变量值：您的实际API密钥

#### 3. IDE中配置环境变量
如果您使用IDEA、Eclipse等IDE运行应用：

- 在运行配置中找到环境变量设置
- 添加 DEEPSEEK_API_KEY=your_actual_api_key

#### 4. Docker部署配置
如果使用Docker部署，可以在docker-compose.yml或Docker运行命令中设置：
```
# 在docker-compose.yml中
services:
  ai-demo:
    environment:
      - DEEPSEEK_API_KEY=your_actual_api_key
```
或者使用命令行：
```bash
docker run -e DEEPSEEK_API_KEY=your_actual_api_key your-image-name
```


### 2. 构建项目

```bash
cd backend
mvn clean install -DskipTests
```

### 3. 运行应用

```bash
cd ai-demo
mvn spring-boot:run
```

应用将在端口8081启动。

## API使用

### 解释概念

```bash
curl -X POST http://localhost:8081/api/concept-explainer/explain \
  -H "Content-Type: application/json" \
  -d '{"conceptName": "深度学习"}'
```

### 对比概念

```bash
curl -X POST http://localhost:8081/api/concept-explainer/compare \
  -H "Content-Type: application/json" \
  -d '{"concept1": "机器学习", "concept2": "深度学习"}'
```

## 注意事项

- 确保已安装Java 21
- API密钥应妥善保管，不要硬编码在代码中
- 项目使用Deepseek-v3模型，如有需要可在application.properties文件中修改
- API调用有频率限制，请合理使用缓存机制