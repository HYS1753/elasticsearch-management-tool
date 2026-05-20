'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { StorageOverviewResponse } from '@/types/metrics';
import { HardDrive } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

function getBarColor(percent: number): string {
  if (percent < 60) return '#10b981';  // emerald
  if (percent < 75) return '#f59e0b';  // amber
  if (percent < 90) return '#f97316';  // orange
  return '#ef4444';                     // red
}

interface StorageOverviewSectionProps {
  data: StorageOverviewResponse | null;
  loading: boolean;
}

export function StorageOverviewSection({ data, loading }: StorageOverviewSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Storage Overview</h2>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-500/20">디스크 저장소 현황</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 ml-7">노드별 디스크 저장소 사용률 및 잔여 용량 (Disk utilization per node)</p>
      </div>
      <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950">
        <CardContent className="p-5">
          {loading || !data ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : data.nodes.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No storage data available</div>
          ) : (
            <div className="space-y-4">
              {data.nodes.map((node) => (
                <div key={node.node_name} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <HardDrive className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{node.node_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                      <span>{formatBytes(node.used_bytes)} / {formatBytes(node.total_bytes)}</span>
                      <span
                        className="font-bold min-w-[48px] text-right"
                        style={{ color: getBarColor(node.used_percent) }}
                      >
                        {node.used_percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${node.used_percent}%`,
                        backgroundColor: getBarColor(node.used_percent),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
