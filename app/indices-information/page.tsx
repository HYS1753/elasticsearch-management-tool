'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Grid3x3, List } from 'lucide-react';
import type { IndicesPlacementResponse } from '@/types/indices-placement';
import type { IndexListItem } from '@/types/indices-list';
import { fetchIndicesPlacement, fetchIndicesList } from '@/lib/client-api/indices';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';
import { GridView } from '@/components/indices/grid-view';
import { ListView } from '@/components/indices/list-view';
import { ShardDialog } from '@/components/indices/shard-dialog';
import { PageHeader } from '@/components/common/page-header';
import { RefreshControls, RefreshInterval } from '@/components/common/refresh-controls';
import { ErrorDisplay } from '@/components/common/error-display';

type ViewMode = 'grid' | 'list';

export default function IndicesInformationPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [gridData, setGridData] = useState<IndicesPlacementResponse['data'] | null>(null);
  const [listData, setListData] = useState<IndexListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>('manual');
  const [includeHiddenIndex, setIncludeHiddenIndex] = useState(false);
  const [includeClosedIndex, setIncludeClosedIndex] = useState(false);
  const [selectedShard, setSelectedShard] = useState<any>(null);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      if (viewMode === 'grid') {
        const result = await fetchIndicesPlacement(includeHiddenIndex, includeClosedIndex);
        setGridData(result.data);
      } else {
        const result = await fetchIndicesList(includeHiddenIndex, includeClosedIndex);
        setListData(result.data.indices);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const { isAutoRefreshing, refreshProgress } = useAutoRefresh(refreshInterval, () => fetchData(false));

  useEffect(() => {
    fetchData();
  }, [viewMode, includeHiddenIndex, includeClosedIndex]);

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => fetchData()} />;
  }

  if (loading && !gridData && !listData) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="container mx-auto">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <PageHeader
          title="Indices Information"
          description={viewMode === 'grid' ? 'View shard allocation across cluster nodes' : 'View indices in list format'}
          actions={
            <>
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 border border-slate-200 rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="gap-2"
                >
                  <Grid3x3 className="h-4 w-4" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  List
                </Button>
              </div>

              <RefreshControls
                refreshInterval={refreshInterval}
                onRefreshIntervalChange={setRefreshInterval}
                onRefresh={() => fetchData()}
                isAutoRefreshing={isAutoRefreshing}
                refreshProgress={refreshProgress}
                loading={loading}
              />
            </>
          }
        />

        {/* View Content */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              {viewMode === 'grid' ? (
                <Grid3x3 className="h-5 w-5 text-blue-600" />
              ) : (
                <List className="h-5 w-5 text-blue-600" />
              )}
              <h2 className="text-xl font-semibold text-slate-900">
                {viewMode === 'grid' ? 'Shard Allocation Grid' : 'Indices List'}
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-1 ml-7">
              {viewMode === 'grid' ? 'Shard distribution across nodes' : 'Detailed list of all indices'}
            </p>
          </div>

          {/* Toggle Filters and Legend */}
          <div className="flex items-center justify-end gap-3">
            {/* Include Hidden Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={includeHiddenIndex}
                onCheckedChange={setIncludeHiddenIndex}
                id="include-hidden"
              />
              <Label htmlFor="include-hidden" className="text-sm cursor-pointer text-slate-700">
                Include hidden
              </Label>
            </div>

            {/* Include Closed Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={includeClosedIndex}
                onCheckedChange={setIncludeClosedIndex}
                id="include-closed"
              />
              <Label htmlFor="include-closed" className="text-sm cursor-pointer text-slate-700">
                Include closed
              </Label>
            </div>

            {/* Legend - Only show in grid view */}
            {viewMode === 'grid' && (
              <div className="flex items-center gap-4 text-xs text-slate-600 ml-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded border-2 border-solid border-green-600 bg-green-100"></div>
                  <span>Primary (p)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded border-2 border-dashed border-blue-600 bg-blue-100"></div>
                  <span>Replica (r)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded border-2 border-dashed border-amber-500 bg-amber-100"></div>
                  <span>Unassigned</span>
                </div>
              </div>
            )}
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && gridData && (
            <GridView data={gridData} setSelectedShard={setSelectedShard} />
          )}

          {/* List View */}
          {viewMode === 'list' && listData && (
            <ListView data={listData} />
          )}
        </div>

        {/* Shard Information Dialog */}
        <ShardDialog shard={selectedShard} onClose={() => setSelectedShard(null)} />
      </div>
    </div>
  );
}
