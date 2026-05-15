'use client';

import { Database, Info } from 'lucide-react';

import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from '@/components/ui/card';

const IndicesManagementList = dynamic(
  () => import('@/components/indices/indices-management-list').then(mod => mod.IndicesManagementList),
  { ssr: false }
);

export default function IndicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <PageHeader
          title="Indices Management"
          description="Manage and explore your Elasticsearch indices"
        />

        <IndicesManagementList />
      </div>
    </div>
  );
}