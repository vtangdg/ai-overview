'use client';

import { useRouter } from 'next/navigation';
import { Layout } from '../../components/common';
import { ToolsPage } from '@/components/tools/tools-page';

export default function ToolsRoute() {
  const router = useRouter();
  
  const handleToolClick = (id: number) => {
    router.push(`/tools/${id}`);
  };
  
  return (
    <Layout>
      <ToolsPage onToolClick={handleToolClick} />
    </Layout>
  );
}