package com.aioverview.backend.aidemo.service.strategy;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 聊天模型策略工厂。
 * <p>
 * 支持两种入参：
 * <ul>
 *   <li>策略别名："deepseek" / "glm"（历史用法，兼容保留）</li>
 *   <li>具体模型 id："deepseek-flash" / "deepseek-chat" / "glm-4.7-flash" 等，
 *       按前缀路由到对应供应商的策略，模型 id 由调用方通过 per-call options 下发</li>
 * </ul>
 * 目标策略不可用（如未配置 GLM_API_KEY）时回退 DeepSeek 并打警告日志。
 */
@Slf4j
@Component
public class ChatModelStrategyFactory {

    private final Map<String, ChatModelStrategy> strategies;

    @Value("${spring.ai.openai.chat.options.model:deepseek-flash}")
    private String deepseekDefaultModel;

    @Value("${spring.ai.glm.chat.options.model:glm-4.7-flash}")
    private String glmDefaultModel;

    @Autowired
    public ChatModelStrategyFactory(List<ChatModelStrategy> strategyList) {
        this.strategies = strategyList.stream()
                .collect(Collectors.toMap(
                        ChatModelStrategy::getModelName,
                        Function.identity()
                ));
    }

    /**
     * 把策略别名或模型 id 归一为具体的模型 id：
     * "deepseek" → DeepSeek 默认模型；"glm" → 智谱默认模型；空串 → DeepSeek 默认模型；
     * 其余（deepseek-flash、glm-4.7-flash 等）原样返回。
     */
    public String normalizeModelId(String modelId) {
        if (modelId == null || modelId.isBlank() || "deepseek".equalsIgnoreCase(modelId)) {
            return deepseekDefaultModel;
        }
        if ("glm".equalsIgnoreCase(modelId)) {
            return glmDefaultModel;
        }
        return modelId;
    }

    /**
     * 按模型 id（或策略别名）路由到对应供应商的策略。
     * 目标策略不可用时回退 DeepSeek。
     */
    public ChatModelStrategy getStrategyForModel(String modelId) {
        String id = normalizeModelId(modelId);
        String key = id.toLowerCase().startsWith("glm") ? "glm" : "deepseek";
        ChatModelStrategy strategy = strategies.get(key);
        if (strategy != null && strategy.isAvailable()) {
            return strategy;
        }
        log.warn("模型 {} 对应的 {} 策略不可用，回退 DeepSeek", modelId, key);
        return strategies.get("deepseek");
    }

    /**
     * 根据策略别名获取策略（历史用法保留：null/空 → deepseek，不可用回退 deepseek）
     */
    public ChatModelStrategy getStrategy(String modelName) {
        if (modelName == null || modelName.isEmpty()) {
            return strategies.get("deepseek");
        }

        String normalizedName = modelName.toLowerCase();
        ChatModelStrategy strategy = strategies.get(normalizedName);

        if (strategy != null && strategy.isAvailable()) {
            return strategy;
        }

        return strategies.get("deepseek");
    }

    /**
     * 获取所有可用的策略
     */
    public Map<String, Boolean> getAvailableStrategies() {
        return strategies.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().isAvailable()
                ));
    }
}
