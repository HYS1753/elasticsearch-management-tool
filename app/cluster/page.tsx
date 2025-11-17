'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Badge } from '@/components/badge';
import { Activity, Server, HardDrive, CheckCircle2, RefreshCw, ChevronDown, Boxes, Hexagon } from 'lucide-react';
import { Button } from '@/components/button';
import { formatBytes, formatNumber, getHealthColor } from '@/lib/utils';

function getBarColor(percent: number) {
  if (percent < 60) return '#2ECC71'; // Green
  if (percent < 75) return '#F1C40F'; // Yellow
  if (percent < 90) return '#E67E22'; // Orange
  return '#E74C3C'; // Red
}
import type { ClusterStatus, NodeStatus } from '@/types';

export default function ClusterPage() {
  const [clusterStatus, setClusterStatus] = useState<ClusterStatus | null>(null);
  const [nodeStatus, setNodeStatus] = useState<NodeStatus[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClusterDetailsOpen, setIsClusterDetailsOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="container mx-auto">
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-4 text-slate-600">Loading cluster information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="container mx-auto">
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-900">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
              <Button onClick={fetchData} className="mt-4" variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!clusterStatus) return null;

  const nodes = nodeStatus || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Cluster Information</h1>
            <p className="text-slate-600 text-sm mt-1">Monitor your Elasticsearch cluster health</p>
          </div>
          <Button onClick={fetchData} variant="outline" className="gap-2 border-slate-200">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Cluster Status Section */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900">Cluster Status</h2>
            </div>
            <p className="text-sm text-slate-600 mt-1 ml-7">Overall health and performance metrics of your Elasticsearch cluster</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

          <div className="border border-slate-200/60 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setIsClusterDetailsOpen(!isClusterDetailsOpen)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={`transform transition-transform duration-300 ${
                  isClusterDetailsOpen ? 'rotate-90' : ''
                }`}>
                  <ChevronDown className="h-5 w-5 text-slate-600" />
                </div>
                <span className="text-lg font-semibold text-slate-900">Cluster Details</span>
              </div>
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isClusterDetailsOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-6 pt-2">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-100">
                    <div className="text-sm text-slate-600 mb-1">Relocating Shards</div>
                    <div className="text-lg font-semibold">{formatNumber(clusterStatus.relocating_shards)}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-100">
                    <div className="text-sm text-slate-600 mb-1">Initializing Shards</div>
                    <div className="text-lg font-semibold">{formatNumber(clusterStatus.initializing_shards)}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-100">
                    <div className="text-sm text-slate-600 mb-1">Unassigned Shards</div>
                    <div className="text-lg font-semibold">{formatNumber(clusterStatus.unassigned_shards)}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-100">
                    <div className="text-sm text-slate-600 mb-1">Pending Tasks</div>
                    <div className="text-lg font-semibold">{formatNumber(clusterStatus.number_of_pending_tasks)}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-100">
                    <div className="text-sm text-slate-600 mb-1">In-Flight Fetches</div>
                    <div className="text-lg font-semibold">{formatNumber(clusterStatus.number_of_in_flight_fetch)}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-100">
                    <div className="text-sm text-slate-600 mb-1">Delayed Shards</div>
                    <div className="text-lg font-semibold">{formatNumber(clusterStatus.delayed_unassigned_shards)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Node Status Section */}
        {nodes.length > 0 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Hexagon className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-slate-900">Node Status</h2>
              </div>
              <p className="text-sm text-slate-600 mt-1 ml-7">Resource usage and performance metrics across all nodes</p>
            </div>
            <Card className="border-slate-200/60">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {nodes.map((node) => {
                    // Roles 2줄 넘으면 ... 처리
                    const rolesStr = node.roles.join(', ');
                    // 2줄 기준: 2 * 32 = 64글자(대략)
                    const maxRolesLength = 80;
                    let rolesDisplay = rolesStr;
                    let rolesTruncated = false;
                    if (rolesStr.length > maxRolesLength) {
                      // 2줄 기준으로 자르고 ...
                      let cutIdx = rolesStr.lastIndexOf(',', maxRolesLength);
                      if (cutIdx === -1) cutIdx = maxRolesLength;
                      rolesDisplay = rolesStr.slice(0, cutIdx) + ' ...';
                      rolesTruncated = true;
                    }
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
                              <div className="text-sm text-slate-600 mt-1">
                                Roles:
                                <span className="block group relative cursor-pointer whitespace-pre-line break-words max-h-[3.2em] overflow-hidden">
                                  {rolesDisplay}
                                  {rolesTruncated && (
                                    <span className="absolute left-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded shadow-lg text-xs text-slate-700 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                      {rolesStr}
                                    </span>
                                  )}
                                </span>
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
          </div>
        )}
      </div>
    </div>
  );
}
