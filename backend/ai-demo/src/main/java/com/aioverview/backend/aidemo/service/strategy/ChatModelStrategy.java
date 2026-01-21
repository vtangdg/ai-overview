package com.aioverview.backend.aidemo.service.strategy;

import org.springframework.ai.chat.client.ChatClient;

/**
 * 聊天模型策略接口
 */
public interface ChatModelStrategy {
    
    /**
     * 获取聊天客户端
     * @return ChatClient实例
     */
    ChatClient getChatClient();
    
    /**
     * 获取模型名称
     * @return 模型名称
     */
    String getModelName();
    
    /**
     * 检查策略是否可用
     * @return 是否可用
     */
    boolean isAvailable();
}
