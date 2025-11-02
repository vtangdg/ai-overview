package com.aioverview.backend.aidemo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class ConceptExplainer {

    @Autowired
    private ChatClient chatClient;

    @Cacheable(value = "concepts", key = "#conceptName")
    public String explainConcept(String conceptName) {
        String prompt = String.format(
            "请用通俗易懂的方式解释'%s'这个概念：" +
            "1. 简明定义\n" +
            "2. 核心原理\n" +
            "3. 实际应用场景\n" +
            "4. 相关技术关联\n" +
            "请用中文回答，控制在300字以内，使用Markdown格式回复，不需要在最外层加上```markdown标识。",
            conceptName
        );
        return chatClient.call(prompt);
    }
}