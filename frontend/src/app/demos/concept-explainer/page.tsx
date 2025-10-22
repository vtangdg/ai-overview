'use client';

import React from 'react';
import { ConceptExplainer } from '../../../components/demos/concept-explainer';

export default function ConceptExplainerDemoPage() {
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">AI概念解释器</h1>
      <ConceptExplainer />
    </div>
  );
}