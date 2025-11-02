package com.aioverview.backend.aidemo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查控制器
 * 提供/health端点用于CI/CD部署验证
 */
@RestController
@CrossOrigin(origins = "*")
public class HealthController {

    /**
     * 健康检查端点
     * @return 包含应用状态的响应
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "ai-overview-backend");
        return ResponseEntity.ok(response);
    }
}