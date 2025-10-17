'use client';

import { useRouter } from 'next/navigation';
import { Layout } from '../../../components/common';
import { ConceptExplainer } from '@/components/demos/concept-explainer';

export default function DemoDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  const handleBack = () => {
    router.push('/demos');
  };

  if (params.id === 'concept-explainer') {
    return (
      <Layout>
        <ConceptExplainer
          onBack={handleBack}
        />
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