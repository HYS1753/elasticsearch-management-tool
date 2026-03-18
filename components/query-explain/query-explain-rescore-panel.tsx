'use client';

import type { ExplainRescoreDetail } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  items: ExplainRescoreDetail[];
}

function renderSourceValue(value: unknown) {
  if (value === null || value === undefined) {
    return 'source 없음';
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
}

export function QueryExplainRescorePanel({ items }: Props) {
  if (!items.length) {
    return (
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader className="border-b bg-slate-50/70">
          <CardTitle className="text-base">Rescore</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500">
            rescore 단계가 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/70 shadow-sm">
      <CardHeader className="border-b bg-slate-50/70">
        <CardTitle className="text-base">Rescore</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        {items.map((item) => (
          <div key={`${item.order}-${item.type}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b bg-slate-50 px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Step {item.order}
                  </div>
                  <div className="mt-1 text-base font-semibold text-slate-900">{item.title}</div>
                  {item.description && (
                    <div className="mt-2 text-sm text-slate-600">{item.description}</div>
                  )}
                </div>

                <div className="rounded-lg bg-blue-50 px-3 py-2 font-mono text-sm font-semibold text-blue-700">
                  {typeof item.score === 'number' ? item.score.toFixed(4) : 'N/A'}
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4">
              {item.details.length > 0 ? (
                item.details.map((detail, idx) => (
                  <div key={`${item.order}-${detail.label}-${idx}`} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-900">{detail.label}</div>
                        {detail.field && (
                          <div className="mt-1 text-sm text-slate-500">
                            field: <span className="font-mono">{detail.field}</span>
                          </div>
                        )}
                      </div>

                      <div className="rounded bg-slate-50 px-3 py-2 font-mono text-sm font-semibold text-slate-900">
                        {typeof detail.score === 'number' ? detail.score.toFixed(4) : 'N/A'}
                      </div>
                    </div>

                    {detail.source_value !== undefined && detail.source_value !== null && (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                        source: {renderSourceValue(detail.source_value)}
                      </div>
                    )}

                    {detail.description && (
                      <div className="mt-3 text-xs text-slate-500">{detail.description}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500">
                  추가 상세 정보가 없습니다.
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}