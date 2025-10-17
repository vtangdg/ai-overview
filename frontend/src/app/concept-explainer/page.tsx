'use client';

import React from 'react';
import { ConceptExplainer } from '../../components/demos/concept-explainer';

export default function ConceptExplainerPage() {
  // 独立页面版本，不需要返回按钮功能
  const handleBack = () => {
    // 在独立页面中，可以导航回首页或应用广场
    window.history.back();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">AI概念解释器</h1>
      <ConceptExplainer onBack={handleBack} />
    </div>
  );
}