package com.aioverview.backend.aidemo.controller;

import com.aioverview.backend.aidemo.config.RagProperties;
import com.aioverview.backend.aidemo.model.dto.RagQaRequest;
import com.aioverview.backend.aidemo.model.dto.RagSource;
import com.aioverview.backend.aidemo.service.RateLimiterService;
import com.aioverview.backend.aidemo.service.rag.RagIndexService;
import com.aioverview.backend.aidemo.service.rag.RagQaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * RAG 站内知识问答控制器
 * <p>
 * SSE 事件协议：
 * sources  — 检索命中的引用来源（JSON 数组，先于回答推送，前端先渲染来源卡片）
 * message  — 增量回答文本（多次）
 * rejected — 库外拒答（替代 message 事件）
 * error    — 服务异常
 * done     — 结束标记
 */
@Slf4j
@RestController
@RequestMapping("/api/rag")
@CrossOrigin(origins = "*")
public class RagController {

    private static final String SSE_CONTENT_TYPE = "text/event-stream;charset=UTF-8";

    private final RagQaService ragQaService;
    private final RagIndexService ragIndexService;
    private final RateLimiterService rateLimiterService;
    private final ObjectMapper objectMapper;
    private final RagProperties props;
    private final MeterRegistry meterRegistry;

    /** 检索命中分数分布（构造器中注册：字段初始化时 meterRegistry 尚未注入） */
    private final DistributionSummary ragScoreSummary;

    public RagController(RagQaService ragQaService,
                         RagIndexService ragIndexService,
                         RateLimiterService rateLimiterService,
                         ObjectMapper objectMapper,
                         RagProperties props,
                         MeterRegistry meterRegistry) {
        this.ragQaService = ragQaService;
        this.ragIndexService = ragIndexService;
        this.rateLimiterService = rateLimiterService;
        this.objectMapper = objectMapper;
        this.props = props;
        this.meterRegistry = meterRegistry;
        this.ragScoreSummary = DistributionSummary.builder("ai.rag.score")
                .description("检索命中片段的相似度分数分布（用于监测检索质量漂移）")
                .register(meterRegistry);
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("RAG QA Service is running!");
    }

    /**
     * 索引状态
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        RagIndexService.IndexStats stats = ragIndexService.getLastStats();
        return ResponseEntity.ok(Map.of(
                "indexing", ragIndexService.isIndexing(),
                "indexedChunks", stats == null ? 0 : stats.chunks(),
                "indexedFiles", stats == null ? 0 : stats.files(),
                "indexedAt", stats == null || stats.indexedAt() == null ? "unknown" : stats.indexedAt().toString()
        ));
    }

    /**
     * 手动重建索引（笔记新增/修改后调用）
     */
    @PostMapping("/index/rebuild")
    public ResponseEntity<Map<String, Object>> rebuild() {
        try {
            RagIndexService.IndexStats stats = ragIndexService.rebuild();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "files", stats.files(),
                    "chunks", stats.chunks(),
                    "indexedAt", stats.indexedAt().toString()
            ));
        } catch (Exception e) {
            log.error("RAG 索引重建失败", e);
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * 原始检索调试：无阈值返回 topK 命中及分数，用于标定 similarity-threshold
     */
    @PostMapping("/search")
    public ResponseEntity<List<RagSource>> search(@RequestBody RagQaRequest request,
                                                  @RequestParam(defaultValue = "5") int topK) {
        String question = request.question() == null ? "" : request.question().strip();
        if (question.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(ragQaService.retrieveRaw(question, topK).sources());
    }

    /**
     * 知识问答（SSE 流式）。按 IP 限流，防止被刷。
     */
    @PostMapping(value = "/qa", produces = SSE_CONTENT_TYPE)
    public Flux<ServerSentEvent<String>> qa(@RequestBody RagQaRequest request,
                                            HttpServletRequest httpRequest,
                                            HttpServletResponse response) {
        prepareSseResponse(response);

        String question = request.question() == null ? "" : request.question().strip();
        if (question.isEmpty()) {
            return Flux.just(errorEvent("问题不能为空"), doneEvent());
        }
        if (!rateLimiterService.isAllowed("rag-qa:" + httpRequest.getRemoteAddr())) {
            meterRegistry.counter("ai.rag.ratelimited").increment();
            return Flux.just(errorEvent("提问太频繁了，请稍后再试"), doneEvent());
        }

        // 首字延迟（TTFT）：从进入处理逻辑到第一个回答增量到达，是流式体验的核心感知指标
        Timer.Sample ttftSample = Timer.start(meterRegistry);
        AtomicBoolean firstChunk = new AtomicBoolean(false);

        return Flux.defer(() -> {
            // 检索查询融合了最近一轮问题，解决多轮追问中代词无语义的问题
            Timer.Sample retrievalSample = Timer.start(meterRegistry);
            RagQaService.RetrievalResult result =
                    ragQaService.retrieve(ragQaService.buildRetrievalQuery(request));
            retrievalSample.stop(meterRegistry.timer("ai.rag.retrieval"));
            DistributionSummary.builder("ai.rag.sources")
                    .description("每次问答检索命中的知识片段数")
                    .register(meterRegistry)
                    .record(result.sources().size());
            // 命中分数分布：整体下移说明检索质量在漂移（如笔记内容结构变化）
            for (Document doc : result.documents()) {
                Double score = doc.getScore();
                if (score != null) {
                    ragScoreSummary.record(score);
                }
            }

            // 库外未命中：直接拒答，不调用 LLM（宁可拒答，不可瞎答）
            if (result.isEmpty()) {
                ragQuestion("rejected");
                return Flux.just(
                        event("rejected", "该问题超出了本站知识库的覆盖范围。你可以浏览知识笔记，或换一个与 AI 技术相关的问题。"),
                        doneEvent());
            }

            String prompt = ragQaService.buildPrompt(question, request.history(), result.documents());
            String sourcesJson = toJson(result.sources());

            return Flux.concat(
                    Flux.just(event("sources", sourcesJson)),
                    ragQaService.streamAnswer(prompt)
                            .map(chunk -> {
                                if (firstChunk.compareAndSet(false, true)) {
                                    ttftSample.stop(meterRegistry.timer("ai.rag.ttft"));
                                }
                                return event("message", normalizeLineBreaks(chunk));
                            }),
                    Flux.just(doneEvent()))
                    .doOnComplete(() -> ragQuestion("answered"));
        }).onErrorResume(error -> {
            log.error("RAG 问答处理异常", error);
            ragQuestion("error");
            return Flux.just(errorEvent("回答生成失败，请稍后重试"), doneEvent());
        });
    }

    /**
     * RAG 问答业务指标：按结果维度计数（answered / rejected / error），
     * 经 Prometheus 暴露为 ai_rag_questions_total，支撑拒答率、问答量等看板。
     */
    private void ragQuestion(String outcome) {
        meterRegistry.counter("ai.rag.questions", "outcome", outcome).increment();
    }

    private void prepareSseResponse(HttpServletResponse response) {
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-cache, no-transform");
        response.setHeader("X-Accel-Buffering", "no");
    }

    /**
     * 构造 SSE 事件。
     * <p>
     * data 统一补一个前导空格，是为了绕开 SSE 协议的一个歧义点：
     * 规范要求客户端剥掉 data 冒号后的第一个空格，而 Spring 的 ServerSentEvent
     * 是「冒号后直接跟原文、不额外补空格」。两者叠加后，恰好只有一个空格的增量
     * 会写出成 `data: ` 并被解析成空串——流式生成里 token 间的空格会被静默吞掉
     * （表现为 markdown 的「## 标题」变成「##标题」而不再渲染成标题）。
     * 服务端主动补一个空格后，客户端按规范剥离，拿到的即为原始内容。
     */
    private ServerSentEvent<String> event(String name, String data) {
        return ServerSentEvent.<String>builder().event(name).data(" " + data).build();
    }

    private ServerSentEvent<String> doneEvent() {
        return event("done", "[DONE]");
    }

    private ServerSentEvent<String> errorEvent(String message) {
        return event("error", message);
    }

    private String toJson(List<RagSource> sources) {
        try {
            return objectMapper.writeValueAsString(sources);
        } catch (Exception e) {
            log.warn("来源列表序列化失败", e);
            return "[]";
        }
    }

    /**
     * SSE 协议里换行是字段分隔符，统一归一化避免破坏事件结构
     */
    private String normalizeLineBreaks(String chunk) {
        return chunk.replace("\r\n", "\n").replace("\r", "\n");
    }
}
