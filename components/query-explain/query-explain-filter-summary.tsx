'use client';

import type { QueryExplainFilterMatch } from '@/types';

interface Props {
  items: QueryExplainFilterMatch[];
}

export function QueryExplainFilterSummary({ items }: Props) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500">
        필터 조건이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item, idx) => (
        <div key={`${item.label}-${idx}`} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium text-slate-900">{item.label}</div>
            <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              matched
            </span>
          </div>
          {item.description && (
            <div className="mt-2 text-sm text-slate-500">{item.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}