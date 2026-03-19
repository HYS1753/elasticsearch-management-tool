import { Database, Info } from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';
import { IndicesManagementList } from '@/components/indices/indices-management-list';
import { Card, CardContent } from '@/components/ui/card';

export default function IndicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <PageHeader
          title="Indices"
          description="Manage and explore your Elasticsearch indices"
        />

        <IndicesManagementList />
      </div>
    </div>
  );
}