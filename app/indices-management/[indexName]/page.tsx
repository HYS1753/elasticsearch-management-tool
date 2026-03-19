import { IndexDetailView } from '@/components/indices/index-detail-view';

interface IndexDetailPageProps {
  params: Promise<{
    indexName: string;
  }>;
}

export default async function IndexDetailPage({ params }: IndexDetailPageProps) {
  const { indexName } = await params;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <IndexDetailView indexName={decodeURIComponent(indexName)} />
      </div>
    </div>
  );
}