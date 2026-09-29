package com.aioverview.backend.aidemo.service.rag;

import com.aioverview.backend.aidemo.config.RagProperties;
import com.aioverview.backend.aidemo.model.dto.RagQaRequest;
import com.aioverview.backend.aidemo.model.dto.RagSource;
import com.aioverview.backend.aidemo.service.strategy.ChatModelStrategyFactory;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.metadata.Usage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.document.Document;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * RAG 问答服务：检索 → 拒答判定 → Prompt 组装 → 流式生成
 * <p>
 * 设计决策：不用 QuestionAnswerAdvisor，而是手动执行检索。
 * 因为拒答判定和引用来源列表都需要拿到"命中了哪些片段"，advisor 拿不到；
 * 手动检索换来完整的流程可控性。
 */
@Slf4j
@Service
public class RagQaService {

    private static final Duration STREAM_TIMEOUT = Duration.ofSeconds(120);
    private static final int SNIPPET_MAX_CHARS = 150;

    private final SimpleVectorStore vectorStore;
    private final RagProperties props;
    private final ChatModelStrategyFactory strategyFactory;
    private final MeterRegistry meterRegistry;

    public RagQaService(SimpleVectorStore vectorStore, RagProperties props,
                        ChatModelStrategyFactory strategyFactory, MeterRegistry meterRegistry) {
        this.vectorStore = vectorStore;
        this.props = props;
        this.strategyFactory = strategyFactory;
        this.meterRegistry = meterRegistry;
    }

    /**
     * 检索结果：sources 为空代表知识库未命中，应直接拒答（不调用 LLM）
     */
    public record RetrievalResult(List<RagSource> sources, List<Document> documents) {
        public boolean isEmpty() {
            return sources.isEmpty();
        }
    }

    /**
     * 构建检索用的查询：多轮追问时（如"那它有什么缺点？"），代词单独向量化没有语义，
     * 把最近一轮用户问题拼进查询，让检索能命中上文的主题
     */
    public String buildRetrievalQuery(RagQaRequest request) {
        String q = request.question() == null ? "" : request.question().strip();
        if (request.history() != null && !request.history().isEmpty()) {
            RagQaRequest.Turn last = request.history().get(request.history().size() - 1);
            if (last != null && last.q() != null && !last.q().isBlank()) {
                return last.q().strip() + " " + q;
            }
        }
        return q;
    }

    /**
     * 向量检索站内知识
     */
    public RetrievalResult retrieve(String question) {
        List<Document> docs = vectorStore.similaritySearch(SearchRequest.builder()
                .query(question)
                .topK(props.getTopK())
                .similarityThreshold(props.getSimilarityThreshold())
                .build());
        return toResult(docs);
    }

    /**
     * 无阈值原始检索：用于标定 similarityThreshold（阈值应依据真实分数分布设定，而不是拍脑袋）
     */
    public RetrievalResult retrieveRaw(String question, int topK) {
        List<Document> docs = vectorStore.similaritySearch(SearchRequest.builder()
                .query(question)
                .topK(topK)
                .similarityThreshold(0.0)
                .build());
        return toResult(docs);
    }

    private RetrievalResult toResult(List<Document> docs) {
        List<RagSource> sources = new ArrayList<>();
        if (docs != null) {
            for (Document doc : docs) {
                Map<String, Object> meta = doc.getMetadata();
                sources.add(new RagSource(
                        String.valueOf(meta.getOrDefault("title", "")),
                        String.valueOf(meta.getOrDefault("category", "")),
                        String.valueOf(meta.getOrDefault("heading", "")),
                        String.valueOf(meta.getOrDefault("source", "")),
                        snippet(doc.getText()),
                        doc.getScore()));
            }
        }
        log.info("RAG 检索完成，命中: {} 个片段", sources.size());
        return new RetrievalResult(sources, docs == null ? List.of() : docs);
    }

    /**
     * 组装 RAG Prompt：知识片段 + 对话历史 + 严格约束
     */
    public String buildPrompt(String question, List<RagQaRequest.Turn> history, List<Document> docs) {
        StringBuilder context = new StringBuilder();
        for (int i = 0; i < docs.size(); i++) {
            Document doc = docs.get(i);
            context.append("[")
                    .append(i + 1)
                    .append("] 《")
                    .append(doc.getMetadata().getOrDefault("title", ""))
                    .append("》- ")
                    .append(doc.getMetadata().getOrDefault("heading", ""))
                    .append("\n")
                    .append(doc.getText())
                    .append("\n\n");
        }

        StringBuilder sb = new StringBuilder();
        sb.append("""
                你是"AI Overview"站内知识问答助手。请严格根据下面的知识库片段回答用户问题。

                ## 规则
                1. 只使用知识库片段中的信息回答，禁止编造；
                2. 引用信息时在句末标注来源编号，如 [1]、[2]；
                3. 如果片段不足以回答问题，如实告知用户站内笔记尚未覆盖这部分内容（用自己的话表达，不要套用固定话术），禁止用片段之外的知识回答；
                4. 用中文、Markdown 格式回答，简洁清晰。

                ## 知识库片段
                """).append(context);

        if (history != null && !history.isEmpty()) {
            sb.append("## 对话历史（供理解追问语境，禁止作为答案来源）\n");
            history.stream().limit(1).forEach(turn -> {
                sb.append("用户: ").append(turn.q() == null ? "" : turn.q()).append('\n');
                sb.append("助手: ").append(turn.a() == null ? "" : turn.a()).append('\n');
            });
            sb.append('\n');
        }

        sb.append("## 用户问题\n").append(question);
        return sb.toString();
    }

    /**
     * 调用对话模型流式生成回答。
     * <p>
     * 不用 .stream().content() 而用 .stream().chatResponse()：content 捷径只吐字符串，
     * 会把流式响应里的 usage 元数据丢掉，token 就没法计量了。
     * usage 由上游在最后一个 chunk 返回（需 stream_options.include_usage，
     * 通过 rag.usage-in-stream 控制，兼容不支持该参数的端点时可关闭）。
     */
    public Flux<String> streamAnswer(String prompt) {
        ChatClient client = strategyFactory.getStrategy(props.getChatModel()).getChatClient();
        if (client == null) {
            return Flux.error(new IllegalStateException("模型 " + props.getChatModel() + " 不可用，请检查 API Key 配置"));
        }
        String model = props.getChatModel();
        AtomicBoolean usageRecorded = new AtomicBoolean(false);
        return client.prompt()
                .user(prompt)
                .options(OpenAiChatOptions.builder().streamUsage(props.isUsageInStream()).build())
                .stream()
                .chatResponse()
                .doOnNext(resp -> recordUsage(resp, model, usageRecorded))
                .mapNotNull(this::extractText)
                .filter(chunk -> !chunk.isEmpty())
                .timeout(STREAM_TIMEOUT)
                .doOnComplete(() -> log.info("RAG 回答流式生成结束"))
                .doOnError(e -> log.error("RAG 回答生成异常", e));
    }

    /** 取出增量文本；usage-only 的尾包没有内容，返回 null 被 mapNotNull 过滤。注意不要 trim——单个空格的增量是有意义的内容，strip 会复现「跨 chunk 空格丢失」的老 bug */
    private String extractText(ChatResponse resp) {
        if (resp.getResult() == null || resp.getResult().getOutput() == null) {
            return null;
        }
        String text = resp.getResult().getOutput().getText();
        return (text == null || text.isEmpty()) ? null : text;
    }

    /**
     * 记录 token 消耗：ai_llm_tokens_total{scene, model, type=prompt|completion}。
     * usage 只在流末尾出现一次，用 usageRecorded 防重复累计。
     */
    private void recordUsage(ChatResponse resp, String model, AtomicBoolean usageRecorded) {
        if (resp.getMetadata() == null || resp.getMetadata().getUsage() == null
                || !usageRecorded.compareAndSet(false, true)) {
            return;
        }
        Usage usage = resp.getMetadata().getUsage();
        Integer promptTokens = usage.getPromptTokens();
        Integer completionTokens = usage.getCompletionTokens();
        if (promptTokens != null && promptTokens > 0) {
            meterRegistry.counter("ai.llm.tokens", "scene", "rag-qa", "model", model, "type", "prompt")
                    .increment(promptTokens);
        }
        if (completionTokens != null && completionTokens > 0) {
            meterRegistry.counter("ai.llm.tokens", "scene", "rag-qa", "model", model, "type", "completion")
                    .increment(completionTokens);
        }
    }

    private String snippet(String text) {
        if (text == null) {
            return "";
        }
        String flat = text.replace("\n", " ").replaceAll("\\s+", " ").strip();
        return flat.length() <= SNIPPET_MAX_CHARS ? flat : flat.substring(0, SNIPPET_MAX_CHARS) + "…";
    }
}
