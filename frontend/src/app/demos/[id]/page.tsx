'use client';

import { useParams } from 'next/navigation';
import { Layout } from '../../../components/common';
import { ConceptExplainer } from '@/components/demos/concept-explainer';

export default function DemoDetailPage() {
  const params = useParams<{ id: string }>();

  
  // 移除未使用的返回函数
  // const handleBack = () => {
  //   router.push('/demos');
  // };

  if (params.id === 'concept-explainer') {
    return (
      <Layout>
        <ConceptExplainer />
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