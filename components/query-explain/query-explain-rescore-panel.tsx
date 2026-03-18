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

function formatNumber(value?: number | null) {
  return typeof value === 'number' ? value.toFixed(4) : 'N/A';
}

function renderParams(params?: Record<string, unknown> | null) {
  if (!params) return null;
  return JSON.stringify(params);
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
          <div
            key={`${item.order}-${item.type}`}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b bg-slate-50 px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Step {item.order}
                  </div>

                  <div className="mt-1 text-base font-semibold text-slate-900">
                    {item.title}
                  </div>

                  {item.description && (
                    <div className="mt-2 text-sm leading-6 text-slate-600">
                      {item.description}
                    </div>
                  )}

                  {(item.score_mode || item.boost_mode) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                      {item.score_mode && (
                        <span className="rounded bg-white px-2 py-1 border border-slate-200">
                          score_mode: {item.score_mode}
                        </span>
                      )}
                      {item.boost_mode && (
                        <span className="rounded bg-white px-2 py-1 border border-slate-200">
                          boost_mode: {item.boost_mode}
                        </span>
                      )}
                      {typeof item.query_weight === 'number' && (
                        <span className="rounded bg-white px-2 py-1 border border-slate-200">
                          query_weight: {item.query_weight}
                        </span>
                      )}
                      {typeof item.rescore_query_weight === 'number' && (
                        <span className="rounded bg-white px-2 py-1 border border-slate-200">
                          rescore_query_weight: {item.rescore_query_weight}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-blue-50 px-3 py-2 font-mono text-sm font-semibold text-blue-700">
                  {formatNumber(item.score)}
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4">
              {item.details.length > 0 ? (
                item.details.map((detail, idx) => {
                  const isCombined = detail.label === 'Combined Function Score';

                  return (
                    <div
                      key={`${item.order}-${detail.label}-${idx}`}
                      className={
                        isCombined
                          ? 'rounded-xl border border-blue-200 bg-blue-50 p-4'
                          : 'rounded-xl border border-slate-200 p-4'
                      }
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-medium text-slate-900">{detail.label}</div>

                            {detail.matched === true && !isCombined && (
                              <span className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                                matched
                              </span>
                            )}

                            {detail.matched === false && !isCombined && (
                              <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                                not matched
                              </span>
                            )}
                          </div>

                          {detail.filter_label && (
                            <div className="mt-2 text-sm text-slate-700">
                              <span className="font-medium">조건</span>: {detail.filter_label}
                            </div>
                          )}

                          {detail.field && (
                            <div className="mt-1 text-sm text-slate-600">
                              <span className="font-medium">필드</span>: <span className="font-mono">{detail.field}</span>
                            </div>
                          )}

                          {detail.operation && (
                            <div className="mt-1 text-xs text-slate-500">
                              {detail.operation}
                            </div>
                          )}

                          {detail.source_value !== undefined && detail.source_value !== null && (
                            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                              <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                Source Value
                              </div>
                              {renderSourceValue(detail.source_value)}
                            </div>
                          )}

                          {detail.params && (
                            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                              <span className="font-medium">params:</span> {renderParams(detail.params)}
                            </div>
                          )}

                          {detail.description && (
                            <div className="mt-3 text-xs leading-5 text-slate-500">
                              {detail.description}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 rounded bg-white px-3 py-2 text-right shadow-sm">
                          <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                            Score
                          </div>
                          <div className="font-mono text-sm font-semibold text-blue-700">
                            {formatNumber(detail.score)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
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