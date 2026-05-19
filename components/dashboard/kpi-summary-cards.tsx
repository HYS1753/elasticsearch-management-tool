'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ClusterHealthSummary } from '@/types/metrics';
import { formatBytes, formatNumber } from '@/lib/utils';
import {
  Activity,
  Server,
  HardDrive,
  Database,
  Search,
  ArrowUpDown,
  Layers,
  AlertTriangle,
} from 'lucide-react';

import { useAnimatedCounter } from '@/hooks/use-animated-counter';

// ── Single KPI Card ──

interface KpiCardProps {
  title: string;
  value: number;
  format?: 'number' | 'bytes';
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

function KpiCard({ title, value, format = 'number', icon: Icon, color, subtitle }: KpiCardProps) {
  const animated = useAnimatedCounter(value);

  const formatted = format === 'bytes'
    ? formatBytes(animated)
    : formatNumber(animated);

  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 hover:shadow-md transition-shadow duration-300 overflow-hidden group">
      <CardContent className="p-4 flex items-center gap-3.5">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${color} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <p className="text-lg font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
            {formatted}
          </p>
          {subtitle && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── KPI Summary Cards Grid ──

interface KpiSummaryCardsProps {
  data: ClusterHealthSummary | null;
  loading: boolean;
}

export function KpiSummaryCards({ data, loading }: KpiSummaryCardsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[80px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <KpiCard
        title="Nodes"
        value={data.number_of_nodes}
        icon={Server}
        color="bg-indigo-500"
        subtitle={`${data.number_of_data_nodes} Data`}
      />
      <KpiCard
        title="Active Shards"
        value={data.active_shards}
        icon={Layers}
        color="bg-emerald-500"
      />
      <KpiCard
        title="Unassigned"
        value={data.unassigned_shards}
        icon={AlertTriangle}
        color={data.unassigned_shards > 0 ? 'bg-rose-500' : 'bg-slate-400'}
      />
      <KpiCard
        title="Total Docs"
        value={data.total_docs}
        icon={Database}
        color="bg-sky-500"
      />
      <KpiCard
        title="Store Size"
        value={data.total_store_size_bytes}
        format="bytes"
        icon={HardDrive}
        color="bg-amber-500"
      />
      <KpiCard
        title="Pending Tasks"
        value={data.pending_tasks}
        icon={Activity}
        color={data.pending_tasks > 0 ? 'bg-purple-500' : 'bg-slate-400'}
      />
    </div>
  );
}
