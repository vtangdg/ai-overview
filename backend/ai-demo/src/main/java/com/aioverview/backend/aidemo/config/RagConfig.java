package com.aioverview.backend.aidemo.config;

import com.aioverview.backend.aidemo.service.rag.MarkdownChunker;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.ai.openai.OpenAiEmbeddingOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;

/**
 * RAG 相关 Bean 装配
 * <p>
 * 说明：为什么不直接用 spring.ai.openai 的自动配置？
 * 因为自动配置的 OpenAiEmbeddingModel 指向 DeepSeek（该项目 chat 的 base-url），
 * 而 DeepSeek 不提供 embedding 接口，所以这里手动构建一个指向
 * 智谱 OpenAI 兼容端点的 EmbeddingModel，仅用于向量化。
 */
@Configuration
@EnableConfigurationProperties(RagProperties.class)
public class RagConfig {

    /**
     * 站内知识向量库：进程内暴力检索 + JSON 文件持久化。
     * 站内 chunk 数量在千级以内，无需引入独立向量数据库。
     */
    @Bean
    public SimpleVectorStore ragVectorStore(RagProperties props) {
        OpenAiApi zhipuApi = OpenAiApi.builder()
                .baseUrl(props.getEmbeddingBaseUrl())
                .apiKey(props.getEmbeddingApiKey())
                .embeddingsPath("/v4/embeddings")
                .build();

        OpenAiEmbeddingModel embeddingModel = new OpenAiEmbeddingModel(
                zhipuApi,
                org.springframework.ai.document.MetadataMode.EMBED,
                OpenAiEmbeddingOptions.builder()
                        .model(props.getEmbeddingModel())
                        .dimensions(props.getEmbeddingDimensions())
                        .build());

        SimpleVectorStore store = SimpleVectorStore.builder(embeddingModel).build();

        File storeFile = new File(props.getStorePath());
        if (storeFile.exists()) {
            store.load(storeFile);
        }
        return store;
    }
}
