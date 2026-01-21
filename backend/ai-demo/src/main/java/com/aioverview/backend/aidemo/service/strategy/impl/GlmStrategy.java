package com.aioverview.backend.aidemo.service.strategy.impl;

import com.aioverview.backend.aidemo.service.strategy.ChatModelStrategy;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 智谱GLM模型策略
 */
@Component("glmStrategy")
public class GlmStrategy implements ChatModelStrategy {
    
    private final ChatClient chatClient;
    private final boolean available;
    
    public GlmStrategy(@Value("${spring.ai.glm.api-key:}") String glmKey,
                      ChatClient.Builder chatClientBuilder) {
        if (glmKey != null && !glmKey.isEmpty() && !glmKey.startsWith("your_")) {
            this.chatClient = chatClientBuilder.build();
            this.available = true;
        } else {
            this.chatClient = null;
            this.available = false;
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
