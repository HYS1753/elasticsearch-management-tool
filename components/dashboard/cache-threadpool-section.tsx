'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { MetricChartCard } from './metric-chart-card';
import type { CacheThreadPoolResponse, MetricSeries } from '@/types/metrics';
import { Database, Layers, AlertCircle } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

const NODE_COLORS = [
  { stroke: '#6366f1', fill: '#6366f1' },
  { stroke: '#10b981', fill: '#10b981' },
  { stroke: '#f59e0b', fill: '#f59e0b' },
  { stroke: '#ef4444', fill: '#ef4444' },
  { stroke: '#8b5cf6', fill: '#8b5cf6' },
  { stroke: '#06b6d4', fill: '#06b6d4' },
  { stroke: '#ec4899', fill: '#ec4899' },
  { stroke: '#14b8a6', fill: '#14b8a6' },
];

function getNodeLabel(series: MetricSeries): string {
  const labels = series.labels;
  const base = labels.name || labels.node || labels.instance || 'unknown';
  const type = labels.type;
  return type ? `${base}/${type}` : base;
}

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function transformSeriesToChartData(seriesList: MetricSeries[]) {
  if (!seriesList.length) return { data: [] as Record<string, unknown>[], nodeNames: [] as string[] };
  const nodeNames = seriesList.map(getNodeLabel);
  const timeMap = new Map<number, Record<string, unknown>>();
  seriesList.forEach((series, idx) => {
    const name = nodeNames[idx];
    series.values.forEach((point) => {
      if (!timeMap.has(point.timestamp)) {
        timeMap.set(point.timestamp, { time: point.timestamp, timeLabel: formatTimestamp(point.timestamp) });
      }
      timeMap.get(point.timestamp)![name] = point.value;
    });
  });
  const data = Array.from(timeMap.values()).sort((a, b) => (a.time as number) - (b.time as number));
  return { data, nodeNames: [...new Set(nodeNames)] };
}

function ChartTooltip({ active, payload, label, valueFormatter }: {
  active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string; valueFormatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const fmt = valueFormatter || ((v: number) => v.toFixed(2));
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3 text-xs max-w-[280px]">
      <p className="font-bold text-slate-600 dark:text-slate-300 mb-1.5 border-b border-slate-100 dark:border-slate-800 pb-1">{label}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-500 dark:text-slate-400 truncate max-w-[140px]">{item.name}</span>
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-100">{fmt(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

function renderAreaChart(seriesList: MetricSeries[], valueFormatter?: (v: number) => string) {
  const { data, nodeNames } = transformSeriesToChartData(seriesList);
  if (!data.length) return <div className="h-full flex items-center justify-center text-xs text-slate-400">No data available</div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          {nodeNames.map((name, idx) => (
            <linearGradient key={name} id={`ct-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={NODE_COLORS[idx % NODE_COLORS.length].fill} stopOpacity={0.3} />
              <stop offset="95%" stopColor={NODE_COLORS[idx % NODE_COLORS.length].fill} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
        <XAxis dataKey="timeLabel" tick={{ fontSize: 10 }} stroke="currentColor" className="text-slate-400 dark:text-slate-600" tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-slate-400 dark:text-slate-600" tickLine={false} axisLine={false} tickFormatter={valueFormatter} width={55} />
        <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
        <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} iconType="circle" iconSize={6} />
        {nodeNames.map((name, idx) => (
          <Area key={name} type="monotone" dataKey={name} stroke={NODE_COLORS[idx % NODE_COLORS.length].stroke} fill={`url(#ct-grad-${idx})`} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface CacheThreadPoolSectionProps {
  data: CacheThreadPoolResponse | null;
  loading: boolean;
}

export function CacheThreadPoolSection({ data, loading }: CacheThreadPoolSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-violet-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Cache & Thread Pool</h2>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded border border-violet-100 dark:border-violet-500/20">캐시 및 스레드풀 지표</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 ml-7">Query cache efficiency and thread pool pressure</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetricChartCard
          title="Query Cache Size"
          subtitle="Memory used by query cache per node"
          subtitleKo="쿼리 캐시 사용 메모리 크기"
          icon={<Database className="h-4 w-4" />}
          loading={loading}
        >
          {data && renderAreaChart(data.query_cache_size, (v) => formatBytes(v))}
        </MetricChartCard>
        <MetricChartCard
          title="Cache Eviction Rate"
          subtitle="Query cache evictions per second (5m rate)"
          subtitleKo="초당 쿼리 캐시 제거(Evictions) 빈도 (5분 평균)"
          icon={<AlertCircle className="h-4 w-4" />}
          loading={loading}
        >
          {data && renderAreaChart(data.query_cache_evictions, (v) => `${v.toFixed(2)}/s`)}
        </MetricChartCard>
        <MetricChartCard
          title="Thread Pool Active"
          subtitle="Active threads (search, write, index)"
          subtitleKo="현재 활성화된 스레드 수 (검색, 쓰기, 색인)"
          icon={<Layers className="h-4 w-4" />}
          loading={loading}
        >
          {data && renderAreaChart(data.thread_pool_active, (v) => v.toFixed(0))}
        </MetricChartCard>
        <MetricChartCard
          title="Thread Pool Rejected"
          subtitle="Rejected operations per second (5m rate)"
          subtitleKo="초당 거부된 스레드 작업 수 (5분 평균)"
          icon={<AlertCircle className="h-4 w-4" />}
          loading={loading}
        >
          {data && renderAreaChart(data.thread_pool_rejected, (v) => `${v.toFixed(2)}/s`)}
        </MetricChartCard>
      </div>
    </div>
  );
}
