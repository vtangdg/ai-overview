package com.aioverview.backend.aidemo.service;

import com.aioverview.backend.aidemo.model.dto.GenerateRequest;
import com.aioverview.backend.aidemo.model.dto.OptimizeRequest;
import com.aioverview.backend.aidemo.model.dto.PromptResponse;
import reactor.core.publisher.Flux;

/**
 * 提示词优化器服务接口
 */
public interface PromptOptimizerService {

    /**
     * 生成提示词
     * @param request 生成请求
     * @return 生成的提示词
     */
    PromptResponse generatePrompt(GenerateRequest request);

    /**
     * 优化提示词
     * @param request 优化请求
     * @return 优化后的提示词
     */
    PromptResponse optimizePrompt(OptimizeRequest request);

    /**
     * 流式生成提示词（按增量片段推送）
     * @param request 生成请求
     * @return 增量文本流
     */
    Flux<String> generatePromptStream(GenerateRequest request);

    /**
     * 流式优化提示词（按增量片段推送）
     * @param request 优化请求
     * @return 增量文本流
     */
    Flux<String> optimizePromptStream(OptimizeRequest request);
}
