'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, RotateCw, Copy, Check, ArrowRight, Square, AlertCircle } from 'lucide-react';
import { templates } from '@/features/prompt-optimizer/lib/templates';
import { isAbortError, promptOptimizerApi } from '@/features/prompt-optimizer/lib/api';

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
  const [errorMessage, setErrorMessage] = useState('');

  // 当前进行中的流式请求，用于「停止生成」和避免组件卸载后继续写入
  const abortRef = useRef<AbortController | null>(null);
  const taskInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (initialTemplate) {
      setTask(initialTemplate);
    }
  }, [initialTemplate]);

  // 组件卸载时中断未完成的流式请求，避免内存泄漏
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const isStreaming = isGenerating || isOptimizing;

  // 停止生成：保留已经产出的内容
  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsGenerating(false);
    setIsOptimizing(false);
  };

  // 生成提示词（流式）
  const handleGenerate = async () => {
    if (!task.trim() || isGenerating) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsGenerating(true);
    setGeneratedPrompt('');
    setErrorMessage('');
    setShowOptimizeForm(false);

    let content = '';
    let streamError = '';

    try {
      await promptOptimizerApi.generateStream(task.trim(), {
        signal: controller.signal,
        onDelta: (chunk) => {
          content += chunk;
          setGeneratedPrompt(content);
        },
        onError: (message) => {
          streamError = message;
        }
      });
      if (streamError) throw new Error(streamError);
    } catch (error) {
      // 用户主动停止不算失败
      if (isAbortError(error)) return;
      console.error('生成失败:', error);
      setErrorMessage(error instanceof Error ? error.message : '生成失败，请稍后重试');
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsGenerating(false);
    }
  };

  // 优化提示词（流式）
  const handleOptimize = async () => {
    if (!generatedPrompt || isOptimizing) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsOptimizing(true);
    setGeneratedPrompt('');
    setErrorMessage('');

    let content = '';
    let streamError = '';

    try {
      await promptOptimizerApi.optimizeStream(
        {
          currentPrompt: generatedPrompt,
          feedback: feedback.trim()
        },
        {
          signal: controller.signal,
          onDelta: (chunk) => {
            content += chunk;
            setGeneratedPrompt(content);
          },
          onError: (message) => {
            streamError = message;
          }
        }
      );
      if (streamError) throw new Error(streamError);
      setFeedback('');
      setShowOptimizeForm(false);
    } catch (error) {
      if (isAbortError(error)) return;
      console.error('优化失败:', error);
      setErrorMessage(error instanceof Error ? error.message : '优化失败，请稍后重试');
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
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

  // 选择示例：填入输入框并聚焦，方便直接修改占位符
  const handleSelectTemplate = (templateTask: string) => {
    setTask(templateTask);
    setErrorMessage('');
    taskInputRef.current?.focus();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左侧：任务输入区 */}
      <div className="space-y-6 lg:h-[600px] flex flex-col">
        {/* 任务输入 */}
        <div className="bg-card border border-border rounded-xl p-6 flex-shrink-0">
          <h2 className="text-lg font-semibold mb-4">你的任务</h2>
          <textarea
            ref={taskInputRef}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="例如：帮我写一个Python爬虫，爬取知乎热榜数据..."
            className="w-full h-32 p-4 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background mb-4"
          />

          {/* 生成 / 停止 */}
          {isGenerating ? (
            <button
              onClick={handleStop}
              className="w-full py-4 border border-border rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors"
            >
              <Square className="w-4 h-4" />
              停止生成
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!task.trim()}
              className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              生成 Prompt
            </button>
          )}
        </div>

        {/* Prompt示例 */}
        <div className="bg-card border border-border rounded-xl p-6 flex-grow overflow-hidden">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-semibold">Prompt示例</h2>
            <span className="text-xs text-muted-foreground">点击填入，按需替换 {'{占位符}'}</span>
          </div>
          <div className="h-[calc(100%-44px)] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelectTemplate(template.task)}
                  title={template.task}
                  className="text-left border border-border rounded-lg p-3 hover:border-primary/50 hover:bg-muted cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-sm font-medium truncate">
                      {template.icon} {template.name}
                    </span>
                    <span className="flex-shrink-0 text-[10px] leading-4 px-1.5 rounded bg-muted text-muted-foreground">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {template.task}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 右侧：生成结果区 */}
      <div className="lg:h-[600px]">
        {generatedPrompt || isStreaming ? (
          <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {isOptimizing ? '优化后的 Prompt' : '生成后的 Prompt'}
              </h2>
              {isStreaming && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <RotateCw className="w-3 h-3 animate-spin" />
                  {isOptimizing ? '优化中' : '生成中'}
                </span>
              )}
            </div>

            {/* 错误提示 */}
            {errorMessage && (
              <div className="flex items-start gap-2 mb-4 p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 生成的提示词内容 */}
            <div className="flex-1 p-4 bg-muted rounded-lg overflow-y-auto mb-6">
              <pre className="whitespace-pre-wrap text-sm break-words font-mono">
                {generatedPrompt}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 ml-0.5 align-text-bottom bg-primary animate-pulse" />
                )}
              </pre>
            </div>

            {/* 底部操作区 */}
            {isStreaming ? (
              <button
                onClick={handleStop}
                className="w-full py-3 border border-border rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors"
              >
                <Square className="w-4 h-4" />
                {isOptimizing ? '停止优化' : '停止生成'}
              </button>
            ) : !showOptimizeForm ? (
              <div className="space-y-4">
                {/* 优化链接 */}
                <div className="text-center">
                  <button
                    onClick={() => setShowOptimizeForm(true)}
                    className="text-primary hover:underline flex items-center justify-center gap-1 mx-auto"
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
                      className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                      优化
                    </button>
                    <button
                      onClick={handleCancelOptimize}
                      className="flex-1 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                    >
                      取消
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    留空则按「提升整体质量」进行优化
                  </p>
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
