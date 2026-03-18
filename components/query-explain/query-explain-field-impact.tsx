'use client';

import type { QueryExplainFieldImpact } from '@/types';

interface Props {
  items: QueryExplainFieldImpact[];
}

export function QueryExplainFieldImpact({ items }: Props) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500">
        필드별 점수 기여 정보가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={`${item.field}-${idx}`} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  {item.field}
                </span>
                <span className="font-mono text-sm font-semibold text-slate-900">
                  score: {item.total_score?.toFixed(4) ?? 'N/A'}
                </span>
              </div>

              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Source Value</div>
                <div className="mt-1 break-words text-sm text-slate-900">
                  {typeof item.source_value === 'string'
                    ? item.source_value
                    : JSON.stringify(item.source_value)}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.matched_tokens.map((token, tokenIdx) => (
                  <div
                    key={`${token.token}-${tokenIdx}`}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2"
                  >
                    <div className="text-sm font-medium text-blue-900">{token.token}</div>
                    <div className="mt-1 font-mono text-xs text-blue-700">
                      score {token.score?.toFixed(4) ?? '-'}
                      {token.boost != null && ` · boost ${token.boost.toFixed(4)}`}
                      {token.idf != null && ` · idf ${token.idf.toFixed(4)}`}
                      {token.tf != null && ` · tf ${token.tf.toFixed(4)}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}