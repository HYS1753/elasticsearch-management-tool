'use client';

import { Card, CardContent } from '@/components/card';
import { Badge } from '@/components/badge';
import { Server, Box } from 'lucide-react';
import type { IndicesPlacementResponse } from '@/types/indices-placement';

interface GridViewProps {
  data: IndicesPlacementResponse['data'];
  setSelectedShard: (shard: any) => void;
}

export function GridView({ data, setSelectedShard }: GridViewProps) {
  const { nodes, indices, has_unassigned_shards } = data;
  const unassignedCount = indices.reduce((sum, idx) => sum + idx.unassigned.length, 0);

  return (
    <Card className="border-slate-200/60 shadow-sm">
      <CardContent className="pt-6">
        {/* Single scrollable container for all content */}
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header Row */}
            <div className="flex border-b-2 border-slate-300">
              <div className="w-[256px] px-4 py-2 font-semibold text-slate-700 border-r-2 border-slate-300 bg-slate-50 flex items-center gap-2 min-h-[80px] flex-shrink-0 sticky left-0 z-10">
                <Server className="h-4 w-4 text-slate-600" />
                Nodes
              </div>
              
              <div className="flex bg-gradient-to-r from-slate-50 to-slate-100/50">
                {indices.map((index) => {
                  const totalShards = Object.values(index.shards_by_node).flat().length;
                  return (
                    <div key={index.index} className="w-[220px] px-4 py-2 text-left border-r border-slate-200/60 flex-shrink-0">
                      <div className="font-semibold text-slate-800 text-sm truncate" title={index.index}>
                        {index.index}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        <Badge variant={index.status === 'open' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
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

            {/* Unassigned Shards Row */}
            {has_unassigned_shards && (
              <div className="flex border-b border-slate-200/60 bg-amber-50/40 hover:bg-amber-50/60 transition-colors">
                <div className="w-[256px] px-4 py-4 border-r-2 border-slate-300 flex-shrink-0 sticky left-0 z-10 bg-amber-50">
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
                
                <div className="flex">
                  {indices.map((index) => (
                    <div key={`unassigned-${index.index}`} className="w-[220px] px-4 py-4 flex items-start justify-start border-r border-slate-200/60 flex-shrink-0">
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
              </div>
            )}
            
            {/* Node Rows */}
            {nodes.map((node) => (
              <div key={node.id} className="flex border-b border-slate-200/60 hover:bg-slate-50/50 transition-colors">
                <div 
                  className="w-[256px] px-4 py-4 border-r-2 border-slate-300 bg-white cursor-pointer group flex-shrink-0 sticky left-0 z-10"
                  title={`Node: ${node.name}\nHost: ${node.host}\nID: ${node.id}\nRoles: ${node.roles.join(', ')}\nMaster: ${node.is_master ? 'Yes' : 'No'}`}
                >
                  <div className="flex items-start gap-2">
                    <Server className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-sm truncate">{node.name}</span>
                        {node.is_master && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">Master</Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 truncate">{node.host}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex">
                  {indices.map((index) => {
                    const nodeShards = index.shards_by_node[node.name] || [];
                    
                    return (
                      <div key={`${node.id}-${index.index}`} className="w-[220px] px-4 py-4 flex items-start justify-start border-r border-slate-200/60 flex-shrink-0">
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
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
