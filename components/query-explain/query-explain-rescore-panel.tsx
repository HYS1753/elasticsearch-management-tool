'use client';

import * as React from 'react';
import type { ExplainRescoreDetail } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitFork, ChevronDown, ChevronRight } from 'lucide-react';
import { QueryExplainTreePanel } from './query-explain-tree-panel';

interface Props {
  items: ExplainRescoreDetail[];
}

function formatValueDisplay(val: unknown): React.ReactNode {
  if (val === null || val === undefined) {
    return <span className="text-slate-400 dark:text-slate-600 font-mono italic">null</span>;
  }
  if (typeof val === 'boolean') {
    return val ? (
      <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/50 select-none">
        true
      </span>
    ) : (
      <span className="inline-flex items-center rounded-md bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/50 select-none">
        false
      </span>
    );
  }
  if (typeof val === 'number') {
    return (
      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
        {val % 1 === 0 ? val.toString() : val.toFixed(4)}
      </span>
    );
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val as Record<string, unknown>);
    if (entries.length === 0) {
      return <span className="text-slate-400 dark:text-slate-500 font-mono">{"{}"}</span>;
    }
    return (
      <div className="flex flex-col gap-1 p-2 rounded-lg bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 w-full mt-1.5 shadow-3xs">
        {entries.map(([subKey, subVal]) => (
          <div key={subKey} className="flex items-center justify-between gap-4 text-[11px] font-mono border-b border-slate-100/40 dark:border-slate-800/30 last:border-b-0 py-0.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{subKey}</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[200px]" title={typeof subVal === 'object' ? JSON.stringify(subVal) : String(subVal)}>
              {typeof subVal === 'object' ? JSON.stringify(subVal) : String(subVal)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return <span className="text-slate-800 dark:text-slate-200 break-all font-medium">{String(val)}</span>;
}

function renderSourceValue(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length > 0) {
      return (
        <div className="mt-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3.5 space-y-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
            Source Value (문서 내 실제 값)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {entries.map(([key, val]) => (
              <div key={key} className="flex flex-col justify-between gap-1 bg-white dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-900 shadow-3xs">
                <span className="text-slate-400 dark:text-slate-500 font-bold text-[9px] uppercase tracking-wide font-mono">{key}</span>
                <div className="flex items-center text-slate-800 dark:text-slate-200 font-mono break-all mt-0.5 w-full">
                  {formatValueDisplay(val)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="mt-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/35 border border-slate-200/60 dark:border-slate-800 p-3.5 text-xs">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
        Source Value (문서 내 실제 값)
      </div>
      <div className="font-mono text-slate-800 dark:text-slate-200 break-all font-bold">
        {formatValueDisplay(value)}
      </div>
    </div>
  );
}

function formatNumber(value?: number | null) {
  return typeof value === 'number' ? value.toFixed(4) : 'N/A';
}

function renderParamsGrid(params?: Record<string, unknown> | null) {
  if (!params) return null;
  const entries = Object.entries(params);
  if (entries.length === 0) return null;

  return (
    <div className="mt-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3.5 space-y-2.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
        Parameters (함수 파라미터)
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {entries.map(([key, val]) => (
          <div key={key} className="flex flex-col justify-between gap-1 bg-white dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-900 shadow-3xs">
            <span className="text-slate-400 dark:text-slate-500 font-bold text-[9px] uppercase tracking-wide font-mono">{key}</span>
            <div className="flex items-center text-slate-800 dark:text-slate-200 font-mono break-all mt-0.5 w-full">
              {formatValueDisplay(val)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QueryExplainRescorePanel({ items }: Props) {
  const [treeExpanded, setTreeExpanded] = React.useState<Record<number, boolean>>({});

  const toggleTree = (order: number) => {
    setTreeExpanded(prev => ({
      ...prev,
      [order]: !prev[order]
    }));
  };

  if (!items.length) {
    return (
      <Card className="border-slate-200/70 dark:border-slate-800 shadow-sm rounded-2xl">
        <CardHeader className="border-b bg-slate-50/70 dark:bg-slate-900/70 py-4 px-5">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">Rescore</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-900/10">
            rescore 단계가 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/70 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="border-b bg-slate-50/70 dark:bg-slate-900/70 py-4 px-5">
        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">Rescore</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 p-5 bg-slate-50/40 dark:bg-slate-950/20">
        {items.map((item) => (
          <div
            key={`${item.order}-${item.type}`}
            className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs"
          >
            <div className="border-b bg-slate-50/80 dark:bg-slate-900/60 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Step {item.order}
                  </span>

                  <div className="mt-1.5 text-base font-bold text-slate-900 dark:text-slate-50">
                    {item.title}
                  </div>

                  {item.description && (
                    <div className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {item.description}
                    </div>
                  )}

                  {(item.score_mode || item.boost_mode) && (
                    <div className="mt-2.5 flex flex-wrap gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {item.score_mode && (
                        <span className="rounded-md bg-white dark:bg-slate-900 px-2 py-0.5 border border-slate-200 dark:border-slate-800">
                          score_mode: <strong className="text-slate-700 dark:text-slate-300">{item.score_mode}</strong>
                        </span>
                      )}
                      {item.boost_mode && (
                        <span className="rounded-md bg-white dark:bg-slate-900 px-2 py-0.5 border border-slate-200 dark:border-slate-800">
                          boost_mode: <strong className="text-slate-700 dark:text-slate-300">{item.boost_mode}</strong>
                        </span>
                      )}
                      {typeof item.query_weight === 'number' && (
                        <span className="rounded-md bg-white dark:bg-slate-900 px-2 py-0.5 border border-slate-200 dark:border-slate-800">
                          query_weight: <strong className="text-slate-700 dark:text-slate-300">{item.query_weight}</strong>
                        </span>
                      )}
                      {typeof item.rescore_query_weight === 'number' && (
                        <span className="rounded-md bg-white dark:bg-slate-900 px-2 py-0.5 border border-slate-200 dark:border-slate-800">
                          rescore_query_weight: <strong className="text-slate-700 dark:text-slate-300">{item.rescore_query_weight}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 shrink-0">
                  {/* Rescore Query Score */}
                  <div className="rounded-xl bg-violet-50 dark:bg-violet-950/40 px-4 py-2.5 font-mono text-sm font-bold text-violet-700 dark:text-violet-400 border border-violet-100/50 dark:border-violet-900/30 shadow-2xs">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5 font-sans font-semibold">Rescore Query Score</div>
                    {formatNumber(item.rescore_query_score)}
                  </div>

                  {/* Combined Score */}
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5 font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30 shadow-2xs">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5 font-sans font-semibold">Combined Score</div>
                    {formatNumber(item.score)}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Rescore Query Structure Tree */}
            {item.rescore_query_structure && (
              <div className="mx-5 mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-3xs">
                <button
                  onClick={() => toggleTree(item.order)}
                  className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800 text-left font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <GitFork className="h-4 w-4 text-purple-500" />
                    <span>Rescore Query Structure Tree (재채점 쿼리 연산 트리)</span>
                  </div>
                  {treeExpanded[item.order] ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                {treeExpanded[item.order] && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-900 bg-slate-50/20 dark:bg-slate-950/10">
                    <QueryExplainTreePanel node={item.rescore_query_structure} />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4 p-5">
              {item.details.length > 0 ? (
                item.details.map((detail, idx) => {
                  const isCombined = detail.label === 'Combined Function Score';

                  return (
                    <div
                      key={`${item.order}-${detail.label}-${idx}`}
                      className={
                        isCombined
                          ? 'rounded-2xl border border-blue-200 dark:border-blue-800/80 bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/10 p-5 shadow-2xs'
                          : 'rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-950 dark:to-slate-900/20 shadow-3xs'
                      }
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-bold text-slate-900 dark:text-slate-50 text-sm">{detail.label}</div>

                            {detail.matched === true && !isCombined && (
                              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 select-none">
                                matched
                              </span>
                            )}

                            {detail.matched === false && !isCombined && (
                              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 select-none">
                                not matched
                              </span>
                            )}
                          </div>

                          {detail.filter_label && (
                            <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/50 leading-relaxed">
                              <span className="font-bold text-slate-500 dark:text-slate-400 mr-1.5 uppercase text-[9px] font-mono">Filter (조건)</span>
                              {detail.filter_label}
                            </div>
                          )}

                          {detail.field && (
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              <span className="font-bold text-slate-500 mr-1">Field:</span> <span className="font-mono bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200 font-semibold">{detail.field}</span>
                            </div>
                          )}

                          {detail.operation && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-900/40 px-2 py-1 rounded inline-block border border-slate-200/60 dark:border-slate-900">
                              {detail.operation}
                            </div>
                          )}

                          {detail.source_value !== undefined && detail.source_value !== null && (
                            renderSourceValue(detail.source_value)
                          )}

                          {detail.params && (
                            renderParamsGrid(detail.params)
                          )}

                          {detail.description && (
                            <div className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-mono border-t border-slate-100 dark:border-slate-900 pt-2">
                              {detail.description}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 rounded-xl bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-right border border-slate-200 dark:border-slate-800 shadow-3xs min-w-[5rem]">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                            Score
                          </div>
                          <div className="font-mono text-sm font-bold text-blue-700 dark:text-blue-400">
                            {formatNumber(detail.score)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-4 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50/10 dark:bg-slate-900/5">
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