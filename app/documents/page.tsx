'use client';

import { PageHeader } from '@/components/common/page-header';
import { DocumentExplorer } from '@/components/documents/document-explorer';

export default function DocumentsPage() {
  return (
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-6 py-8 space-y-8">
            <PageHeader
              title="Documents"
              description="Manage and explore your Elasticsearch documents"
            />
    
            <DocumentExplorer />
          </div>
        </div>
  );
}