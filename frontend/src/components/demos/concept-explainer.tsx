import React, { useState } from 'react';
import { BookOpen, Send, Loader2 } from 'lucide-react';
// 使用MarkdownRenderer替代ReactMarkdown
import { MarkdownRenderer } from '../common/markdown/MarkdownRenderer';

export const ConceptExplainer: React.FC = () => {
  const [conceptName, setConceptName] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 使用MarkdownRenderer直接渲染解释内容

  const handleExplainConcept = async () => {
    if (!conceptName.trim() || isLoading) return;

    setExplanation('');
    setError('');
    setIsLoading(true);

    try {
      // 使用环境变量中的API基础URL
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/concept-explainer/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conceptName: conceptName.trim() }),
        // credentials: 'include', // 处理跨域Cookie
        // mode: 'cors' // 启用跨域
      });

      if (response.ok) {
        const data = await response.text();
        setExplanation(data);
      } else {
        const errorText = await response.text().catch(() => '未知错误');
        setError(`获取概念解释失败: ${errorText || `HTTP ${response.status}`}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(`网络请求失败: ${errorMessage}`);
      console.error('Error explaining concept:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleExplainConcept();
    }
  };

  const clearResults = () => {
    setExplanation('');
    setError('');
    setConceptName('');
  };

  return (
    <div className="space-y-8">
      <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">输入概念名称</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="例如：深度学习、大语言模型、生成式AI等"
              value={conceptName}
              onChange={(e) => setConceptName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <button
              onClick={handleExplainConcept}
              disabled={isLoading || !conceptName.trim()}
              className={`rounded-lg px-6 py-3 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium transition-all ${!conceptName.trim() ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary/90 hover:shadow-md'}`}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              解释
            </button>
          </div>
        </div>

        {(explanation || error) && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">解释结果</h3>
              <button 
                onClick={clearResults}
                className="px-3 py-1 rounded-md text-sm bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                清除
              </button>
            </div>
            {error ? (
              <div className="p-5 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-destructive">!</div>
                  <div>{error}</div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-lg border border-border bg-background shadow-sm overflow-hidden">
                <MarkdownRenderer content={explanation} />
              </div>
              
            )}
          </div>
        )}
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="text-primary w-5 h-5" />
          <h2 className="text-lg font-semibold text-primary-foreground">使用说明</h2>
        </div>
        <ul className="space-y-3 text-sm text-foreground/80">
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium mt-0.5">•</span>
            <span>输入AI相关概念名称，点击解释按钮获取AI生成的概念解释</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium mt-0.5">•</span>
            <span>解释内容包括概念定义、核心原理、应用场景和相关技术关联</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium mt-0.5">•</span>
            <span>系统使用DeepSeek大模型提供智能解释</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium mt-0.5">•</span>
            <span>解释结果将被缓存，相同概念的重复请求将更快响应</span>
          </li>
        </ul>
      </div>
    </div>
  );
};