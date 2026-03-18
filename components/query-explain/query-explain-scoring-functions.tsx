'use client';

import type { QueryExplainScoringFunction } from '@/types';

interface Props {
  items: QueryExplainScoringFunction[];
}

export function QueryExplainScoringFunctions({ items }: Props) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500">
        추가 점수 함수 정보가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={`${item.label}-${idx}`} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium text-slate-900">{item.label}</div>
              {item.field && (
                <div className="mt-1 text-sm text-slate-500">
                  field: <span className="font-mono">{item.field}</span>
                </div>
              )}
            </div>
            <div className="rounded-lg bg-blue-50 px-3 py-2 font-mono text-sm font-semibold text-blue-700">
              {item.score?.toFixed(4) ?? 'N/A'}
            </div>
          </div>

          {item.source_value !== undefined && (
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              source value: {typeof item.source_value === 'string'
                ? item.source_value
                : JSON.stringify(item.source_value)}
            </div>
          )}

          {item.description && (
            <div className="mt-3 text-xs text-slate-500">{item.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}