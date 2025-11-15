# 基础镜像
FROM eclipse-temurin:21-jre-alpine

# 设置工作目录
WORKDIR /app

# 创建一个目录用于存放sqlite数据库文件[citation:1]
RUN mkdir -p /app/db

# 直接复制JAR文件到当前目录（构建上下文的根目录是backend）
COPY ai-demo/target/backend-ai-demo-0.0.1-SNAPSHOT.jar app.jar

# 设置环境变量
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
# 设置环境变量，默认激活prod配置
ENV SPRING_PROFILES_ACTIVE=prod

# 暴露端口
EXPOSE 8090

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]