package com.aioverview.backend.aidemo.model.dto;

import java.util.List;

/**
 * RAG 知识问答请求
 *
 * @param question 用户问题
 * @param history  对话历史（MVP 只透传最近一轮，供多轮追问参考）
 */
public record RagQaRequest(String question, List<Turn> history) {

    public record Turn(String q, String a) {
    }
}
