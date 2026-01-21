'use client';

import { useParams } from 'next/navigation';
import { Layout } from '../../../components/common';
import { ConceptExplainer } from '@/components/demos/concept-explainer';
import { PromptEditor } from '@/components/demos/prompt-editor';
import { Sparkles } from 'lucide-react';

export default function DemoDetailPage() {
  const params = useParams<{ id: string }>();

  
  // 移除未使用的返回函数
  // const handleBack = () => {
  //   router.push('/demos');
  // };

  if (params.id === 'concept-explainer') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">AI概念解释器</h1>
          <ConceptExplainer />
        </div>
      </Layout>
    );
  } else if (params.id === 'prompt-optimizer') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles size={28} className="text-primary" />
            <h1 className="text-3xl font-bold">提示词优化器</h1>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            {/* 编辑器 */}
            <PromptEditor />
          </div>
        </div>
      </Layout>
    );
  } else {
    return (
      <Layout>
        <div className="text-center py-12">演示应用不存在</div>
      </Layout>
    );
  }
}