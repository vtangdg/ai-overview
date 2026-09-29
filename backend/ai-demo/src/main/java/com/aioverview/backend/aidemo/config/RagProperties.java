package com.aioverview.backend.aidemo.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * RAG 知识问答配置项
 * <p>
 * 路径按环境区分：本地 IDEA 启动用 application-dev.yml 里的相对路径，
 * Docker 容器用 application.yml 里的挂载路径。
 */
@Data
@ConfigurationProperties(prefix = "rag")
public class RagProperties {

    /** 笔记根目录（可多个，递归扫描 .md 文件） */
    private java.util.List<String> notesPaths = new java.util.ArrayList<>();

    /** 向量索引持久化文件（JSON） */
    private String storePath = "./db/rag-store.json";

    /** 检索返回的最大片段数 */
    private int topK = 4;

    /** 相似度阈值（0~1），低于该值的片段不采纳，全部未命中则拒答 */
    private double similarityThreshold = 0.6;

    /** Embedding API 地址（智谱 OpenAI 兼容端点，不含 /v4/embeddings） */
    private String embeddingBaseUrl = "https://open.bigmodel.cn/api/paas";

    /** Embedding API Key，默认复用 GLM_API_KEY */
    private String embeddingApiKey = "${GLM_API_KEY:}";

    /** 向量化模型名 */
    private String embeddingModel = "embedding-3";

    /** 向量维度（必须与索引文件一致，否则需重建索引） */
    private int embeddingDimensions = 2048;

    /** 生成回答所用的对话模型（对应策略工厂里的模型名） */
    private String chatModel = "deepseek";

    /** 单个标题章节超过该字符数时按段落二次切分 */
    private int maxSectionChars = 1200;

    /** 片段最小字符数，过短的片段不入库 */
    private int minChunkChars = 30;

    /**
     * 流式请求是否要求上游返回 usage（stream_options.include_usage），
     * 用于 token 计量。DeepSeek 支持该参数；若切换到不兼容 stream_options
     * 的模型端点导致请求 400，把该项置为 false 即可（代价是拿不到 token 指标）。
     */
    private boolean usageInStream = true;
}
