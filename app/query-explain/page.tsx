'use client';

import { SearchCode } from 'lucide-react';
import { QueryExplainTab } from '@/components/query-explain/query-explain-tab';
import { PageHeader } from '@/components/common/page-header';

export default function QueryExplainPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <PageHeader
          title="Query Explain"
          description="검색 explain summary와 detail을 조회하고 점수 계산 과정을 확인합니다."
        />

        <div className="space-y-4">
          <QueryExplainTab />
        </div>
      </div>
    </div>
  );
}