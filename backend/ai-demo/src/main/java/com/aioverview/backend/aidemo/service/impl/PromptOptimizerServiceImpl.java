package com.aioverview.backend.aidemo.service.impl;

import com.aioverview.backend.aidemo.model.dto.GenerateRequest;
import com.aioverview.backend.aidemo.model.dto.OptimizeRequest;
import com.aioverview.backend.aidemo.model.dto.PromptResponse;
import com.aioverview.backend.aidemo.service.PromptOptimizerService;
import com.aioverview.backend.aidemo.service.strategy.ChatModelStrategyFactory;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.metadata.Usage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 提示词优化器服务实现
 * <p>
 * 模型解析优先级：请求显式指定 > app.ai.prompt-optimizer-model（可被
 * 环境变量 AI_MODEL_PROMPT_OPTIMIZER 覆盖）> DeepSeek 默认模型。
 * <p>
 * 监控埋点与 RAG 侧同约定：ai.optimizer.ttft（首字延迟）、
 * ai.optimizer.requests{operation,outcome,model}、ai.llm.tokens{scene,model,type}。
 */
@Slf4j
@Service
public class PromptOptimizerServiceImpl implements PromptOptimizerService {

    /**
     * 模型无响应时的兜底超时时间，避免流式请求长时间挂起
     */
    private static final Duration STREAM_TIMEOUT = Duration.ofSeconds(120);

    /**
     * 本场景默认模型（模型 id，如 deepseek-flash / glm-4.7-flash）
     */
    @Value("${app.ai.prompt-optimizer-model:deepseek-flash}")
    private String scenarioModel;

    private final ChatModelStrategyFactory strategyFactory;
    private final MeterRegistry meterRegistry;

    @Autowired
    public PromptOptimizerServiceImpl(ChatModelStrategyFactory strategyFactory, MeterRegistry meterRegistry) {
        this.strategyFactory = strategyFactory;
        this.meterRegistry = meterRegistry;
    }

    /**
     * 解析本次请求实际使用的模型 id：请求显式指定优先，否则用场景配置
     */
    private String resolveModel(String requestModel) {
        String model = requestModel != null && !requestModel.isBlank()
                ? requestModel
                : scenarioModel;
        return strategyFactory.normalizeModelId(model);
    }

    /**
     * 按模型 id 获取对应的 ChatClient（不同模型可能由不同供应商策略提供）
     */
    private ChatClient getChatClient(String modelId) {
        return strategyFactory.getStrategyForModel(modelId).getChatClient();
    }

    /**
     * 生成提示词的模板
     */
    private static final String GENERATE_PROMPT_TEMPLATE = """
            你是一个专业的提示词工程师。请根据用户描述的任务，直接生成一个高质量的、可直接使用的提示词。

            ## 用户任务
            %s

            ## 生成要求
            请生成一个结构化的提示词，包含以下部分（用##标题分隔）：

            ## 角色设定
            明确AI应该扮演什么角色

            ## 任务目标
            清晰描述要完成什么任务

            ## 具体要求
            列出需要遵守的规则和注意事项

            ## 输出格式
            明确指定输出的格式（如Markdown列表、代码块等）

            ## 注意
            - 直接输出完整的提示词，不要有额外解释
            - 使用Markdown格式，用##分隔各部分
            - 确保提示词可以直接复制给AI使用
            - **绝对禁止**在生成的提示词中使用任何Markdown强调修饰符，包括但不限于**、*、__、_等
            - **严格要求**保持内容简洁明了，只使用基本的Markdown标题格式（##），不使用任何其他格式修饰
            - **必须确保**生成的内容中完全没有任何强调修饰符，所有内容都使用普通文本格式
            """;

    /**
     * 优化提示词的模板
     */
    private static final String OPTIMIZE_PROMPT_TEMPLATE = """
            你是一个专业的提示词优化专家。请根据用户的反馈意见，优化改进以下提示词。

            ## 当前提示词
            %s

            ## 用户反馈
            %s

            ## 优化要求
            1. 保持原有结构（使用##分隔各部分）
            2. 根据用户反馈进行针对性改进
            3. 确保优化后的提示词可以直接使用
            4. 使用Markdown格式
            5. **绝对禁止**在优化后的提示词中使用任何Markdown强调修饰符，包括但不限于**、*、__、_等
            6. **严格要求**保持内容简洁明了，只使用基本的Markdown标题格式（##），不使用任何其他格式修饰
            7. **必须确保**优化后的内容中完全没有任何强调修饰符，所有内容都使用普通文本格式

            请直接输出优化后的提示词，不要有额外解释。
            """;

    @Override
    public PromptResponse generatePrompt(GenerateRequest request) {
        try {
            String model = resolveModel(request.model());
            ChatClient client = getChatClient(model);
            String prompt = String.format(GENERATE_PROMPT_TEMPLATE, request.task());
            String content = client.prompt()
                    .user(prompt)
                    .options(OpenAiChatOptions.builder().model(model).build())
                    .call()
                    .content();

            log.info("提示词生成完成，模型: {}，内容长度: {}", model, content == null ? 0 : content.length());

            return PromptResponse.success(content);
        } catch (Exception e) {
            log.error("提示词生成失败", e);
            return PromptResponse.error("生成失败: " + e.getMessage());
        }
    }

    @Override
    public PromptResponse optimizePrompt(OptimizeRequest request) {
        try {
            String model = resolveModel(request.model());
            ChatClient client = getChatClient(model);
            String prompt = String.format(OPTIMIZE_PROMPT_TEMPLATE,
                    request.currentPrompt(),
                    request.feedback());
            String content = client.prompt()
                    .user(prompt)
                    .options(OpenAiChatOptions.builder().model(model).build())
                    .call()
                    .content();

            log.info("提示词优化完成，模型: {}，内容长度: {}", model, content == null ? 0 : content.length());

            return PromptResponse.success(content);
        } catch (Exception e) {
            log.error("提示词优化失败", e);
            return PromptResponse.error("优化失败: " + e.getMessage());
        }
    }

    @Override
    public Flux<String> generatePromptStream(GenerateRequest request) {
        String model = resolveModel(request.model());
        String prompt = String.format(GENERATE_PROMPT_TEMPLATE, request.task());
        return streamChat("generate", model, prompt);
    }

    @Override
    public Flux<String> optimizePromptStream(OptimizeRequest request) {
        String model = resolveModel(request.model());
        String prompt = String.format(OPTIMIZE_PROMPT_TEMPLATE,
                request.currentPrompt(),
                request.feedback());
        return streamChat("optimize", model, prompt);
    }

    /**
     * 调用模型并以增量片段的流式方式返回内容。
     * 不用 .stream().content() 而用 .stream().chatResponse()：content 捷径只吐字符串，
     * 会把流式响应里的 usage 元数据丢掉，token 就没法计量了（与 RAG 侧同一决策）。
     *
     * @param operation 操作类型（generate / optimize），用于请求计数指标打标
     * @param modelId   模型 id（已归一，如 deepseek-flash / glm-4.7-flash）
     * @param prompt    完整的提示词
     * @return 增量文本流（每个元素是本次新增的文本片段）
     */
    private Flux<String> streamChat(String operation, String modelId, String prompt) {
        ChatClient client;
        try {
            client = getChatClient(modelId);
        } catch (Exception e) {
            return Flux.error(e);
        }

        if (client == null) {
            return Flux.error(new IllegalStateException("模型 " + modelId + " 不可用，请检查 API Key 配置"));
        }

        log.info("开始流式生成，操作: {}，模型: {}", operation, modelId);

        // 首字延迟（TTFT）：从进入处理逻辑到第一个回答增量到达，是流式体验的核心感知指标
        Timer.Sample ttftSample = Timer.start(meterRegistry);
        AtomicBoolean ttftRecorded = new AtomicBoolean(false);
        AtomicBoolean usageRecorded = new AtomicBoolean(false);

        // stream_options.include_usage 只有 DeepSeek 端点支持，智谱不支持，按模型前缀自动门控
        boolean wantUsage = modelId.toLowerCase().startsWith("deepseek");

        return client.prompt()
                .user(prompt)
                .options(OpenAiChatOptions.builder()
                        .model(modelId)
                        .streamUsage(wantUsage)
                        .build())
                .stream()
                .chatResponse()
                .doOnNext(resp -> recordUsage(resp, modelId, usageRecorded))
                .mapNotNull(this::extractText)
                .filter(chunk -> !chunk.isEmpty())
                .doOnNext(chunk -> {
                    if (ttftRecorded.compareAndSet(false, true)) {
                        ttftSample.stop(meterRegistry.timer("ai.optimizer.ttft", "model", modelId));
                    }
                })
                .timeout(STREAM_TIMEOUT)
                .doOnComplete(() -> {
                    log.info("流式生成结束，操作: {}，模型: {}", operation, modelId);
                    recordRequest(operation, modelId, "success");
                })
                .doOnError(e -> {
                    log.error("流式生成异常，操作: {}，模型: {}", operation, modelId, e);
                    recordRequest(operation, modelId, "error");
                });
    }

    /** 取出增量文本；usage-only 的尾包没有内容，返回 null 被 mapNotNull 过滤。
     *  注意不要 trim——单个空格的增量是有意义的内容，strip 会复现「跨 chunk 空格丢失」的老 bug */
    private String extractText(ChatResponse resp) {
        if (resp.getResult() == null || resp.getResult().getOutput() == null) {
            return null;
        }
        String text = resp.getResult().getOutput().getText();
        return (text == null || text.isEmpty()) ? null : text;
    }

    /**
     * 记录 token 消耗：ai_llm_tokens_total{scene="prompt-optimizer", model, type=prompt|completion}。
     * 顺序陷阱与 RAG 侧相同：内容 chunk 的 getUsage() 通常是全 0 空对象，
     * 必须先判断"有真实 token 数"再 CAS，否则流末尾真正的 usage 包会被挡掉。
     */
    private void recordUsage(ChatResponse resp, String model, AtomicBoolean usageRecorded) {
        if (resp.getMetadata() == null || resp.getMetadata().getUsage() == null) {
            return;
        }
        Usage usage = resp.getMetadata().getUsage();
        Integer promptTokens = usage.getPromptTokens();
        Integer completionTokens = usage.getCompletionTokens();
        boolean hasRealUsage = (promptTokens != null && promptTokens > 0)
                || (completionTokens != null && completionTokens > 0);
        if (!hasRealUsage) {
            return;
        }
        if (!usageRecorded.compareAndSet(false, true)) {
            return;
        }
        if (promptTokens != null && promptTokens > 0) {
            meterRegistry.counter("ai.llm.tokens", "scene", "prompt-optimizer", "model", model, "type", "prompt")
                    .increment(promptTokens);
        }
        if (completionTokens != null && completionTokens > 0) {
            meterRegistry.counter("ai.llm.tokens", "scene", "prompt-optimizer", "model", model, "type", "completion")
                    .increment(completionTokens);
        }
    }

    /** 请求计数：ai_optimizer_requests_total{operation=generate|optimize, outcome=success|error, model} */
    private void recordRequest(String operation, String model, String outcome) {
        meterRegistry.counter("ai.optimizer.requests", "operation", operation, "model", model, "outcome", outcome)
                .increment();
    }
}
