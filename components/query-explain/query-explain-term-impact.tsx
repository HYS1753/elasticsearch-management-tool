'use client';

import type { QueryExplainTermFactor } from '@/types';

interface Props {
  items: QueryExplainTermFactor[];
}

export function QueryExplainTermImpact({ items }: Props) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500">
        매칭된 term factor 정보가 없습니다.
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => (b.score || 0) - (a.score || 0));
  const maxScore = sorted[0]?.score || 1;

  return (
    <div className="space-y-3">
      {sorted.map((item, idx) => {
        const ratio = Math.max(6, ((item.score || 0) / maxScore) * 100);

        return (
          <div key={`${item.field}-${item.term}-${idx}`} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    {item.field || 'unknown field'}
                  </span>
                  <span className="font-medium text-slate-900">
                    {item.term || 'unknown term'}
                  </span>
                </div>

                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${ratio}%` }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded bg-slate-50 px-2 py-1">
                    score: {item.score?.toFixed(4) ?? '-'}
                  </span>
                  <span className="rounded bg-slate-50 px-2 py-1">
                    boost: {item.boost?.toFixed(4) ?? '-'}
                  </span>
                  <span className="rounded bg-slate-50 px-2 py-1">
                    idf: {item.idf?.toFixed(4) ?? '-'}
                  </span>
                  <span className="rounded bg-slate-50 px-2 py-1">
                    tf: {item.tf?.toFixed(4) ?? '-'}
                  </span>
                  <span className="rounded bg-slate-50 px-2 py-1">
                    freq: {item.freq?.toFixed(4) ?? '-'}
                  </span>
                </div>
              </div>

              <div className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 font-mono text-sm font-semibold text-blue-700">
                {item.score?.toFixed(4) ?? '-'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}