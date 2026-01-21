package com.aioverview.backend.aidemo.controller;

import com.aioverview.backend.aidemo.model.dto.GenerateRequest;
import com.aioverview.backend.aidemo.model.dto.OptimizeRequest;
import com.aioverview.backend.aidemo.model.dto.PromptResponse;
import com.aioverview.backend.aidemo.service.PromptOptimizerService;
import com.aioverview.backend.aidemo.service.strategy.ChatModelStrategyFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.Map;

/**
 * 提示词优化器控制器
 */
@RestController
@RequestMapping("/api/prompt-optimizer")
@CrossOrigin(origins = "*")
public class PromptOptimizerController {

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
     * 生成提示词
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
     * 流式生成提示词（MVP 暂用普通接口）
     */
    @GetMapping(value = "/generate-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> generateStream(
            @RequestParam String task,
            @RequestParam(defaultValue = "deepseek") String model) {
        // MVP 版本：调用普通接口，然后一次性返回
        GenerateRequest request = new GenerateRequest(task, model);
        PromptResponse response = promptOptimizerService.generatePrompt(request);

        if (response.error() != null) {
            return Flux.just("data: " + response.error() + "\n\n");
        }

        // 简化实现：将完整内容作为一个 SSE 事件返回
        return Flux.just("data: " + response.content() + "\n\n");
    }

    /**
     * 优化提示词
     */
    @PostMapping("/optimize")
    public ResponseEntity<PromptResponse> optimize(@RequestBody OptimizeRequest request) {
        PromptResponse response = promptOptimizerService.optimizePrompt(request);
        if (response.error() != null) {
            return ResponseEntity.status(500).body(response);
        }
        return ResponseEntity.ok(response);
    }
}
