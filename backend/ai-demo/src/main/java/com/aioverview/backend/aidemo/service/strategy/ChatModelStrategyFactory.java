package com.aioverview.backend.aidemo.service.strategy;

import com.aioverview.backend.aidemo.service.strategy.impl.DeepSeekStrategy;
import com.aioverview.backend.aidemo.service.strategy.impl.GlmStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 聊天模型策略工厂
 */
@Component
public class ChatModelStrategyFactory {
    
    private final Map<String, ChatModelStrategy> strategies;
    
    @Autowired
    public ChatModelStrategyFactory(List<ChatModelStrategy> strategyList) {
        this.strategies = strategyList.stream()
                .collect(Collectors.toMap(
                        ChatModelStrategy::getModelName,
                        Function.identity()
                ));
    }
    
    /**
     * 根据模型名称获取对应的策略
     * @param modelName 模型名称
     * @return 对应的策略，如果不存在则返回默认策略
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
     * @return 可用策略列表
     */
    public Map<String, Boolean> getAvailableStrategies() {
        return strategies.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().isAvailable()
                ));
    }
}
