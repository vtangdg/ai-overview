'use client';

import { useState, useEffect } from 'react';
import { Sparkles, RotateCw, Copy, Check, ArrowRight } from 'lucide-react';
import { templates } from '@/features/prompt-optimizer/lib/templates';
import { promptOptimizerApi } from '@/features/prompt-optimizer/lib/api';

interface PromptEditorProps {
  initialTemplate?: string | null;
}

export function PromptEditor({ initialTemplate }: PromptEditorProps) {
  const [task, setTask] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showOptimizeForm, setShowOptimizeForm] = useState(false);

  useEffect(() => {
    if (initialTemplate) {
      setTask(initialTemplate);
    }
  }, [initialTemplate]);

  // 生成提示词
  const handleGenerate = async () => {
    if (!task.trim()) return;

    setIsGenerating(true);
    setGeneratedPrompt('');
    setShowOptimizeForm(false);

    try {
      const result = await promptOptimizerApi.generate({ task });
      setGeneratedPrompt(result.content);
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 优化提示词
  const handleOptimize = async () => {
    if (!generatedPrompt) return;

    setIsOptimizing(true);
    try {
      const result = await promptOptimizerApi.optimize({
        currentPrompt: generatedPrompt,
        feedback: feedback || '请优化这个提示词，提高质量'
      });
      setGeneratedPrompt(result.content);
      setFeedback('');
      setShowOptimizeForm(false);
    } catch (error) {
      console.error('优化失败:', error);
      alert('优化失败，请稍后重试');
    } finally {
      setIsOptimizing(false);
    }
  };

  // 复制到剪贴板
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 取消优化
  const handleCancelOptimize = () => {
    setShowOptimizeForm(false);
    setFeedback('');
  };

  // 选择模板
  const handleSelectTemplate = (templateTask: string) => {
    setTask(templateTask);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左侧：任务输入区 */}
      <div className="space-y-6 h-[600px] flex flex-col">
        {/* 任务输入 */}
        <div className="bg-card border border-border rounded-xl p-6 flex-shrink-0">
          <h2 className="text-lg font-semibold mb-4">你的任务</h2>
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="例如：帮我写一个Python爬虫，爬取知乎热榜数据..."
            className="w-full h-32 p-4 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background mb-4"
          />



          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={!task || isGenerating}
            className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                生成 Prompt
              </>
            )}
          </button>
        </div>

        {/* Prompt示例 */}
        <div className="bg-card border border-border rounded-xl p-6 flex-grow overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Prompt示例</h2>
          <div className="h-[calc(100%-40px)] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.task)}
                  className="border border-border rounded-lg p-3 hover:bg-muted cursor-pointer transition-colors"
                >
                  <div className="text-sm font-medium mb-1">{template.icon} {template.name}</div>
                  <div className="text-xs text-muted-foreground">{template.task}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 右侧：生成结果区 */}
      <div className="h-[600px]">
        {generatedPrompt ? (
          <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4">生成后的 Prompt</h2>
            
            {/* 生成的提示词内容 */}
            <div className="flex-1 p-4 bg-muted rounded-lg overflow-y-auto mb-6">
              <pre className="whitespace-pre-wrap text-sm break-words font-mono">{generatedPrompt}</pre>
            </div>

            {/* 底部操作区 */}
            {!showOptimizeForm ? (
              <div className="space-y-4">
                {/* 优化链接 */}
                <div className="text-center">
                  <button
                    onClick={() => setShowOptimizeForm(true)}
                    className="text-primary hover:underline flex items-center justify-center gap-1"
                  >
                    优化你的 Prompt <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 复制按钮 */}
                <button
                  onClick={handleCopy}
                  className="w-full py-3 bg-secondary text-secondary-foreground rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 优化输入 */}
                <div className="border border-primary rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">你希望如何优化你的 Prompt？</h3>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="例如：增加更多具体要求、改进表述方式..."
                    className="w-full h-24 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background mb-4"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleOptimize}
                      disabled={isOptimizing}
                      className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-1 hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {isOptimizing ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          优化中...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          优化
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelOptimize}
                      className="flex-1 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">点击左侧「生成 Prompt」按钮开始</p>
              <p className="text-sm text-muted-foreground">输入你的任务描述，AI 将为你生成高质量的提示词</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}