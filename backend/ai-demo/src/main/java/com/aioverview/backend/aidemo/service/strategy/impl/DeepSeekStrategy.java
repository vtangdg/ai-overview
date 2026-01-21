package com.aioverview.backend.aidemo.service.strategy.impl;

import com.aioverview.backend.aidemo.service.strategy.ChatModelStrategy;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * DeepSeek模型策略
 */
@Component("deepSeekStrategy")
public class DeepSeekStrategy implements ChatModelStrategy {
    
    private final ChatClient chatClient;
    
    @Autowired
    public DeepSeekStrategy(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }
    
    @Override
    public ChatClient getChatClient() {
        return chatClient;
    }
    
    @Override
    public String getModelName() {
        return "deepseek";
    }
    
    @Override
    public boolean isAvailable() {
        return chatClient != null;
    }
}
