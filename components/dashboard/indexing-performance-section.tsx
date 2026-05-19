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
import type { IndexingPerformanceResponse, MetricSeries } from '@/types/metrics';
import { ArrowUpDown, Clock, Trash2 } from 'lucide-react';

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
  return series.labels.name || series.labels.node || series.labels.instance || 'unknown';
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
            <linearGradient key={name} id={`idx-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
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
          <Area key={name} type="monotone" dataKey={name} stroke={NODE_COLORS[idx % NODE_COLORS.length].stroke} fill={`url(#idx-grad-${idx})`} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface IndexingPerformanceSectionProps {
  data: IndexingPerformanceResponse | null;
  loading: boolean;
}

export function IndexingPerformanceSection({ data, loading }: IndexingPerformanceSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Indexing Performance</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">Index rate, latency, and delete operations</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MetricChartCard
          title="Indexing Rate"
          subtitle="Documents indexed per second (5m rate)"
          icon={<ArrowUpDown className="h-4 w-4" />}
          loading={loading}
        >
          {data && renderAreaChart(data.index_rate, (v) => `${v.toFixed(1)}/s`)}
        </MetricChartCard>
        <MetricChartCard
          title="Indexing Latency"
          subtitle="Average indexing time (5m rate)"
          icon={<Clock className="h-4 w-4" />}
          loading={loading}
        >
          {data && renderAreaChart(data.index_latency, (v) => `${(v * 1000).toFixed(0)}ms`)}
        </MetricChartCard>
        <MetricChartCard
          title="Delete Rate"
          subtitle="Documents deleted per second (5m rate)"
          icon={<Trash2 className="h-4 w-4" />}
          loading={loading}
        >
          {data && renderAreaChart(data.delete_rate, (v) => `${v.toFixed(1)}/s`)}
        </MetricChartCard>
      </div>
    </div>
  );
}
