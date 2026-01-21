package com.aioverview.backend.aidemo.model.dto;

/**
 * 提示词响应
 */
public record PromptResponse(
    String content,
    String error
) {
    public PromptResponse {
        if (content == null) {
            content = "";
        }
    }

    public static PromptResponse success(String content) {
        return new PromptResponse(content, null);
    }

    public static PromptResponse error(String error) {
        return new PromptResponse("", error);
    }
}
