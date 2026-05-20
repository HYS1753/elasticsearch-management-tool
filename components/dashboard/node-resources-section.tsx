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
import type { NodeResourcesResponse, MetricSeries } from '@/types/metrics';
import { Cpu, MemoryStick, Container, Timer } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

// 노드별 차별화된 색상
const NODE_COLORS = [
  { stroke: '#6366f1', fill: '#6366f1' },  // indigo
  { stroke: '#10b981', fill: '#10b981' },  // emerald
  { stroke: '#f59e0b', fill: '#f59e0b' },  // amber
  { stroke: '#ef4444', fill: '#ef4444' },  // red
  { stroke: '#8b5cf6', fill: '#8b5cf6' },  // violet
  { stroke: '#06b6d4', fill: '#06b6d4' },  // cyan
  { stroke: '#ec4899', fill: '#ec4899' },  // pink
  { stroke: '#14b8a6', fill: '#14b8a6' },  // teal
];

function getNodeLabel(series: MetricSeries): string {
  return series.labels.name || series.labels.node || series.labels.instance || 'unknown';
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * 여러 노드의 시계열을 recharts가 요구하는 flat data 형식으로 변환.
 * [{ time, node1: val, node2: val, ... }, ...]
 */
function transformSeriesToChartData(seriesList: MetricSeries[]): { data: Record<string, unknown>[]; nodeNames: string[] } {
  if (!seriesList.length) return { data: [], nodeNames: [] };

  const nodeNames = seriesList.map(getNodeLabel);
  const timeMap = new Map<number, Record<string, unknown>>();

  seriesList.forEach((series, idx) => {
    const name = nodeNames[idx];
    series.values.forEach((point) => {
      const key = point.timestamp;
      if (!timeMap.has(key)) {
        timeMap.set(key, { time: key, timeLabel: formatTimestamp(key) });
      }
      const entry = timeMap.get(key)!;
      entry[name] = point.value;
    });
  });

  const data = Array.from(timeMap.values()).sort((a, b) => (a.time as number) - (b.time as number));
  return { data, nodeNames: [...new Set(nodeNames)] };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  valueFormatter?: (v: number) => string;
}

function ChartTooltip({ active, payload, label, valueFormatter }: CustomTooltipProps) {
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

function renderAreaChart(
  seriesList: MetricSeries[],
  valueFormatter?: (v: number) => string,
  yDomain?: [number | string, number | string],
) {
  const { data, nodeNames } = transformSeriesToChartData(seriesList);

  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          {nodeNames.map((name, idx) => {
            const color = NODE_COLORS[idx % NODE_COLORS.length];
            return (
              <linearGradient key={name} id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color.fill} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color.fill} stopOpacity={0.02} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
        <XAxis
          dataKey="timeLabel"
          tick={{ fontSize: 10 }}
          stroke="currentColor"
          className="text-slate-400 dark:text-slate-600"
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10 }}
          stroke="currentColor"
          className="text-slate-400 dark:text-slate-600"
          tickLine={false}
          axisLine={false}
          domain={yDomain}
          tickFormatter={valueFormatter}
          width={55}
        />
        <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
        <Legend
          wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
          iconType="circle"
          iconSize={6}
        />
        {nodeNames.map((name, idx) => {
          const color = NODE_COLORS[idx % NODE_COLORS.length];
          return (
            <Area
              key={name}
              type="monotone"
              dataKey={name}
              stroke={color.stroke}
              fill={`url(#grad-${idx})`}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface NodeResourcesSectionProps {
  data: NodeResourcesResponse | null;
  loading: boolean;
}

export function NodeResourcesSection({ data, loading }: NodeResourcesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Node Resources</h2>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-500/20">노드 리소스 지표</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 ml-7">CPU, Memory, JVM Heap, Garbage Collection</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetricChartCard
          title="CPU Usage"
          subtitle="OS-level CPU utilization per node"
          subtitleKo="노드별 운영체제(OS) 기준 CPU 사용률"
          icon={<Cpu className="h-4 w-4" />}
          loading={loading}
        >
          {data && renderAreaChart(data.cpu_percent, (v) => `${v.toFixed(0)}%`, [0, 100])}
        </MetricChartCard>
        <MetricChartCard
          title="JVM Heap Usage"
          subtitle="JVM heap memory used per node"
          subtitleKo="노드별 JVM 힙 메모리 사용량"
          icon={<Container className="h-4 w-4" />}
          loading={loading}
        >
          {data && renderAreaChart(data.jvm_heap_used_bytes, (v) => formatBytes(v))}
        </MetricChartCard>
        <MetricChartCard
          title="OS Memory Usage"
          subtitle="System memory used per node"
          subtitleKo="노드별 시스템 물리 메모리 사용량"
          icon={<MemoryStick className="h-4 w-4" />}
          loading={loading}
        >
          {data && renderAreaChart(data.memory_used_bytes, (v) => formatBytes(v))}
        </MetricChartCard>
        <MetricChartCard
          title="GC Collection Rate"
          subtitle="Garbage collection frequency (per second)"
          subtitleKo="초당 가비지 컬렉션(GC) 발생 빈도"
          icon={<Timer className="h-4 w-4" />}
          loading={loading}
        >
          {data && renderAreaChart(data.gc_collection_count, (v) => `${v.toFixed(2)}/s`)}
        </MetricChartCard>
      </div>
    </div>
  );
}
