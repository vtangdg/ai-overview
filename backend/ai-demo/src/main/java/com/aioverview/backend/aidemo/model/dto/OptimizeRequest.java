package com.aioverview.backend.aidemo.model.dto;

/**
 * 提示词优化请求
 */
public record OptimizeRequest(
    String currentPrompt,
    String feedback,
    String model
) {
    public OptimizeRequest {
        if (currentPrompt == null || currentPrompt.trim().isEmpty()) {
            throw new IllegalArgumentException("当前提示词不能为空");
        }
        if (feedback == null || feedback.trim().isEmpty()) {
            feedback = "请优化这个提示词，提高质量";
        }
        if (model == null || model.trim().isEmpty()) {
            model = "glm";
        }
    }
}
