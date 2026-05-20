'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ClusterHealthSummary, SearchPerformanceResponse } from '@/types/metrics';
import { formatBytes, formatNumber } from '@/lib/utils';
import {
  Activity,
  Server,
  HardDrive,
  Database,
  Search,
  Layers,
  AlertTriangle,
  Clock,
} from 'lucide-react';

import { useAnimatedCounter } from '@/hooks/use-animated-counter';

// ── Single KPI Card ──

interface KpiCardProps {
  title: string;
  value: number;
  format?: 'number' | 'bytes' | 'ms';
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  subtitleKo?: string;
}

function KpiCard({ title, value, format = 'number', icon: Icon, color, subtitle, subtitleKo }: KpiCardProps) {
  const animated = useAnimatedCounter(value);

  const formatted = format === 'bytes'
    ? formatBytes(animated)
    : format === 'ms'
      ? `${animated.toFixed(1)}ms`
      : formatNumber(animated);

  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 hover:shadow-md transition-shadow duration-300 overflow-hidden group h-full">
      <CardContent className="p-4 flex items-center gap-3.5 h-full">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${color} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <p className="text-lg font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
            {formatted}
          </p>
          {subtitle && (
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{subtitle}</p>
          )}
          {subtitleKo && (
            <p className="text-[8px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{subtitleKo}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Cluster Status Card (Left Column) ──

interface ClusterStatusCardProps {
  data: ClusterHealthSummary;
}

function ClusterStatusCard({ data }: ClusterStatusCardProps) {
  const status = data.status || 'unknown';
  const isGreen = status === 'green';
  const isYellow = status === 'yellow';
  const isRed = status === 'red';

  const statusBgColor = isGreen
    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
    : isYellow
      ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
      : isRed
        ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'
        : 'text-slate-500 bg-slate-50 border-slate-200';

  const statusTextColor = isGreen
    ? 'text-emerald-500 dark:text-emerald-400'
    : isYellow
      ? 'text-amber-500 dark:text-amber-400'
      : isRed
        ? 'text-rose-500 dark:text-rose-400'
        : 'text-slate-500';

  const pulseColor = isGreen
    ? 'bg-emerald-500'
    : isYellow
      ? 'bg-amber-500'
      : isRed
        ? 'bg-rose-500'
        : 'bg-slate-400';

  const totalShards = data.active_shards + data.unassigned_shards + data.relocating_shards + data.initializing_shards;
  const activePercent = totalShards > 0 ? (data.active_shards / totalShards) * 100 : 0;
  const unassignedPercent = totalShards > 0 ? (data.unassigned_shards / totalShards) * 100 : 0;
  const relocatingPercent = totalShards > 0 ? (data.relocating_shards / totalShards) * 100 : 0;
  const initializingPercent = totalShards > 0 ? (data.initializing_shards / totalShards) * 100 : 0;

  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 flex flex-col h-full justify-between">
      <CardContent className="p-4 flex flex-col justify-between h-full space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cluster Status</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${pulseColor} animate-ping absolute opacity-75`} />
              <span className={`w-2 h-2 rounded-full ${pulseColor} relative`} />
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{status}</span>
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${statusBgColor}`}>
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h3 className={`text-xl font-extrabold uppercase tracking-tight leading-none ${statusTextColor}`}>
                {status}
              </h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">클러스터 전체 상태 모니터링</p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span>Shards Distribution</span>
            <span>{totalShards} Total</span>
          </div>

          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden">
            {data.active_shards > 0 && (
              <div className="bg-emerald-500" style={{ width: `${activePercent}%` }} />
            )}
            {data.initializing_shards > 0 && (
              <div className="bg-sky-400" style={{ width: `${initializingPercent}%` }} />
            )}
            {data.relocating_shards > 0 && (
              <div className="bg-indigo-500" style={{ width: `${relocatingPercent}%` }} />
            )}
            {data.unassigned_shards > 0 && (
              <div className="bg-rose-500" style={{ width: `${unassignedPercent}%` }} />
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 pt-0.5 text-[9px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active (활성)
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{data.active_shards}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Unassigned (미할당)
              </span>
              <span className={`font-bold ${data.unassigned_shards > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>{data.unassigned_shards}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Relocating (재배치)
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{data.relocating_shards}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                Initializing (초기화)
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{data.initializing_shards}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── KPI Summary Cards Grid ──

interface KpiSummaryCardsProps {
  data: ClusterHealthSummary | null;
  searchPerformance: SearchPerformanceResponse | null;
  loading: boolean;
}

export function KpiSummaryCards({ data, searchPerformance, loading }: KpiSummaryCardsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Skeleton className="h-[180px] w-full rounded-xl" />
        </div>
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-[80px] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Average Search Latency 계산 ──
  const getAverageSearchLatency = () => {
    if (!searchPerformance || !searchPerformance.query_latency || searchPerformance.query_latency.length === 0) return 0;
    
    let totalLatency = 0;
    let count = 0;
    
    searchPerformance.query_latency.forEach(series => {
      if (series.values && series.values.length > 0) {
        const lastPoint = series.values[series.values.length - 1];
        totalLatency += lastPoint.value;
        count++;
      }
    });
    
    return count > 0 ? (totalLatency / count) * 1000 : 0;
  };

  const avgSearchLatency = getAverageSearchLatency();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      {/* ── Left side: Cluster Health Card ── */}
      <div className="lg:col-span-1 flex flex-col h-full">
        <ClusterStatusCard data={data} />
      </div>

      {/* ── Right side: 7 KPI Cards Grid ── */}
      <div className="lg:col-span-2 flex flex-col justify-between h-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 h-full items-stretch">
          <div className="h-full">
            <KpiCard
              title="Nodes"
              value={data.number_of_nodes}
              icon={Server}
              color="bg-indigo-500"
              subtitle={`${data.number_of_data_nodes} Data`}
              subtitleKo="데이터 노드 수"
            />
          </div>
          <div className="h-full">
            <KpiCard
              title="Active Shards"
              value={data.active_shards}
              icon={Layers}
              color="bg-emerald-500"
              subtitleKo="활성 샤드 수"
            />
          </div>
          <div className="h-full">
            <KpiCard
              title="Unassigned"
              value={data.unassigned_shards}
              icon={AlertTriangle}
              color={data.unassigned_shards > 0 ? 'bg-rose-500' : 'bg-slate-400'}
              subtitleKo="미할당 샤드 수"
            />
          </div>
          <div className="h-full">
            <KpiCard
              title="Search Latency"
              value={avgSearchLatency}
              format="ms"
              icon={Clock}
              color="bg-rose-500"
              subtitleKo="평균 검색 지연"
            />
          </div>
          <div className="h-full">
            <KpiCard
              title="Total Docs"
              value={data.total_docs}
              icon={Database}
              color="bg-sky-500"
              subtitleKo="전체 문서 수"
            />
          </div>
          <div className="h-full">
            <KpiCard
              title="Store Size"
              value={data.total_store_size_bytes}
              format="bytes"
              icon={HardDrive}
              color="bg-amber-500"
              subtitleKo="스토리지 크기"
            />
          </div>
          <div className="h-full">
            <KpiCard
              title="Pending Tasks"
              value={data.pending_tasks}
              icon={Activity}
              color={data.pending_tasks > 0 ? 'bg-purple-500' : 'bg-slate-400'}
              subtitleKo="대기 중인 태스크"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
