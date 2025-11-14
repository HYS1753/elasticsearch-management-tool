'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Badge } from '@/components/badge';
import { Activity, Server, HardDrive, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/button';
import { formatBytes, formatNumber, getHealthColor } from '@/lib/utils';
import type { ClusterHealth, NodeStats } from '@/types';

export default function ClusterPage() {
  const [health, setHealth] = useState<ClusterHealth | null>(null);
  const [nodeStats, setNodeStats] = useState<Record<string, NodeStats> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, nodesRes] = await Promise.all([
        fetch('/api/cluster/health'),
        fetch('/api/cluster/nodes'),
      ]);

      const healthData = await healthRes.json();
      const nodesData = await nodesRes.json();

      if (healthData.success) {
        setHealth(healthData.data);
      } else {
        throw new Error(healthData.error?.message || 'Failed to fetch cluster health');
      }

      if (nodesData.success) {
        setNodeStats(nodesData.data);
      } else {
        throw new Error(nodesData.error?.message || 'Failed to fetch node stats');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="container mx-auto">
          <Card className="border-red-200 bg-red-50">
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

  if (!health) return null;

  const nodes = nodeStats ? Object.entries(nodeStats) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Cluster Information</h1>
              <p className="text-slate-600 text-sm">Monitor your Elasticsearch cluster health</p>
            </div>
            <Button onClick={fetchData} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cluster Status</CardTitle>
              <Activity className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${getHealthColor(health.status)}`} />
                <span className="text-2xl font-bold capitalize">{health.status}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{health.cluster_name}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
              <Server className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{health.number_of_nodes}</div>
              <p className="text-xs text-slate-600 mt-1">
                {health.number_of_data_nodes} data nodes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Shards</CardTitle>
              <HardDrive className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(health.active_shards)}</div>
              <p className="text-xs text-slate-600 mt-1">
                {formatNumber(health.active_primary_shards)} primary
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shard Health</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {health.active_shards_percent_as_number.toFixed(1)}%
              </div>
              <p className="text-xs text-slate-600 mt-1">Active shards</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cluster Details</CardTitle>
            <CardDescription>Overview of your Elasticsearch cluster</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <div className="text-sm text-slate-600 mb-1">Relocating Shards</div>
                <div className="text-lg font-semibold">{formatNumber(health.relocating_shards)}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Initializing Shards</div>
                <div className="text-lg font-semibold">{formatNumber(health.initializing_shards)}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Unassigned Shards</div>
                <div className="text-lg font-semibold">{formatNumber(health.unassigned_shards)}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Pending Tasks</div>
                <div className="text-lg font-semibold">{formatNumber(health.number_of_pending_tasks)}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">In-Flight Fetches</div>
                <div className="text-lg font-semibold">{formatNumber(health.number_of_in_flight_fetch)}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Delayed Shards</div>
                <div className="text-lg font-semibold">{formatNumber(health.delayed_unassigned_shards)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {nodes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Node Status</CardTitle>
              <CardDescription>Resource usage across all nodes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nodes.map(([nodeId, node]) => (
                  <div key={nodeId} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-slate-900">{node.name}</div>
                        <div className="text-sm text-slate-600">{node.roles.join(', ')}</div>
                        <div className="text-xs text-slate-500 mt-1">{node.transport_address}</div>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">CPU</span>
                          <span className="font-medium">{node.os.cpu.percent}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all"
                            style={{ width: `${node.os.cpu.percent}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">Memory</span>
                          <span className="font-medium">{node.os.mem.used_percent}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 transition-all"
                            style={{ width: `${node.os.mem.used_percent}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">Disk</span>
                          <span className="font-medium">
                            {((1 - node.fs.total.available_in_bytes / node.fs.total.total_in_bytes) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-600 transition-all"
                            style={{
                              width: `${((1 - node.fs.total.available_in_bytes / node.fs.total.total_in_bytes) * 100).toFixed(1)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Documents: </span>
                        <span className="font-medium">{formatNumber(node.indices.docs.count)}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Store Size: </span>
                        <span className="font-medium">{formatBytes(node.indices.store.size_in_bytes)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
