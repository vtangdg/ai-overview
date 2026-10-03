package com.aioverview.backend.aidemo.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.BeanDescription;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationConfig;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.ser.BeanSerializerModifier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

/**
 * DeepSeek V4（deepseek-flash）思考模式关闭配置。
 * <p>
 * 背景：DeepSeek V4 起思考模式默认打开（effort 默认 high），模型会先输出思维链再给答案，
 * 首字延迟成倍增加（2026-10-03 实测：非思考模式 TTFT 约 1s，思考模式可达 11s）。
 * 官方关闭方式是请求体注入 {"thinking":{"type":"disabled"}}，但 Spring AI 1.0.3 的
 * {@link org.springframework.ai.openai.OpenAiChatOptions} 没有该字段（reasoningEffort
 * 只能调强度、关不掉思考）。
 * <p>
 * 实现方式：在 Jackson 序列化层注入（挂 {@link BeanSerializerModifier}），
 * Spring AI 出站请求体由 Boot 的 ObjectMapper 序列化 {@code OpenAiApi.ChatCompletionRequest}
 * 时自动带上 thinking 字段。相比在 HTTP 客户端层（RestClient 拦截器 / WebClient 过滤器）改写
 * 请求体字节，这种方式不触碰传输层（chunked/Content-Length），行为与原生请求完全一致
 * —— 此前 HTTP 层方案会导致 DeepSeek 网关返回 401，已废弃。
 * 该注入思路来自社区对 Spring AI 适配 DeepSeek V4 的通用做法。
 * <p>
 * 影响范围：所有经由 Boot ObjectMapper 序列化的 {@code ChatCompletionRequest}
 * （提示词优化器、RAG 知识问答、概念解释器共用的 ChatClient 全覆盖）；
 * 智谱 embedding 走 RagConfig 手动构建的独立 OpenAiApi，请求类型是 EmbeddingRequest，不受影响。
 * <p>
 * 可通过 deepseek.thinking-disabled=false 整体关闭（例如将来某场景需要思考模式时）。
 */
@Slf4j
@Configuration
public class DeepSeekThinkingModeConfig {

    /** 独立 mapper，仅用于把请求对象转成 tree（不注册本 module，避免递归）。
     *  ChatCompletionRequest 自带类级 @JsonInclude(NON_NULL)，转换行为与原生一致 */
    private static final ObjectMapper TREE_MAPPER = new ObjectMapper();

    /** 总开关：false 时不注册注入逻辑 */
    @Value("${deepseek.thinking-disabled:true}")
    private boolean thinkingDisabled;

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer deepSeekThinkingJacksonCustomizer() {
        if (!thinkingDisabled) {
            return builder -> {};
        }
        return builder -> builder.modules(new DeepSeekThinkingDisableModule());
    }

    /**
     * 对 Spring AI 的 OpenAiApi.ChatCompletionRequest 序列化过程做包装：
     * 先按原生逻辑转 tree，再补 thinking 字段写出。
     */
    static final class DeepSeekThinkingDisableModule extends SimpleModule {

        private static final String TARGET_CLASS =
                "org.springframework.ai.openai.api.OpenAiApi$ChatCompletionRequest";

        DeepSeekThinkingDisableModule() {
            super("deepseek-thinking-disable");
        }

        @Override
        public void setupModule(SetupContext context) {
            super.setupModule(context);
            context.addBeanSerializerModifier(new BeanSerializerModifier() {
                @Override
                public JsonSerializer<?> modifySerializer(SerializationConfig config,
                                                          BeanDescription beanDesc,
                                                          JsonSerializer<?> serializer) {
                    if (TARGET_CLASS.equals(beanDesc.getBeanClass().getName())) {
                        return new ThinkingInjectingSerializer();
                    }
                    return serializer;
                }
            });
        }
    }

    static final class ThinkingInjectingSerializer extends JsonSerializer<Object> {

        @Override
        public void serialize(Object request, JsonGenerator gen, SerializerProvider serializers)
                throws IOException {
            JsonNode node = TREE_MAPPER.valueToTree(request);
            // 只对 DeepSeek 系模型注入：thinking 是 DeepSeek 私有参数，
            // 请求可能路由到智谱等其他 OpenAI 兼容端点（如 glm-4.7-flash），不能误加
            if (node instanceof ObjectNode obj
                    && obj.path("model").asText("").startsWith("deepseek")
                    && !obj.has("thinking")) {
                obj.putObject("thinking").put("type", "disabled");
                if (log.isDebugEnabled()) {
                    log.debug("[deepseek-thinking] 已注入 thinking.type=disabled, model={}",
                            obj.path("model").asText());
                }
            }
            serializers.defaultSerializeValue(node, gen);
        }
    }
}
