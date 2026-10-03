package com.aioverview.backend.aidemo.service.strategy.impl;

import com.aioverview.backend.aidemo.service.strategy.ChatModelStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 智谱 GLM 模型策略（真实客户端）。
 * <p>
 * 独立构建指向智谱 OpenAI 兼容端点的 {@link OpenAiChatModel}——与 RagConfig 里
 * 给 embedding 手动构建客户端是同一个思路。不能用自动装配的 ChatClient.Builder，
 * 那个绑定 spring.ai.openai.*（DeepSeek 端点），历史上"glm 策略"实际打到 DeepSeek
 * 就是这个原因。
 * <p>
 * GLM_API_KEY 未配置时本策略不可用（available=false），由策略工厂回退到 DeepSeek。
 * 该客户端自带 ObjectMapper，不经过 Boot 的 ObjectMapper，因此
 * DeepSeekThinkingModeConfig 的 thinking 注入不会影响 GLM 请求。
 */
@Slf4j
@Component("glmStrategy")
public class GlmStrategy implements ChatModelStrategy {

    private final ChatClient chatClient;
    private final boolean available;

    public GlmStrategy(@Value("${spring.ai.glm.api-key:}") String glmKey,
                       @Value("${spring.ai.glm.base-url:https://open.bigmodel.cn/api/paas/v4}") String baseUrl,
                       @Value("${spring.ai.glm.chat.options.model:glm-4.7-flash}") String model,
                       @Value("${spring.ai.glm.chat.options.temperature:0.7}") Double temperature,
                       @Value("${spring.ai.glm.chat.options.max-tokens:65536}") Integer maxTokens) {
        boolean keyPresent = glmKey != null && !glmKey.isBlank() && !glmKey.startsWith("your_");
        if (keyPresent) {
            // base-url 已含 /api/paas/v4，chat 路径必须覆盖为相对的 /chat/completions
            //（OpenAiApi 默认路径是 /v1/chat/completions，不覆盖会打到错误端点）
            OpenAiApi zhipuApi = OpenAiApi.builder()
                    .baseUrl(baseUrl)
                    .apiKey(glmKey)
                    .completionsPath("/chat/completions")
                    .build();
            OpenAiChatModel chatModel = OpenAiChatModel.builder()
                    .openAiApi(zhipuApi)
                    .defaultOptions(OpenAiChatOptions.builder()
                            .model(model)
                            .temperature(temperature)
                            .maxTokens(maxTokens)
                            .build())
                    .build();
            this.chatClient = ChatClient.builder(chatModel).build();
            this.available = true;
            log.info("GlmStrategy 已启用：端点 {}，默认模型 {}", baseUrl, model);
        } else {
            this.chatClient = null;
            this.available = false;
            log.info("GlmStrategy 未启用（未配置 GLM_API_KEY），GLM 模型请求将回退到 DeepSeek");
        }
    }

    @Override
    public ChatClient getChatClient() {
        return chatClient;
    }

    @Override
    public String getModelName() {
        return "glm";
    }

    @Override
    public boolean isAvailable() {
        return available;
    }
}
