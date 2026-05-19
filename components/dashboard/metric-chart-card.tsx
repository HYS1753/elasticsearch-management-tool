'use client';

import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricChartCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

export function MetricChartCard({
  title,
  subtitle,
  icon,
  loading = false,
  children,
  className = '',
}: MetricChartCardProps) {
  return (
    <Card className={`border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-950 ${className}`}>
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="text-indigo-500 flex-shrink-0">{icon}</span>}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{title}</h3>
            {subtitle && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      <CardContent className="px-3 pb-4 pt-0">
        {loading ? (
          <Skeleton className="h-[200px] w-full rounded-lg" />
        ) : (
          <div className="h-[200px] w-full">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
