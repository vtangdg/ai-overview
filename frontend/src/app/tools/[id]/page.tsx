'use client';

import { useRouter } from 'next/navigation';
import { Layout } from '../../../components/common';
import { ToolDetail } from '@/components/tools/tool-detail';
import { use } from 'react';

interface Props {
  params: Promise<{ id: string }>;
}

export default function ToolDetailPage({ params }: Props) {
  const router = useRouter();
  const {id} = use(params);

  const handleBack = () => {
    router.push('/tools');
  };

  return (
    <Layout>
      <ToolDetail
        toolId={parseInt(id, 10)}
        onBack={handleBack}
      />
    </Layout>
  );
}