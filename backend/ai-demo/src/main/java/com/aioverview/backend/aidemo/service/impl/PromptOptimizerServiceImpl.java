package com.aioverview.backend.aidemo.service.impl;

import com.aioverview.backend.aidemo.model.dto.GenerateRequest;
import com.aioverview.backend.aidemo.model.dto.OptimizeRequest;
import com.aioverview.backend.aidemo.model.dto.PromptResponse;
import com.aioverview.backend.aidemo.service.PromptOptimizerService;
import com.aioverview.backend.aidemo.service.strategy.ChatModelStrategyFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 提示词优化器服务实现
 */
@Service
public class PromptOptimizerServiceImpl implements PromptOptimizerService {

    private final ChatModelStrategyFactory strategyFactory;

    @Autowired
    public PromptOptimizerServiceImpl(ChatModelStrategyFactory strategyFactory) {
        this.strategyFactory = strategyFactory;
    }

    /**
     * 根据模型名称获取对应的ChatClient
     */
    private ChatClient getChatClient(String model) {
        return strategyFactory.getStrategy(model).getChatClient();
    }

    /**
     * 生成提示词的模板
     */
    private static final String GENERATE_PROMPT_TEMPLATE = """
            你是一个专业的提示词工程师。请根据用户描述的任务，直接生成一个高质量的、可直接使用的提示词。

            ## 用户任务
            %s

            ## 生成要求
            请生成一个结构化的提示词，包含以下部分（用##标题分隔）：

            ## 角色设定
            明确AI应该扮演什么角色

            ## 任务目标
            清晰描述要完成什么任务

            ## 具体要求
            列出需要遵守的规则和注意事项

            ## 输出格式
            明确指定输出的格式（如Markdown列表、代码块等）

            ## 注意
            - 直接输出完整的提示词，不要有额外解释
            - 使用Markdown格式，用##分隔各部分
            - 确保提示词可以直接复制给AI使用
            - **绝对禁止**在生成的提示词中使用任何Markdown强调修饰符，包括但不限于**、*、__、_等
            - **严格要求**保持内容简洁明了，只使用基本的Markdown标题格式（##），不使用任何其他格式修饰
            - **必须确保**生成的内容中完全没有任何强调修饰符，所有内容都使用普通文本格式
            """;

    /**
     * 优化提示词的模板
     */
    private static final String OPTIMIZE_PROMPT_TEMPLATE = """
            你是一个专业的提示词优化专家。请根据用户的反馈意见，优化改进以下提示词。

            ## 当前提示词
            %s

            ## 用户反馈
            %s

            ## 优化要求
            1. 保持原有结构（使用##分隔各部分）
            2. 根据用户反馈进行针对性改进
            3. 确保优化后的提示词可以直接使用
            4. 使用Markdown格式
            5. **绝对禁止**在优化后的提示词中使用任何Markdown强调修饰符，包括但不限于**、*、__、_等
            6. **严格要求**保持内容简洁明了，只使用基本的Markdown标题格式（##），不使用任何其他格式修饰
            7. **必须确保**优化后的内容中完全没有任何强调修饰符，所有内容都使用普通文本格式

            请直接输出优化后的提示词，不要有额外解释。
            """;

    @Override
  public PromptResponse generatePrompt(GenerateRequest request) {
    try {
      // 默认使用glm模型
      String model = request.model() != null ? request.model() : "glm";
      ChatClient client = getChatClient(model);
      String prompt = String.format(GENERATE_PROMPT_TEMPLATE, request.task());
      String content = client.prompt()
              .user(prompt)
              .call()
              .content();

      // 添加日志
      System.out.println("=== 提示词生成结果 ===");
      System.out.println("任务: " + request.task());
      System.out.println("使用模型: " + model);
      System.out.println("生成内容长度: " + content.length());
      System.out.println("生成内容前500字符: " + content.substring(0, Math.min(500, content.length())));
      System.out.println("====================");

      return PromptResponse.success(content);
    } catch (Exception e) {
      e.printStackTrace();
      return PromptResponse.error("生成失败: " + e.getMessage());
    }
  }

    @Override
    public PromptResponse optimizePrompt(OptimizeRequest request) {
        try {
            // 默认使用glm模型
            String model = request.model() != null ? request.model() : "glm";
            ChatClient client = getChatClient(model);
            String prompt = String.format(OPTIMIZE_PROMPT_TEMPLATE,
                    request.currentPrompt(),
                    request.feedback());
            String content = client.prompt()
                    .user(prompt)
                    .call()
                    .content();
            return PromptResponse.success(content);
        } catch (Exception e) {
            e.printStackTrace();
            return PromptResponse.error("优化失败: " + e.getMessage());
        }
    }
}
