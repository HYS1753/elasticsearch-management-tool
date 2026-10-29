'use client';

import * as React from 'react';
import type { ExplainFilter } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, AlertCircle, HelpCircle } from 'lucide-react';

interface Props {
  filters?: ExplainFilter[];
  defaultExpanded?: boolean;
  stepNum?: number;
}

function renderSourceValue(value: unknown) {
  if (value === null || value === undefined) {
    return '데이터 없음';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

export function QueryExplainFilterStep({ filters = [], defaultExpanded = false, stepNum }: Props) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  // Separate matched and unmatched filters
  const { matchedCount, unmatchedCount } = React.useMemo(() => {
    let matched = 0;
    let unmatched = 0;
    filters.forEach(f => {
      if (f.matched) matched++;
      else unmatched++;
    });
    return { matchedCount: matched, unmatchedCount: unmatched };
  }, [filters]);

  if (filters.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/30 p-5 text-center text-slate-400 dark:text-slate-500 text-xs">
        지정된 필터 매칭 조건이 없습니다.
      </div>
    );
  }

  const hasUnmatched = unmatchedCount > 0;

  return (
    <div className={cn(
      "rounded-2xl border transition-all duration-200 shadow-sm",
      hasUnmatched
        ? "border-red-200 dark:border-red-900 bg-gradient-to-br from-red-50/10 to-transparent dark:from-red-950/5"
        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
    )}>
      {/* Header (Accordion Toggle) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 text-left outline-none"
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2.5 rounded-xl shrink-0 mt-0.5",
            hasUnmatched 
              ? "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400" 
              : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
          )}>
            {hasUnmatched ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md">
                {stepNum != null ? `Step ${stepNum}` : 'Filter'}
              </span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                필터 조건 검증 (Filter Checks)
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              문서가 쿼리의 필수/필터 조건(must, filter, must_not 등)을 충족하는지 검증합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center font-mono">
          <div className="text-right">
            <span className={cn(
              "text-xs font-bold px-2.5 py-1 rounded-full border",
              hasUnmatched
                ? "bg-red-100/50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/50"
                : "bg-emerald-100/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50"
            )}>
              {hasUnmatched ? `미매칭 필터 ${unmatchedCount}개 감지` : '필터 조건 모두 만족'}
            </span>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
              만족: {matchedCount} / 전체: {filters.length}
            </div>
          </div>
          <div className="text-slate-400 dark:text-slate-500">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-slate-900 p-5 space-y-4">
          {hasUnmatched && (
            <div className="rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-950 px-4 py-3 text-xs text-red-800 dark:text-red-300 flex gap-2 items-start leading-relaxed">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <strong>필터 미매칭 원인 분석</strong>: 아래 빨간색으로 표시된 필터 조건들을 만족하지 못했습니다. 
                Elasticsearch에서 <strong>filter</strong> 또는 <strong>must</strong> 조건 불일치는 최종 문서 매칭 제외 또는 점수 0점의 원인이 됩니다.
              </div>
            </div>
          )}

          <div className="grid gap-3">
            {filters.map((filter, index) => {
              const matched = filter.matched;
              return (
                <div
                  key={`${filter.label}-${index}`}
                  className={cn(
                    "rounded-xl border p-4 transition-all duration-200 hover:shadow-xs",
                    matched
                      ? "border-emerald-100 dark:border-emerald-950 bg-emerald-50/5 dark:bg-emerald-950/2"
                      : "border-red-200 dark:border-red-950/80 bg-red-50/10 dark:bg-red-950/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {matched ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 justify-between">
                        <span className={cn(
                          "font-mono text-sm font-bold break-all",
                          matched ? "text-slate-800 dark:text-slate-200" : "text-red-900 dark:text-red-300"
                        )}>
                          {filter.label}
                        </span>
                        <span className={cn(
                          "text-[9px] font-bold uppercase px-2 py-0.5 rounded",
                          matched
                            ? "bg-emerald-100/60 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                            : "bg-red-100/60 dark:bg-red-950 text-red-800 dark:text-red-300"
                        )}>
                          {matched ? 'PASS' : 'FAIL'}
                        </span>
                      </div>

                      {filter.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {filter.description}
                        </p>
                      )}

                      {/* Actual Document vs Expected Comparison Table */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2.5 border-t border-dashed border-slate-100 dark:border-slate-900 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider font-semibold">
                            필터 타겟 조건 (Expected)
                          </span>
                          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-lg px-3 py-1.5 font-mono text-slate-700 dark:text-slate-300 break-all select-all font-medium">
                            {filter.label}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider font-semibold">
                            문서 내 실제 값 (Document Value)
                          </span>
                          <div className={cn(
                            "border rounded-lg px-3 py-1.5 font-mono break-all font-medium",
                            matched
                              ? "bg-slate-50 dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/80 text-slate-700 dark:text-slate-300"
                              : "bg-red-50/30 dark:bg-red-950/20 border-red-200/30 dark:border-red-900/30 text-red-700 dark:text-red-400 font-semibold"
                          )}>
                            {renderSourceValue(filter.source_value)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
