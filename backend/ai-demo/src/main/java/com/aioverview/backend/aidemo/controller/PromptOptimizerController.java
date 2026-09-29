package com.aioverview.backend.aidemo.controller;

import com.aioverview.backend.aidemo.model.dto.GenerateRequest;
import com.aioverview.backend.aidemo.model.dto.OptimizeRequest;
import com.aioverview.backend.aidemo.model.dto.PromptResponse;
import com.aioverview.backend.aidemo.service.PromptOptimizerService;
import com.aioverview.backend.aidemo.service.strategy.ChatModelStrategyFactory;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.io.InterruptedIOException;
import java.util.Map;
import java.util.concurrent.TimeoutException;

/**
 * 提示词优化器控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/prompt-optimizer")
@CrossOrigin(origins = "*")
public class PromptOptimizerController {

    /**
     * SSE 响应 Content-Type，显式声明 UTF-8，避免中文增量内容乱码
     */
    private static final String SSE_CONTENT_TYPE = "text/event-stream;charset=UTF-8";

    /** 增量内容事件 */
    private static final String EVENT_DELTA = "delta";
    /** 异常事件 */
    private static final String EVENT_ERROR = "error";
    /** 结束事件 */
    private static final String EVENT_DONE = "done";

    @Autowired
    private PromptOptimizerService promptOptimizerService;

    @Autowired
    private ChatModelStrategyFactory strategyFactory;

    /**
     * 健康检查
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Prompt Optimizer Service is running!");
    }

    /**
     * 获取可用的模型列表
     */
    @GetMapping("/models")
    public ResponseEntity<Map<String, Object>> getAvailableModels() {
        return ResponseEntity.ok(Map.of(
                "models", strategyFactory.getAvailableStrategies()
        ));
    }

    /**
     * 生成提示词（一次性返回）
     */
    @PostMapping("/generate")
    public ResponseEntity<PromptResponse> generate(@RequestBody GenerateRequest request) {
        PromptResponse response = promptOptimizerService.generatePrompt(request);
        if (response.error() != null) {
            return ResponseEntity.status(500).body(response);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * 优化提示词（一次性返回）
     */
    @PostMapping("/optimize")
    public ResponseEntity<PromptResponse> optimize(@RequestBody OptimizeRequest request) {
        PromptResponse response = promptOptimizerService.optimizePrompt(request);
        if (response.error() != null) {
            return ResponseEntity.status(500).body(response);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * 流式生成提示词：模型每产出一段文本就通过 SSE 推送给前端
     */
    @PostMapping(value = "/generate-stream", produces = SSE_CONTENT_TYPE)
    public Flux<ServerSentEvent<String>> generateStream(@RequestBody GenerateRequest request,
                                                        HttpServletResponse response) {
        prepareSseResponse(response);
        return toSse(promptOptimizerService.generatePromptStream(request));
    }

    /**
     * 流式优化提示词：模型每产出一段文本就通过 SSE 推送给前端
     */
    @PostMapping(value = "/optimize-stream", produces = SSE_CONTENT_TYPE)
    public Flux<ServerSentEvent<String>> optimizeStream(@RequestBody OptimizeRequest request,
                                                        HttpServletResponse response) {
        prepareSseResponse(response);
        return toSse(promptOptimizerService.optimizePromptStream(request));
    }

    /**
     * 关闭中间层（如 nginx）的响应缓冲，否则增量内容会被攒够一批才下发
     */
    private void prepareSseResponse(HttpServletResponse response) {
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-cache, no-transform");
        response.setHeader("X-Accel-Buffering", "no");
    }

    /**
     * 把增量文本流包装成 SSE 事件流：delta（增量内容）+ done（结束），异常时补发 error
     */
    private Flux<ServerSentEvent<String>> toSse(Flux<String> source) {
        return source
                .map(chunk -> event(EVENT_DELTA, normalizeLineBreaks(chunk)))
                .concatWithValues(event(EVENT_DONE, "[DONE]"))
                .onErrorResume(error -> Flux.just(
                        event(EVENT_ERROR, resolveErrorMessage(error)),
                        event(EVENT_DONE, "[DONE]")));
    }

    /**
     * 构造 SSE 事件。
     * <p>
     * data 统一补一个前导空格，是为了绕开 SSE 协议的一个歧义点：
     * 规范要求客户端剥掉 data 冒号后的第一个空格，而 Spring 的 ServerSentEvent
     * 是「冒号后直接跟原文、不额外补空格」。两者叠加后，恰好只有一个空格的增量
     * 会写出成 `data: ` 并被解析成空串——流式生成里词与词之间的空格会被静默吞掉。
     * 服务端主动补一个空格后，客户端按规范剥离，拿到的即为原始内容。
     */
    private ServerSentEvent<String> event(String name, String data) {
        return ServerSentEvent.<String>builder()
                .event(name)
                .data(" " + data)
                .build();
    }

    /**
     * SSE 协议里换行是字段分隔符。SseEmitter 会把 \n 自动转成多条 data 行，
     * 但不会处理 \r，所以这里只做换行归一化，避免破坏事件结构。
     */
    private String normalizeLineBreaks(String chunk) {
        return chunk.replace("\r\n", "\n").replace("\r", "\n");
    }

    private String resolveErrorMessage(Throwable error) {
        if (error instanceof TimeoutException) {
            return "模型响应超时，请稍后重试";
        }
        if (error instanceof InterruptedIOException) {
            return "请求已中断";
        }
        String message = error.getMessage();
        return (message == null || message.isBlank()) ? "生成失败，请稍后重试" : message;
    }
}
