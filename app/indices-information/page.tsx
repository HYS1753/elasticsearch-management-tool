'use client';

import { useEffect, useState, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/dropdown-menu';
import { Skeleton } from '@/components/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Switch } from '@/components/switch';
import { Label } from '@/components/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/dialog';
import { Grid3x3, RefreshCw, Server, Box, X } from 'lucide-react';
import type { IndicesPlacementResponse, Node, IndexPlacement } from '@/types/indices-placement';

export default function IndicesInformationPage() {
  const [data, setData] = useState<IndicesPlacementResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<'manual' | '5' | '15' | '30' | '60'>('manual');
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [includeHiddenIndex, setIncludeHiddenIndex] = useState(false);
  const [includeClosedIndex, setIncludeClosedIndex] = useState(false);
  const [selectedShard, setSelectedShard] = useState<any>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        include_hidden_index: includeHiddenIndex.toString(),
        include_closed_index: includeClosedIndex.toString(),
      });

      const response = await fetch(`/api/indices/indices-placement?${params}`);
      const result: IndicesPlacementResponse = await response.json();

      if (response.ok && result.code === '200') {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch indices placement');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [includeHiddenIndex, includeClosedIndex]);

  // Interval refresh effect
  useEffect(() => {
    if (refreshInterval === 'manual') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (refreshProgressIntervalRef.current) {
        clearInterval(refreshProgressIntervalRef.current);
        refreshProgressIntervalRef.current = null;
      }
      setIsAutoRefreshing(false);
      setRefreshProgress(0);
      return;
    }
    
    setIsAutoRefreshing(true);
    setRefreshProgress(0);
    
    const intervalMs = Number(refreshInterval) * 1000;
    const updateInterval = 50;
    const increment = (updateInterval / intervalMs) * 100;
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (refreshProgressIntervalRef.current) clearInterval(refreshProgressIntervalRef.current);
    
    refreshProgressIntervalRef.current = setInterval(() => {
      setRefreshProgress(prev => {
        const next = prev + increment;
        if (next >= 100) return 0;
        return next;
      });
    }, updateInterval);
    
    intervalRef.current = setInterval(() => {
      setRefreshProgress(0);
      fetchData(false); // no full loading, just update data
    }, intervalMs);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (refreshProgressIntervalRef.current) {
        clearInterval(refreshProgressIntervalRef.current);
        refreshProgressIntervalRef.current = null;
      }
      setIsAutoRefreshing(false);
      setRefreshProgress(0);
    };
  }, [refreshInterval]);

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
              <Button onClick={() => fetchData()} className="mt-4" variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="container mx-auto">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { nodes, indices, has_unassigned_shards } = data;
  const unassignedCount = indices.reduce((sum, idx) => sum + idx.unassigned.length, 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Indices Placement</h1>
            <p className="text-slate-600 text-sm mt-1">View shard allocation across cluster nodes</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Interval Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-slate-200 min-w-[110px]">
                  {refreshInterval === 'manual' ? 'Manual' : `${refreshInterval}s`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup value={refreshInterval} onValueChange={v => setRefreshInterval(v as any)}>
                  <DropdownMenuRadioItem value="manual">Manual</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="5">5 Sec</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="15">15 Sec</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="30">30 Sec</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="60">60 Sec</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh Button */}
            <Button 
              onClick={() => fetchData()} 
              variant="outline" 
              className="gap-2 border-slate-200 relative overflow-hidden" 
              disabled={isAutoRefreshing}
            >
              {isAutoRefreshing && (
                <div 
                  className="absolute inset-0 bg-slate-300 transition-all duration-75 ease-linear"
                  style={{ width: `${refreshProgress}%`, left: 0 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {isAutoRefreshing || loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </span>
            </Button>
          </div>
        </div>

        {/* Indices Placement Grid */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Grid3x3 className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900">Shard Allocation Grid</h2>
            </div>
            <p className="text-sm text-slate-600 mt-1 ml-7">
              Shard distribution across nodes
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

            {/* Legend */}
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
          </div>

          <Card className="border-slate-200/60 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex">
                {/* Fixed Left Column - Node Header */}
                <div className="w-64 flex-shrink-0 border-r-2 border-slate-300">
                  <div className="px-4 py-2 font-semibold text-slate-700 border-b-2 border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100/50 flex items-center gap-2 min-h-[80px]">
                    <Server className="h-4 w-4 text-slate-600" />
                    Nodes
                  </div>
                </div>
                
                {/* Scrollable Right Section - Index Headers */}
                <div className="flex-1 overflow-x-auto">
                  <div className="flex border-b-2 border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100/50">
                    {/* Index columns headers */}
                    {indices.map((index) => {
                      const totalShards = Object.values(index.shards_by_node).flat().length;
                      return (
                        <div 
                          key={index.index}
                          className="w-[220px] px-4 py-2 text-left border-r border-slate-200/60 flex-shrink-0"
                        >
                          <div className="font-semibold text-slate-800 text-sm truncate" title={index.index}>
                            {index.index}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            <Badge 
                              variant={index.status === 'open' ? 'default' : 'secondary'}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {index.status}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            shards: {totalShards}
                            {index.unassigned.length > 0 && (
                              <span className="text-red-600 font-medium"> | {index.unassigned.length} unassigned</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Content Rows */}
              <div className="flex">
                {/* Fixed Left Column - Node Content */}
                <div className="w-64 flex-shrink-0 border-r-2 border-slate-300">
                  {/* Unassigned Shards Row (if any) */}
                  {has_unassigned_shards && (
                    <div className="px-4 py-4 border-b border-slate-200/60 bg-amber-50/40 hover:bg-amber-50/60 transition-colors">
                      <div className="flex items-start gap-2">
                        <Box className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-amber-900 text-sm">Unassigned Shards</div>
                          <div className="text-[11px] text-amber-700 mt-1">
                            Total: {unassignedCount} shard{unassignedCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Node Info Cells */}
                  {nodes.map((node) => (
                    <div 
                      key={node.id}
                      className="px-4 py-4 border-b border-slate-200/60 bg-white hover:bg-slate-50/50 cursor-pointer group transition-colors"
                      title={`Node: ${node.name}\nHost: ${node.host}\nID: ${node.id}\nRoles: ${node.roles.join(', ')}\nMaster: ${node.is_master ? 'Yes' : 'No'}`}
                    >
                      <div className="flex items-start gap-2">
                        <Server className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 text-sm truncate">
                              {node.name}
                            </span>
                            {node.is_master && (
                              <Badge variant="default" className="text-[10px] px-1.5 py-0">Master</Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 truncate">
                            {node.host}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scrollable Right Section - Index Content */}
                <div className="flex-1 overflow-x-auto">
                  {/* Unassigned Shards Row (if any) */}
                  {has_unassigned_shards && (
                    <div className="flex border-b border-slate-200/60 bg-amber-50/40 hover:bg-amber-50/60 transition-colors">
                      {indices.map((index) => (
                          <div 
                            key={`unassigned-${index.index}`}
                            className="w-[220px] px-4 py-4 flex items-start justify-start border-r border-slate-200/60 flex-shrink-0"
                          >
                            {index.unassigned.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-w-full">
                              {index.unassigned.map((shard, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setSelectedShard({ ...shard, index: index.index, node: 'Unassigned' })}
                                  className="w-8 h-8 rounded border-2 border-amber-500 border-dashed bg-amber-100/80 flex flex-col items-center justify-center text-xs font-semibold text-amber-900 hover:bg-amber-100 hover:shadow-sm transition-all cursor-pointer"
                                  title={`Shard ${shard.shard} (${shard.prirep === 'p' ? 'Primary' : 'Replica'}) - ${shard.state}`}
                                >
                                  <span className="text-[11px]">{shard.shard}</span>
                                  <span className="text-[9px] opacity-75">{shard.prirep}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-slate-400 text-[11px]">-</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Node Rows */}
                  {nodes.map((node) => (
                    <div key={node.id} className="flex border-b border-slate-200/60 hover:bg-slate-50/50 transition-colors">
                      {/* Shard Boxes for each Index */}
                      {indices.map((index) => {
                        // Get all shards for this node
                        const nodeShards = index.shards_by_node[node.name] || [];
                        
                        return (
                          <div 
                            key={`${node.id}-${index.index}`}
                            className="w-[220px] px-4 py-4 flex items-start justify-start border-r border-slate-200/60 flex-shrink-0"
                          >
                            {nodeShards.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 max-w-full">
                                {nodeShards.map((shard, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => setSelectedShard({ ...shard, index: index.index, node: node.name })}
                                    className={`w-8 h-8 rounded flex flex-col items-center justify-center text-xs font-semibold transition-all hover:scale-110 hover:shadow-sm cursor-pointer ${
                                      shard.prirep === 'p'
                                        ? 'border-2 border-solid border-green-600 bg-green-100/80 text-green-900 hover:bg-green-100'
                                        : 'border-2 border-dashed border-blue-600 bg-blue-100/80 text-blue-900 hover:bg-blue-100'
                                    }`}
                                    title={`Shard ${shard.shard} (${shard.prirep === 'p' ? 'Primary' : 'Replica'})\nState: ${shard.state}\nStore: ${shard.store}\nDocs: ${shard.docs}`}
                                  >
                                    <span className="text-[11px]">{shard.shard}</span>
                                    <span className="text-[9px] opacity-75">{shard.prirep}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-slate-400 text-[11px]">-</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shard Information Dialog */}
        <Dialog open={!!selectedShard} onOpenChange={() => setSelectedShard(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Box className="h-5 w-5 text-blue-600" />
                Shard Information
              </DialogTitle>
              <DialogDescription>
                Detailed information about the selected shard
              </DialogDescription>
            </DialogHeader>
            
            {selectedShard && (
              <div className="space-y-4">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-slate-600">Index</div>
                      <div className="text-sm font-semibold text-slate-900">{selectedShard.index}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600">Shard Number</div>
                      <div className="text-sm font-semibold text-slate-900">{selectedShard.shard}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600">Type</div>
                      <div>
                        <Badge variant={selectedShard.prirep === 'p' ? 'default' : 'secondary'}>
                          {selectedShard.prirep === 'p' ? 'Primary' : 'Replica'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600">State</div>
                      <div>
                        <Badge variant={selectedShard.state === 'STARTED' ? 'default' : 'secondary'}>
                          {selectedShard.state}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600">Node</div>
                      <div className="text-sm font-semibold text-slate-900">{selectedShard.node}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600">Documents</div>
                      <div className="text-sm font-semibold text-slate-900">{selectedShard.docs || 'N/A'}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Storage Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Storage Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-slate-600">Store Size</div>
                      <div className="text-sm font-semibold text-slate-900">{selectedShard.store || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600">IP Address</div>
                      <div className="text-sm font-semibold text-slate-900">{selectedShard.ip || 'N/A'}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Details */}
                {(selectedShard.unassigned_reason || selectedShard.unassigned_details) && (
                  <Card className="border-amber-200 bg-amber-50/50">
                    <CardHeader>
                      <CardTitle className="text-base text-amber-900">Unassigned Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedShard.unassigned_reason && (
                        <div>
                          <div className="text-sm font-medium text-amber-700">Reason</div>
                          <div className="text-sm text-amber-900">{selectedShard.unassigned_reason}</div>
                        </div>
                      )}
                      {selectedShard.unassigned_details && (
                        <div>
                          <div className="text-sm font-medium text-amber-700">Details</div>
                          <div className="text-sm text-amber-900">{selectedShard.unassigned_details}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end">
                  <Button onClick={() => setSelectedShard(null)} variant="outline">
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
