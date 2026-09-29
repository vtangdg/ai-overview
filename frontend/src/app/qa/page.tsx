import type { Metadata } from 'next';
import { BookMarked } from 'lucide-react';
import { Layout } from '@/components/common';
import { QaChat } from '@/components/qa/qa-chat';

export const metadata: Metadata = {
  title: '知识问答 - AI探索者',
  description: '基于站内知识笔记的 RAG 知识问答，回答只依据站内内容生成并附可点击的来源引用',
};

export default function QaRoute() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <BookMarked size={28} className="text-primary" />
          <div>
            <h1 className="text-3xl font-bold">知识问答</h1>
            <p className="text-sm text-muted-foreground mt-1">
              用自然语言提问，答案来自站内知识笔记，且每条回答都能溯源到原文
            </p>
          </div>
        </div>

        <QaChat />
      </div>
    </Layout>
  );
}
