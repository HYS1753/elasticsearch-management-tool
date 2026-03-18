import { IndexDetailView } from '@/components/indices/index-detail-view';

interface IndexDetailPageProps {
  params: Promise<{
    indexName: string;
  }>;
}

export default async function IndexDetailPage({ params }: IndexDetailPageProps) {
  const { indexName } = await params;

  return <IndexDetailView indexName={decodeURIComponent(indexName)} />;
}