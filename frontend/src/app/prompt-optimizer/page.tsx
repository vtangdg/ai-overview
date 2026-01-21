'use client';

import { useState } from 'react';
import { PromptEditor } from '@/components/demos/prompt-editor';
import { Layout } from '@/components/common';
import { Sparkles } from 'lucide-react';

export default function PromptOptimizerPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* 标题区 */}
        <div className="flex items-center gap-3 mb-8">
          <Sparkles size={28} className="text-primary" />
          <h1 className="text-3xl font-bold">提示词优化器</h1>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* 编辑器 */}
          <PromptEditor initialTemplate={selectedTemplate} />
        </div>
      </div>
    </Layout>
  );
}
