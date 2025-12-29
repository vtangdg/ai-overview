package com.aioverview.backend.aidemo.service.impl;

import com.aioverview.backend.aidemo.service.Answer;
import com.aioverview.backend.aidemo.service.ConceptExplainerService;
import com.aioverview.backend.aidemo.service.Question;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

/**
 * @author
 * @date 2025/12/29
 */
@Service
public class ConceptExplainerServiceImpl implements ConceptExplainerService {
    private final ChatClient chatClient;

    public ConceptExplainerServiceImpl(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    private static final String questionPromptTemplate = """
            请用通俗易懂的方式解释'{concept}'这个概念：
            1. 简明定义
            2. 核心原理
            3. 实际应用场景
            4. 相关技术关联
            请用中文回答，控制在300字以内，使用Markdown格式回复，不需要在最外层加上```markdown标识。
            """;
    @Override
    public Answer askQuestion(Question question) {
        var answerText = chatClient.prompt()
                .user(userSpec -> userSpec
                        .text(questionPromptTemplate)
                        .param("concept", question.question()))
                .call()
                .content();

        return new Answer(answerText);
    }
}
