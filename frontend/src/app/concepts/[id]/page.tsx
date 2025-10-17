'use client';

import { useRouter } from 'next/navigation';
import { Layout } from '../../../components/common';
import { TermDetail } from '@/components/concepts/term-detail';
import { use } from 'react';

interface Props {
  params: Promise<{ id: string }>;
}
export default function ConceptDetailPage({ params }: Props) {
  const router = useRouter();
  const {id} = use(params);

  const handleBack = () => {
    router.push('/concepts');
  };

  const handleRelatedTermClick = (id: string) => {
    router.push(`/concepts/${id}`);
  };

  return (
    <Layout>
      <TermDetail
        termId={id}
        onBack={handleBack}
        onRelatedTermClick={handleRelatedTermClick}
      />
    </Layout>
  );
}