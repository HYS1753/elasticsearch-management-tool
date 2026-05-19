'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { RefreshControls } from '@/components/common/refresh-controls';
import { ErrorDisplay } from '@/components/common/error-display';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';
import { TimeRangeSelector } from '@/components/dashboard/time-range-selector';
import { KpiSummaryCards } from '@/components/dashboard/kpi-summary-cards';
import { NodeResourcesSection } from '@/components/dashboard/node-resources-section';
import { SearchPerformanceSection } from '@/components/dashboard/search-performance-section';
import { IndexingPerformanceSection } from '@/components/dashboard/indexing-performance-section';
import { CacheThreadPoolSection } from '@/components/dashboard/cache-threadpool-section';
import { StorageOverviewSection } from '@/components/dashboard/storage-overview-section';
import type { RefreshInterval } from '@/components/common/refresh-controls';
import type { TimeRange } from '@/types/metrics';
import type {
  ClusterOverviewResponse,
  NodeResourcesResponse,
  SearchPerformanceResponse,
  IndexingPerformanceResponse,
  CacheThreadPoolResponse,
  StorageOverviewResponse,
} from '@/types/metrics';

export default function DashboardPage() {
  // ── State ──
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>('manual');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Custom Date Range States ──
  const [appliedCustomStart, setAppliedCustomStart] = useState<string>('');
  const [appliedCustomEnd, setAppliedCustomEnd] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ── Data ──
  const [clusterOverview, setClusterOverview] = useState<ClusterOverviewResponse | null>(null);
  const [nodeResources, setNodeResources] = useState<NodeResourcesResponse | null>(null);
  const [searchPerformance, setSearchPerformance] = useState<SearchPerformanceResponse | null>(null);
  const [indexingPerformance, setIndexingPerformance] = useState<IndexingPerformanceResponse | null>(null);
  const [cacheThreadPool, setCacheThreadPool] = useState<CacheThreadPoolResponse | null>(null);
  const [storageOverview, setStorageOverview] = useState<StorageOverviewResponse | null>(null);

  // ── Prev Time Range Tracking for delayed fetching during transitions ──
  const prevTimeRangeRef = useRef<TimeRange>(timeRange);

  // ── Fetch ──
  const fetchAllData = useCallback(async (showLoading = true) => {
    if (timeRange === 'custom') {
      const startVal = appliedCustomStart;
      const endVal = appliedCustomEnd;
      if (!startVal || !endVal) return;
    }

    if (showLoading) setLoading(true);
    setError(null);

    try {
      let timeParam = `time_range=${timeRange}`;
      if (timeRange === 'custom') {
        const startVal = appliedCustomStart;
        const endVal = appliedCustomEnd;
        const startISO = new Date(startVal).toISOString();
        const endISO = new Date(endVal).toISOString();
        timeParam = `time_range=custom&start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`;
      }

      const [
        clusterRes,
        nodeRes,
        searchRes,
        indexingRes,
        cacheRes,
        storageRes,
      ] = await Promise.all([
        fetch('/api/metrics/cluster-overview'),
        fetch(`/api/metrics/node-resources?${timeParam}`),
        fetch(`/api/metrics/search-performance?${timeParam}`),
        fetch(`/api/metrics/indexing-performance?${timeParam}`),
        fetch(`/api/metrics/cache-threadpool?${timeParam}`),
        fetch('/api/metrics/storage-overview'),
      ]);

      // Check for any failures
      const responses = [clusterRes, nodeRes, searchRes, indexingRes, cacheRes, storageRes];
      const failedIdx = responses.findIndex(r => !r.ok);
      if (failedIdx !== -1) {
        throw new Error(`Failed to fetch metrics data (endpoint ${failedIdx})`);
      }

      const [
        clusterData,
        nodeData,
        searchData,
        indexingData,
        cacheData,
        storageData,
      ] = await Promise.all(responses.map(r => r.json()));

      setClusterOverview(clusterData);
      setNodeResources(nodeData);
      setSearchPerformance(searchData);
      setIndexingPerformance(indexingData);
      setCacheThreadPool(cacheData);
      setStorageOverview(storageData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Dashboard fetch error:', message);
      setError(message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [timeRange, appliedCustomStart, appliedCustomEnd]);

  const { isAutoRefreshing, resetKey, resetTimer } = useAutoRefresh(refreshInterval, () => fetchAllData(false));

  // ── Initial fetch & refetch on timeRange or applied custom range change ──
  useEffect(() => {
    const hasTimeRangeChanged = prevTimeRangeRef.current !== timeRange;

    if (hasTimeRangeChanged) {
      // Delay actual network call to let 400ms transition complete smoothly
      const timer = setTimeout(() => {
        fetchAllData();
      }, 400);
      prevTimeRangeRef.current = timeRange;
      return () => clearTimeout(timer);
    }

    prevTimeRangeRef.current = timeRange;
    fetchAllData();
  }, [fetchAllData, timeRange, appliedCustomStart, appliedCustomEnd]);

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
    if (newRange === 'custom') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
      setAppliedCustomStart('');
      setAppliedCustomEnd('');
    }
  };

  // ── Cluster health status for header badge ──
  const healthStatus = clusterOverview?.health?.status || 'unknown';
  const healthColor = healthStatus === 'green'
    ? 'bg-emerald-500'
    : healthStatus === 'yellow'
      ? 'bg-amber-500'
      : healthStatus === 'red'
        ? 'bg-rose-500'
        : 'bg-slate-400';

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => fetchAllData()} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto px-6 py-8 space-y-8">

        {/* ── Page Header ── */}
        <PageHeader
          title="Cluster Dashboard"
          description="Elasticsearch cluster metrics powered by Prometheus — real-time and historical views"
          actions={
            <div className="flex items-center gap-3">
              {/* Health status indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <span className={`w-2.5 h-2.5 rounded-full ${healthColor} animate-pulse`} />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  {healthStatus}
                </span>
              </div>

              <TimeRangeSelector
                value={timeRange}
                onChange={handleTimeRangeChange}
                appliedCustomStart={appliedCustomStart}
                appliedCustomEnd={appliedCustomEnd}
                onDatePickerApply={(startISO, endISO) => {
                  setAppliedCustomStart(startISO);
                  setAppliedCustomEnd(endISO);
                  setShowDatePicker(false);
                }}
              />

              <div
                className="flex items-center overflow-hidden"
                style={{
                  maxWidth: timeRange === 'custom' ? '0px' : '230px',
                  opacity: timeRange === 'custom' ? 0 : 1,
                  marginLeft: timeRange === 'custom' ? '-12px' : '0px',
                  transition: 'max-width 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease-out, margin-left 400ms cubic-bezier(0.16, 1, 0.3, 1)',
                  pointerEvents: timeRange === 'custom' ? 'none' : 'auto'
                }}
              >
                <RefreshControls
                  refreshInterval={refreshInterval}
                  onRefreshIntervalChange={setRefreshInterval}
                  onRefresh={() => {
                    resetTimer();
                    fetchAllData();
                  }}
                  isAutoRefreshing={isAutoRefreshing}
                  resetKey={resetKey}
                  loading={loading}
                />
              </div>
            </div>
          }
        />

        {/* ── KPI Summary Cards ── */}
        <KpiSummaryCards data={clusterOverview?.health || null} loading={loading} />

        {/* ── Node Resources ── */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <NodeResourcesSection data={nodeResources} loading={loading} />
        </div>

        {/* ── Search Performance ── */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <SearchPerformanceSection data={searchPerformance} loading={loading} />
        </div>

        {/* ── Indexing Performance ── */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <IndexingPerformanceSection data={indexingPerformance} loading={loading} />
        </div>

        {/* ── Cache & Thread Pool ── */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <CacheThreadPoolSection data={cacheThreadPool} loading={loading} />
        </div>

        {/* ── Storage Overview ── */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 pb-8">
          <StorageOverviewSection data={storageOverview} loading={loading} />
        </div>

      </div>
    </div>
  );
}
