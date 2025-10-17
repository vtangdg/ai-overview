package com.aioverview.backend.aidemo.controller;

import com.aioverview.backend.aidemo.service.ConceptExplainer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/concept-explainer")
// TODO 按需修改
@CrossOrigin(origins = "*")
public class ConceptExplainerController {
    @Autowired
    private ConceptExplainer conceptExplainer;
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Concept Explainer Service is running!");
    }
    @PostMapping("/explain")
    public ResponseEntity<String> explainConcept(@RequestBody Map<String, String> request) {
        String conceptName = request.get("conceptName");
        if (conceptName == null || conceptName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("概念名称不能为空");
        }
        String explanation = conceptExplainer.explainConcept(conceptName);
        return ResponseEntity.ok(explanation);
       /* String mockExplanation = "### 1. 简明定义\n" +
                "**MCP**（Model Context Protocol，模型上下文协议）是一个开放标准，让AI模型（如ChatGPT）能安全、标准化地连接外部工具和数据源，像“插件”一样扩展能力。\n" +
                "\n" +
                "### 2. 核心原理\n" +
                "通过定义统一的通信格式，MCP让AI模型无需专门训练，就能动态调用外部资源（如数据库、API），获取实时信息或执行操作，同时确保数据权限可控。\n" +
                "\n" +
                "### 3. 实际应用场景\n" +
                "- **实时数据查询**：获取股票价格、天气信息。\n" +
                "- **自动化操作**：发送邮件、管理日历。\n" +
                "- **专业工具集成**：连接代码库、设计软件。\n" +
                "\n" +
                "### 4. 相关技术关联\n" +
                "与**API接口**类似，但更轻量、通用；常与**RAG技术**结合，增强AI的实时信息处理能力，是构建AI智能体的关键技术之一。";
        return ResponseEntity.ok(mockExplanation);*/
    }
}