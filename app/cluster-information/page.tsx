'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Server, HardDrive, CheckCircle2, Boxes, Hexagon } from 'lucide-react';
import { formatBytes, formatNumber, getHealthColor } from '@/lib/utils';
import { PageHeader } from '@/components/common/page-header';
import { RefreshControls, RefreshInterval } from '@/components/common/refresh-controls';
import { ErrorDisplay } from '@/components/common/error-display';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';
import type { ClusterStatus, NodeStatus } from '@/types';

function getBarColor(percent: number) {
  if (percent < 60) return '#2ECC71'; // Green
  if (percent < 75) return '#F1C40F'; // Yellow
  if (percent < 90) return '#E67E22'; // Orange
  return '#E74C3C'; // Red
}

export default function ClusterPage() {
  const [clusterStatus, setClusterStatus] = useState<ClusterStatus | null>(null);
  const [nodeStatus, setNodeStatus] = useState<NodeStatus[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>('manual');

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [clusterStateRes, nodeStatusRes] = await Promise.all([
        fetch('/api/cluster/cluster-status'),
        fetch('/api/cluster/node-status'),
      ]);

      const clusterStateData = await clusterStateRes.json();
      const nodeStatusData = await nodeStatusRes.json();

      if (clusterStateRes.ok) {
        setClusterStatus(clusterStateData);
      } else {
        throw new Error(clusterStateData.error?.message || 'Failed to fetch cluster status');
      }

      if (nodeStatusData.code === '200' && nodeStatusData.data?.nodes) {
        setNodeStatus(nodeStatusData.data.nodes);
      } else {
        throw new Error(nodeStatusData.message || 'Failed to fetch node status');
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
  }, []);

  // Skeleton for cluster cards
  const ClusterCardsSkeleton = (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
  // Skeleton for node cards
  const NodeCardsSkeleton = (
    <div className="space-y-4">
      {[...Array(1)].map((_, i) => (
        <Skeleton key={i} className="h-56 w-full" />
      ))}
    </div>
  );

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => fetchData()} />;
  }

  if (!clusterStatus) return null;

  const nodes = nodeStatus || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <PageHeader
          title="Cluster Information"
          description="Monitor your Elasticsearch cluster health"
          actions={
            <RefreshControls
              refreshInterval={refreshInterval}
              onRefreshIntervalChange={setRefreshInterval}
              onRefresh={() => fetchData()}
              isAutoRefreshing={isAutoRefreshing}
              refreshProgress={refreshProgress}
              loading={loading}
            />
          }
        />

        {/* Cluster Status Section */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900">Cluster Status</h2>
            </div>
            <p className="text-sm text-slate-600 mt-1 ml-7">Overall health and performance metrics of your Elasticsearch cluster</p>
          </div>
          {/* Cluster cards skeleton or data */}
          {loading ? ClusterCardsSkeleton : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* ...existing code... */}
              <Card className="border-slate-200/60 hover:shadow-lg hover:border-blue-200/40 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cluster Status</CardTitle>
                  <Activity className="h-4 w-4 text-slate-600" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${getHealthColor(clusterStatus.status)}`} />
                    <span className="text-2xl font-bold capitalize">{clusterStatus.status}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{clusterStatus.cluster_name}</p>
                </CardContent>
              </Card>
              {/* ...existing code... */}
              <Card className="border-slate-200/60 hover:shadow-lg hover:border-blue-200/40 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
                  <Server className="h-4 w-4 text-slate-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clusterStatus.number_of_nodes}</div>
                  <p className="text-xs text-slate-600 mt-1">
                    {clusterStatus.number_of_data_nodes} data nodes
                  </p>
                </CardContent>
              </Card>
              {/* ...existing code... */}
              <Card className="border-slate-200/60 hover:shadow-lg hover:border-blue-200/40 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Shards</CardTitle>
                  <HardDrive className="h-4 w-4 text-slate-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(clusterStatus.active_shards)}</div>
                  <p className="text-xs text-slate-600 mt-1">
                    {formatNumber(clusterStatus.active_primary_shards)} primary
                  </p>
                </CardContent>
              </Card>
              {/* ...existing code... */}
              <Card className="border-slate-200/60 hover:shadow-lg hover:border-blue-200/40 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shard Health</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-slate-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {clusterStatus.active_shards_percent_as_number.toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Active shards</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Cluster Details - compact labels */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="px-4 py-2.5 rounded-lg bg-slate-40/80 border border-slate-200/60 hover:bg-slate-100/80 transition-colors text-center">
              <span className="text-sm text-slate-600">Relocating: </span>
              <span className="text-sm font-semibold text-slate-900">{formatNumber(clusterStatus.relocating_shards)}</span>
            </div>
            <div className="px-4 py-2.5 rounded-lg bg-slate-40/80 border border-slate-200/60 hover:bg-slate-100/80 transition-colors text-center">
              <span className="text-sm text-slate-600">Initializing: </span>
              <span className="text-sm font-semibold text-slate-900">{formatNumber(clusterStatus.initializing_shards)}</span>
            </div>
            <div className="px-4 py-2.5 rounded-lg bg-slate-40/80 border border-slate-200/60 hover:bg-slate-100/80 transition-colors text-center">
              <span className="text-sm text-slate-600">Unassigned: </span>
              <span className="text-sm font-semibold text-slate-900">{formatNumber(clusterStatus.unassigned_shards)}</span>
            </div>
            <div className="px-4 py-2.5 rounded-lg bg-slate-40/80 border border-slate-200/60 hover:bg-slate-100/80 transition-colors text-center">
              <span className="text-sm text-slate-600">Pending Tasks: </span>
              <span className="text-sm font-semibold text-slate-900">{formatNumber(clusterStatus.number_of_pending_tasks)}</span>
            </div>
            <div className="px-4 py-2.5 rounded-lg bg-slate-40/80 border border-slate-200/60 hover:bg-slate-100/80 transition-colors text-center">
              <span className="text-sm text-slate-600">In-Flight Fetches: </span>
              <span className="text-sm font-semibold text-slate-900">{formatNumber(clusterStatus.number_of_in_flight_fetch)}</span>
            </div>
            <div className="px-4 py-2.5 rounded-lg bg-slate-40/80 border border-slate-200/60 hover:bg-slate-100/80 transition-colors text-center">
              <span className="text-sm text-slate-600">Delayed Shards: </span>
              <span className="text-sm font-semibold text-slate-900">{formatNumber(clusterStatus.delayed_unassigned_shards)}</span>
            </div>
          </div>
        </div>

        {/* Node Status Section */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Hexagon className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900">Node Status</h2>
            </div>
            <p className="text-sm text-slate-600 mt-1 ml-7">Resource usage and performance metrics across all nodes</p>
          </div>
          {/* Node cards skeleton or data */}
          {loading ? NodeCardsSkeleton : (
            <Card className="border-slate-200/60">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* ...existing code... */}
                  {nodes.map((node) => {
                    // Show first 3 roles, rest in tooltip
                    const visibleRoles = node.roles.slice(0, 3);
                    const hiddenRoles = node.roles.slice(3);
                    const hasMoreRoles = hiddenRoles.length > 0;
                    
                    return (
                      <div key={node.id} className="border rounded-lg p-4">
                        <div className="flex flex-row gap-6">
                          <div className="flex flex-col justify-between w-[30%] min-w-[200px] pr-6">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 text-base">{node.name}</span>
                                {node.is_master_node && (
                                  <Badge variant="default" className="ml-1">Master</Badge>
                                )}
                              </div>
                              <div className="text-xs text-slate-500">ID: {node.id}</div>
                              <div className="text-xs text-slate-500">Host: {node.host}</div>
                              <div className="text-xs text-slate-500">Transport: {node.transport}</div>
                              <div className="mt-2 flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-slate-600">Roles:</span>
                                {visibleRoles.map((role, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="secondary" 
                                    className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200"
                                  >
                                    {role}
                                  </Badge>
                                ))}
                                {hasMoreRoles && (
                                  <div className="group relative">
                                    <Badge 
                                      variant="secondary" 
                                      className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                                    >
                                      +{hiddenRoles.length}
                                    </Badge>
                                    <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                      <div className="flex flex-wrap gap-1">
                                        {hiddenRoles.map((role, idx) => (
                                          <Badge 
                                            key={idx} 
                                            variant="secondary" 
                                            className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700"
                                          >
                                            {role}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-600">Documents</span>
                                <span className="font-medium">{node.stats.docs_count.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          {/* Divider */}
                          <div className="border-l border-slate-200 mx-2" />
                          <div className="flex-1 w-[70%] grid grid-cols-2 grid-rows-3 gap-4">
                            {/* 1Row: CPU, Storage */}
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600">CPU</span>
                                <span className="group relative">
                                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block text-slate-400 cursor-pointer"><circle cx="12" cy="12" r="10" strokeWidth="2"/><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg>
                                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-slate-200 rounded shadow-lg text-xs text-slate-700 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    CPU 사용률입니다.<br />Current cpu loads: {node.stats.os_cpu_percent}%<br />1m avg cpu loads: {node.stats.os_cpu_load_average_1m}<br />5m avg cpu loads: {node.stats.os_cpu_load_average_5m}<br />15m avg cpu loads: {node.stats.os_cpu_load_average_15m}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium w-12 text-right">{node.stats.os_cpu_percent}%</span>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full transition-all" style={{ width: `${node.stats.os_cpu_percent}%`, background: getBarColor(node.stats.os_cpu_percent) }} />
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600">Storage</span>
                                <span className="group relative">
                                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block text-slate-400 cursor-pointer"><circle cx="12" cy="12" r="10" strokeWidth="2"/><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg>
                                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-slate-200 rounded shadow-lg text-xs text-slate-700 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    파일 시스템(스토리지) 사용률입니다.<br />Used: {node.stats.fs_used}<br />Free: {node.stats.fs_free}<br />Total: {node.stats.fs_total}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium w-12 text-right">{node.stats.fs_used_percent}%</span>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full transition-all" style={{ width: `${node.stats.fs_used_percent}%`, background: getBarColor(node.stats.fs_used_percent) }} />
                                </div>
                              </div>
                            </div>
                            {/* 2Row: Memory, JVM Heap */}
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600">Memory</span>
                                <span className="group relative">
                                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block text-slate-400 cursor-pointer"><circle cx="12" cy="12" r="10" strokeWidth="2"/><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg>
                                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-slate-200 rounded shadow-lg text-xs text-slate-700 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    시스템 메모리 사용률입니다.<br />Total: {node.stats.os_mem_total}<br />Used: {node.stats.os_mem_used}<br />Free: {node.stats.os_mem_free}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium w-12 text-right">{node.stats.os_mem_used_percent}%</span>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full transition-all" style={{ width: `${node.stats.os_mem_used_percent}%`, background: getBarColor(node.stats.os_mem_used_percent) }} />
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600">JVM Heap</span>
                                <span className="group relative">
                                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block text-slate-400 cursor-pointer"><circle cx="12" cy="12" r="10" strokeWidth="2"/><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg>
                                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-slate-200 rounded shadow-lg text-xs text-slate-700 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    JVM 힙 메모리 사용률입니다.<br />Used: {node.stats.jvm_heap_used}<br />Max: {node.stats.jvm_heap_max}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium w-12 text-right">{node.stats.jvm_heap_used_percent}%</span>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full transition-all" style={{ width: `${node.stats.jvm_heap_used_percent}%`, background: getBarColor(node.stats.jvm_heap_used_percent) }} />
                                </div>
                              </div>
                            </div>
                            {/* 3Row: SearchActive, Indexing Pressure */}
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600">Search Active</span>
                                <span className="group relative">
                                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block text-slate-400 cursor-pointer"><circle cx="12" cy="12" r="10" strokeWidth="2"/><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg>
                                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-slate-200 rounded shadow-lg text-xs text-slate-700 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    현재 활성화된 검색 작업 수입니다.<br />Threads: {node.stats.search_threads}<br />Queue: {node.stats.search_queue}<br />Rejected: {node.stats.search_rejected}<br />Completed: {node.stats.search_completed}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium w-12 text-right">{node.stats.search_active}</span>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full transition-all" style={{ width: `${Math.min(node.stats.search_active, 100)}%`, background: getBarColor(Math.min(node.stats.search_active, 100)) }} />
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600">Indexing Pressure</span>
                                <span className="group relative">
                                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block text-slate-400 cursor-pointer"><circle cx="12" cy="12" r="10" strokeWidth="2"/><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg>
                                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-slate-200 rounded shadow-lg text-xs text-slate-700 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    인덱싱 압력(메모리 사용률)입니다.<br />Current: {node.stats.indexing_current_all}<br />Total: {node.stats.indexing_total_all}<br />Limit: {node.stats.indexing_limit}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium w-12 text-right">{node.stats.indexing_pressure_percent}%</span>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full transition-all" style={{ width: `${node.stats.indexing_pressure_percent}%`, background: getBarColor(node.stats.indexing_pressure_percent) }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
