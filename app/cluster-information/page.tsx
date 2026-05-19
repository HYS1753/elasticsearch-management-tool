'use client';

import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Activity, Server, HardDrive, CheckCircle2, Boxes, Hexagon, Grid3x3, Search } from 'lucide-react';
import { formatBytes, formatNumber, getHealthColor } from '@/lib/utils';
import { PageHeader } from '@/components/common/page-header';
import { RefreshControls, RefreshInterval } from '@/components/common/refresh-controls';
import { ErrorDisplay } from '@/components/common/error-display';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';
import { fetchIndicesPlacement } from '@/lib/client-api/indices';
import { GridView } from '@/components/indices/grid-view';
import { ShardDialog } from '@/components/indices/shard-dialog';
import { useAnimatedCounter } from '@/hooks/use-animated-counter';
import type { ClusterStatus, NodeStatus } from '@/types';
import type { IndicesPlacementResponse } from '@/types/indices-placement';

function getBarColor(percent: number) {
  if (percent < 60) return '#2ECC71'; // Green
  if (percent < 75) return '#F1C40F'; // Yellow
  if (percent < 90) return '#E67E22'; // Orange
  return '#E74C3C'; // Red
}

function getHealthTextColor(status: string) {
  const s = status.toLowerCase();
  if (s === 'green') {
    return 'text-emerald-600';
  }
  if (s === 'yellow') {
    return 'text-amber-500';
  }
  return 'text-rose-600';
}

function AnimatedValue({ value, duration = 800, formatter = (v: number) => v.toString() }: { 
  value: number; 
  duration?: number;
  formatter?: (v: number) => string;
}) {
  const animated = useAnimatedCounter(value, duration);
  return <>{formatter(animated)}</>;
}

interface NodeStatusCardProps {
  node: NodeStatus;
}

function NodeStatusCard({ node }: NodeStatusCardProps) {
  const visibleRoles = node.roles.slice(0, 2);
  const hiddenRoles = node.roles.slice(2);
  const hasMoreRoles = hiddenRoles.length > 0;

  // Animating values (Slowed down to 1.5s for smoother, more premium motion)
  const cpuPercent = useAnimatedCounter(node.stats.os_cpu_percent, 1500);
  const fsUsedPercent = useAnimatedCounter(node.stats.fs_used_percent, 1500);
  const osMemUsedPercent = useAnimatedCounter(node.stats.os_mem_used_percent, 1500);
  const jvmHeapUsedPercent = useAnimatedCounter(node.stats.jvm_heap_used_percent, 1500);
  const searchActive = useAnimatedCounter(node.stats.search_active, 1500);
  const indexingPressurePercent = useAnimatedCounter(node.stats.indexing_pressure_percent, 1500);

  return (
    <div key={node.id} className="border border-slate-100 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-950 shadow-sm flex-1 flex flex-col justify-between">
      
      {/* Upper Metadata Row: Master Slot & Roles perfectly aligned */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3">
        
        {/* Left aligned elements with w-[65px] master badge slot, NO divider after Info icon */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-bold text-slate-900 dark:text-slate-50 text-sm md:text-base select-none">{node.name}</span>
          
          {/* Prominent tooltip i SVG with enlarged text details (text-xs) */}
          <span className="group relative cursor-pointer flex items-center">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-slate-400 hover:text-indigo-650 transition-colors"><circle cx="12" cy="12" r="10" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg text-xs text-slate-700 dark:text-slate-300 p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 font-sans leading-normal">
              <div className="font-bold border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-1.5 text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Server className="h-4 w-4 text-indigo-500" />
                Node Info Metadata
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between"><span className="text-slate-400 font-semibold">Node ID</span><span className="font-bold text-slate-800 dark:text-slate-200 font-mono truncate max-w-[130px]" title={node.id}>{node.id}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-semibold">Host IP</span><span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{node.host}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-semibold">Transport</span><span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{node.transport}</span></div>
              </div>
            </span>
          </span>

          {/* Master Badge slot (always occupies w-[65px] for uniform alignment, no prior divider) */}
          <div className="min-w-[65px] flex items-center justify-start select-none">
            {node.is_master_node ? (
              <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-blue-600 hover:bg-blue-600 text-white font-bold leading-normal">Master</Badge>
            ) : (
              <span className="text-transparent select-none text-xs">-</span>
            )}
          </div>

          {/* Divider | before roles */}
          <span className="text-slate-300 font-light select-none text-sm">|</span>

          {/* Roles: Label & gray badges with perfect center alignment for +N */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 select-none">Roles:</span>
            {visibleRoles.map((role, idx) => (
               <Badge 
                key={idx} 
                variant="secondary" 
                className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-none select-none"
              >
                {role}
              </Badge>
            ))}
            {hasMoreRoles && (
              <span className="group relative flex items-center">
                <Badge 
                  variant="secondary" 
                  className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border-none cursor-pointer select-none"
                >
                  +{hiddenRoles.length}
                </Badge>
                <span className="absolute left-0 top-full mt-1.5 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                  <span className="flex flex-wrap gap-1">
                    {hiddenRoles.map((role, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="text-[9px] px-1 py-0 bg-slate-100 dark:bg-slate-800 text-slate-750 dark:text-slate-300"
                      >
                        {role}
                      </Badge>
                    ))}
                  </span>
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Right aligned: Documents Count - Text Size comfy text-xs */}
        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-900 px-2.5 py-0.5 rounded border border-slate-150 flex items-center gap-1 select-none">
          <span className="text-slate-400 font-medium">Docs:</span>
          <span className="text-slate-800 dark:text-slate-200">
            <AnimatedValue value={node.stats.docs_count} formatter={formatNumber} />
          </span>
        </div>

      </div>

      {/* Lower Resource Grid - 3 Columns inside Node resource bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        
        {/* CPU */}
        <div>
          <div className="flex items-center justify-between text-xs mb-0.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">CPU</span>
            <span className="group relative">
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-slate-400 cursor-pointer"><circle cx="12" cy="12" r="10" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg>
              <span className="absolute right-0 bottom-full mb-1.5 w-56 bg-white dark:bg-slate-950 border border-slate-250 rounded shadow-lg text-xs text-slate-700 dark:text-slate-300 p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-normal">
                CPU 사용률입니다.<br />Current: {node.stats.os_cpu_percent}%<br />1m avg: {node.stats.os_cpu_load_average_1m}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 w-9 text-right">{cpuPercent}%</span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-350" 
                style={{ 
                  width: `${cpuPercent}%`, 
                  background: getBarColor(node.stats.os_cpu_percent),
                  transformOrigin: 'left',
                  animation: 'growWidth 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }} 
              />
            </div>
          </div>
        </div>

        {/* Storage */}
        <div>
          <div className="flex items-center justify-between text-xs mb-0.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Storage</span>
            <span className="group relative">
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-slate-400 cursor-pointer"><circle cx="12" cy="12" r="10" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg>
              <span className="absolute right-0 bottom-full mb-1.5 w-56 bg-white dark:bg-slate-950 border border-slate-250 rounded shadow-lg text-xs text-slate-700 dark:text-slate-300 p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-normal">
                디스크 사용률입니다.<br />Used: {node.stats.fs_used}<br />Total: {node.stats.fs_total}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 w-9 text-right">{fsUsedPercent}%</span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-350" 
                style={{ 
                  width: `${fsUsedPercent}%`, 
                  background: getBarColor(node.stats.fs_used_percent),
                  transformOrigin: 'left',
                  animation: 'growWidth 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }} 
              />
            </div>
          </div>
        </div>

        {/* Memory */}
        <div>
          <div className="flex items-center justify-between text-xs mb-0.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Memory</span>
            <span className="group relative">
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-slate-400 cursor-pointer"><circle cx="12" cy="12" r="10" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg>
              <span className="absolute right-0 bottom-full mb-1.5 w-56 bg-white dark:bg-slate-950 border border-slate-250 rounded shadow-lg text-xs text-slate-700 dark:text-slate-300 p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-normal">
                시스템 메모리 점유율.<br />Used: {node.stats.os_mem_used}<br />Total: {node.stats.os_mem_total}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 w-9 text-right">{osMemUsedPercent}%</span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-350" 
                style={{ 
                  width: `${osMemUsedPercent}%`, 
                  background: getBarColor(node.stats.os_mem_used_percent),
                  transformOrigin: 'left',
                  animation: 'growWidth 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }} 
              />
            </div>
          </div>
        </div>

        {/* JVM Heap */}
        <div>
          <div className="flex items-center justify-between text-xs mb-0.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">JVM Heap</span>
            <span className="group relative">
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-slate-400 cursor-pointer"><circle cx="12" cy="12" r="10" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg>
              <span className="absolute right-0 bottom-full mb-1.5 w-56 bg-white dark:bg-slate-950 border border-slate-250 rounded shadow-lg text-xs text-slate-700 dark:text-slate-300 p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-normal">
                JVM Heap 점유율입니다.<br />Used: {node.stats.jvm_heap_used}<br />Max: {node.stats.jvm_heap_max}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 w-9 text-right">{jvmHeapUsedPercent}%</span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-350" 
                style={{ 
                  width: `${jvmHeapUsedPercent}%`, 
                  background: getBarColor(node.stats.jvm_heap_used_percent),
                  transformOrigin: 'left',
                  animation: 'growWidth 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }} 
              />
            </div>
          </div>
        </div>

        {/* Search Active */}
        <div>
          <div className="flex items-center justify-between text-xs mb-0.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Search Active</span>
            <span className="group relative">
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-slate-400 cursor-pointer"><circle cx="12" cy="12" r="10" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg>
              <span className="absolute right-0 bottom-full mb-1.5 w-56 bg-white dark:bg-slate-950 border border-slate-250 rounded shadow-lg text-xs text-slate-700 dark:text-slate-300 p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-normal">
                현재 활성화된 검색 스레드 작업 수입니다.<br />Active: {node.stats.search_active}<br />Queue: {node.stats.search_queue}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 w-9 text-right">{searchActive}</span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-350" 
                style={{ 
                  width: `${Math.min(node.stats.search_active * 10, 100)}%`, 
                  background: getBarColor(Math.min(node.stats.search_active * 10, 100)),
                  transformOrigin: 'left',
                  animation: 'growWidth 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }} 
              />
            </div>
          </div>
        </div>

        {/* Indexing Pressure */}
        <div>
          <div className="flex items-center justify-between text-xs mb-0.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Indexing Pressure</span>
            <span className="group relative">
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-slate-400 cursor-pointer"><circle cx="12" cy="12" r="10" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg>
              <span className="absolute right-0 bottom-full mb-1.5 w-56 bg-white dark:bg-slate-950 border border-slate-250 rounded shadow-lg text-xs text-slate-700 dark:text-slate-300 p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-normal">
                인덱싱 압력(메모리 기준)입니다.<br />Used: {node.stats.indexing_pressure_percent}%<br />Limit: {node.stats.indexing_limit}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 w-9 text-right">{indexingPressurePercent}%</span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-350" 
                style={{ 
                  width: `${indexingPressurePercent}%`, 
                  background: getBarColor(node.stats.indexing_pressure_percent),
                  transformOrigin: 'left',
                  animation: 'growWidth 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }} 
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function ClusterPage() {
  const [clusterStatus, setClusterStatus] = useState<ClusterStatus | null>(null);
  const [nodeStatus, setNodeStatus] = useState<NodeStatus[] | null>(null);
  const [gridData, setGridData] = useState<IndicesPlacementResponse['data'] | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>('manual');
  
  const [includeHiddenIndex, setIncludeHiddenIndex] = useState(false);
  const [includeClosedIndex, setIncludeClosedIndex] = useState(false);
  const [selectedShard, setSelectedShard] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Unified parallel data fetching
  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [clusterStateRes, nodeStatusRes, indicesPlacementRes] = await Promise.all([
        fetch('/api/cluster/cluster-status'),
        fetch('/api/cluster/node-status'),
        fetch(`/api/indices/indices-placement?include_hidden_index=${includeHiddenIndex}&include_closed_index=${includeClosedIndex}`),
      ]);

      if (!clusterStateRes.ok || !nodeStatusRes.ok || !indicesPlacementRes.ok) {
        throw new Error('Failed to retrieve Elasticsearch cluster status and statistics');
      }

      const clusterStateData = await clusterStateRes.json();
      const nodeStatusData = await nodeStatusRes.json();
      const indicesPlacementData = await indicesPlacementRes.json();

      if (clusterStateData) {
        setClusterStatus(clusterStateData);
      } else {
        throw new Error('Cluster state payload is empty');
      }

      if (nodeStatusData.code === '200' && nodeStatusData.data?.nodes) {
        setNodeStatus(nodeStatusData.data.nodes);
      } else {
        throw new Error(nodeStatusData.message || 'Failed to retrieve node status');
      }

      if (indicesPlacementData.code === '200') {
        setGridData(indicesPlacementData.data);
      } else {
        throw new Error(indicesPlacementData.message || 'Failed to retrieve indices placement');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while loading dashboard metrics');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [includeHiddenIndex, includeClosedIndex]);

  const { isAutoRefreshing, resetKey, resetTimer } = useAutoRefresh(refreshInterval, () => fetchData(false));

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => fetchData()} />;
  }

  if (!clusterStatus) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 py-8 flex flex-col justify-center items-center">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  const nodes = nodeStatus || [];
  const totalDocs = nodes.reduce((sum, node) => sum + (node.stats?.docs_count || 0), 0);

  // Client-side real-time filter computation
  const filteredGridData = gridData ? {
    ...gridData,
    indices: gridData.indices.filter(idx => idx.index.toLowerCase().includes(searchTerm.toLowerCase()))
  } : null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <style>{`
        @keyframes growWidth {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
      <div className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Page Header */}
        <PageHeader
          title="Cluster Information"
          description="Monitor your Elasticsearch cluster health, shard topology, and node utilization in real time"
          actions={
            <RefreshControls
              refreshInterval={refreshInterval}
              onRefreshIntervalChange={setRefreshInterval}
              onRefresh={() => {
                resetTimer();
                fetchData();
              }}
              isAutoRefreshing={isAutoRefreshing}
              resetKey={resetKey}
              loading={loading}
            />
          }
        />

        {/* Top Section: Split Kibana Dashboard Layout 3:7 inside 10-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch">
          
          {/* Top-Left Column (3/10): Cluster Status with description subtext */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            <div className="flex flex-col justify-center min-h-[52px]">
              <div className="flex items-center gap-2">
                <Boxes className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Cluster Status</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Health and operational summary</p>
            </div>

            {loading && !clusterStatus ? (
              <Skeleton className="flex-1 min-h-[300px] w-full rounded-lg" />
            ) : (
              /* Unified Cluster Health Card stretching cleanly with Right Node column */
              <Card className="border-slate-200/60 shadow-sm flex flex-col justify-between flex-1 bg-white dark:bg-slate-950">
                
                {/* 1. Ultra Prominent Clean Health State Title at the Top (No buttons or circles) */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 rounded-t-lg">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 select-none">Cluster Health State</span>
                  <span className={`text-3xl font-black capitalize tracking-tight select-none ${getHealthTextColor(clusterStatus.status)}`}>
                    {clusterStatus.status}
                  </span>
                </div>

                {/* Core Metrics List - Font Sizes bumped up to readable text-sm middle-ground */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-center">
                  <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span>Cluster Name</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[125px] text-right" title={clusterStatus.cluster_name}>
                      {clusterStatus.cluster_name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span>Topology</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold text-right">
                      <AnimatedValue value={clusterStatus.number_of_nodes} /> Nodes (<AnimatedValue value={clusterStatus.number_of_data_nodes} /> Data)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span>Active Shards</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold text-right">
                      <AnimatedValue value={clusterStatus.active_shards} formatter={formatNumber} /> (<AnimatedValue value={Math.round(clusterStatus.active_shards_percent_as_number * 10)} formatter={v => (v / 10).toFixed(1)} />%)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span>Total Docs</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold text-right">
                      <AnimatedValue value={totalDocs} formatter={formatNumber} />
                    </span>
                  </div>
                </div>

                {/* Bottom part: Compact detailed sub-metrics grid */}
                <div className="border-t border-slate-100 dark:border-slate-800 p-5 bg-slate-50/20">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 border border-slate-100 dark:border-slate-800 rounded bg-white dark:bg-slate-950 hover:bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Relocating</span>
                      <span className={`text-sm font-extrabold block mt-0.5 ${clusterStatus.relocating_shards > 0 ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        <AnimatedValue value={clusterStatus.relocating_shards} />
                      </span>
                    </div>
                    <div className="p-2 border border-slate-100 dark:border-slate-800 rounded bg-white dark:bg-slate-950 hover:bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Initializing</span>
                      <span className={`text-sm font-extrabold block mt-0.5 ${clusterStatus.initializing_shards > 0 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>
                        <AnimatedValue value={clusterStatus.initializing_shards} />
                      </span>
                    </div>
                    <div className="p-2 border border-slate-100 dark:border-slate-800 rounded bg-white dark:bg-slate-950 hover:bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Unassigned</span>
                      <span className={`text-sm font-extrabold block mt-0.5 ${clusterStatus.unassigned_shards > 0 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        <AnimatedValue value={clusterStatus.unassigned_shards} />
                      </span>
                    </div>
                    <div className="p-2 border border-slate-100 dark:border-slate-800 rounded bg-white dark:bg-slate-950 hover:bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Pending</span>
                      <span className={`text-sm font-extrabold block mt-0.5 ${clusterStatus.number_of_pending_tasks > 0 ? 'text-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        <AnimatedValue value={clusterStatus.number_of_pending_tasks} />
                      </span>
                    </div>
                    <div className="p-2 border border-slate-100 dark:border-slate-800 rounded bg-white dark:bg-slate-950 hover:bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">In-Flight</span>
                      <span className={`text-sm font-extrabold block mt-0.5 ${clusterStatus.number_of_in_flight_fetch > 0 ? 'text-purple-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        <AnimatedValue value={clusterStatus.number_of_in_flight_fetch} />
                      </span>
                    </div>
                    <div className="p-2 border border-slate-100 dark:border-slate-800 rounded bg-white dark:bg-slate-950 hover:bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Delayed</span>
                      <span className={`text-sm font-extrabold block mt-0.5 ${clusterStatus.delayed_unassigned_shards > 0 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        <AnimatedValue value={clusterStatus.delayed_unassigned_shards} />
                      </span>
                    </div>
                  </div>
                </div>

              </Card>
            )}
          </div>

          {/* Top-Right Column (7/10): Node Status stretching and stacking dynamically with subtitle */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="flex flex-col justify-center min-h-[52px]">
              <div className="flex items-center gap-2">
                <Hexagon className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Node Status</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time resource utilization across active nodes</p>
            </div>

            {loading && nodes.length === 0 ? (
              <Skeleton className="flex-1 w-full rounded-lg" />
            ) : (
              /* Continuous matching height card */
              <Card className="border-slate-200/60 shadow-sm flex-1 bg-white dark:bg-slate-950 flex flex-col justify-between">
                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  
                  {nodes.map((node) => (
                    <NodeStatusCard key={node.id} node={node} />
                  ))}

                </CardContent>
              </Card>
            )}
          </div>

        </div>

        {/* Bottom Section: Shard Allocation Grid & Indices Inventory Map (Full Width 100%) */}
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          
          {/* Unified Shard allocation grid layout: Title & Description on the Left, Legend & Controls on the Right */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            
            {/* Left side: Title & Description */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <Grid3x3 className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Shard Allocation Grid
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Interactive shard allocation topology across cluster nodes
              </p>
            </div>

            {/* Right side: Legend and Controls aligned in a single line with gap-6 spacing */}
            <div className="flex items-center gap-6 select-none flex-wrap">
              
              {/* 1. Shard Legend (placed to the left of include hidden) */}
              <div className="flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded border border-solid border-green-600 bg-green-100 dark:border-emerald-500/50 dark:bg-emerald-500/20"></div>
                  <span>Primary</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded border border-dashed border-blue-600 bg-blue-100 dark:border-sky-500/50 dark:bg-sky-500/20"></div>
                  <span>Replica</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded border border-dashed border-amber-500 bg-amber-100 dark:border-amber-500/50 dark:bg-amber-500/20"></div>
                  <span>Unassigned</span>
                </div>
              </div>

              {/* 2. Include hidden switch */}
              <div className="flex items-center space-x-1.5">
                <Switch
                  checked={includeHiddenIndex}
                  onCheckedChange={setIncludeHiddenIndex}
                  id="include-hidden"
                />
                <Label htmlFor="include-hidden" className="text-[11px] font-bold cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                  Include hidden
                </Label>
              </div>

              {/* 3. Include closed switch */}
              <div className="flex items-center space-x-1.5">
                <Switch
                  checked={includeClosedIndex}
                  onCheckedChange={setIncludeClosedIndex}
                  id="include-closed"
                />
                <Label htmlFor="include-closed" className="text-[11px] font-bold cursor-pointer text-slate-650 select-none">
                  Include closed
                </Label>
              </div>

              {/* 4. Search Filter Input */}
              <div className="relative w-56 sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Filter indices by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-2.5 h-8 text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus-visible:ring-1 focus-visible:ring-indigo-500 placeholder:text-slate-400"
                />
              </div>

            </div>

          </div>

          {/* Shard Allocator Card container */}
          <Card className="border-slate-200/60 shadow-sm bg-white dark:bg-slate-950 min-h-[350px]">
            <CardContent className="p-4 overflow-x-auto">
              {loading && !gridData ? (
                <Skeleton className="h-72 w-full rounded-lg" />
              ) : (
                <div className="transition-all duration-350">
                  {filteredGridData && (
                    <GridView data={filteredGridData} setSelectedShard={setSelectedShard} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Shard Dialog popup */}
        <ShardDialog shard={selectedShard} onClose={() => setSelectedShard(null)} />

      </div>
    </div>
  );
}
