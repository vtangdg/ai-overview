'use client';

import { useRouter } from 'next/navigation';
import { Layout } from '../../components/common';
import { ConceptsPage } from '@/components/concepts/concepts-page';

export default function ConceptsRoute() {
  const router = useRouter();
  
  const handleTermClick = (id: string) => {
    router.push(`/concepts/${id}`);
  };
  
  return (
    <Layout>
      <ConceptsPage onTermClick={handleTermClick} />
    </Layout>
  );
}