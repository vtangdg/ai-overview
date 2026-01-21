package com.aioverview.backend.aidemo.model.dto;

/**
 * 提示词生成请求
 */
public record GenerateRequest(
    String task,
    String model
) {
    public GenerateRequest {
        if (task == null || task.trim().isEmpty()) {
            throw new IllegalArgumentException("任务描述不能为空");
        }
        if (model == null || model.trim().isEmpty()) {
            model = "glm";
        }
    }
}
