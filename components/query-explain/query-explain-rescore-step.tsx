'use client';

import * as React from 'react';
import type { ExplainRescoreDetail } from '@/types';
import { cn } from '@/lib/utils';
import { TrendingUp, ChevronDown, ChevronUp, ChevronRight, AlertCircle, ArrowRight, GitFork } from 'lucide-react';
import { QueryExplainTreePanel } from './query-explain-tree-panel';

interface Props {
  rescores?: ExplainRescoreDetail[];
  queryScore?: number;
  defaultExpanded?: boolean;
  stepNum?: number;
}

function formatNumber(value?: number | null) {
  return typeof value === 'number' ? value.toFixed(4) : '0.0000';
}

export function QueryExplainRescoreStep({
  rescores = [],
  queryScore = 0,
  defaultExpanded = false,
  stepNum,
}: Props) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const [treeExpanded, setTreeExpanded] = React.useState<Record<number, boolean>>({});

  const toggleTree = (order: number) => {
    setTreeExpanded(prev => ({
      ...prev,
      [order]: !prev[order]
    }));
  };

  if (rescores.length === 0) {
    return null; // Don't render if no rescore steps exist
  }

  // Calculate total rescore change relative to queryScore baseline
  const lastRescoreVal = rescores[rescores.length - 1]?.score ?? queryScore;
  const totalChangeVal = lastRescoreVal - queryScore;
  const totalChangePct = queryScore > 0 ? (totalChangeVal / queryScore) * 100 : 0;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
      {/* Header (Accordion Toggle) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 text-left outline-none hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-900 text-slate-500 px-2 py-0.5 rounded-md">
                {stepNum != null ? `Step ${stepNum}` : 'Rescore'}
              </span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                재채점 부스팅 단계 (Rescore Boosting)
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              1차 검색 완료 후, 상위 N개 문서에 대해서만 별도의 복잡한 모델(크로스 엔코더, 벡터 유사도 등)을 적용해 점수를 다시 계산합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center font-mono">
          <div className="text-right">
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
              최종: {formatNumber(lastRescoreVal)}
            </span>
            <div className={cn(
              "text-[10px] mt-1 font-bold",
              totalChangeVal >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
            )}>
              {totalChangeVal >= 0 ? '+' : ''}{formatNumber(totalChangeVal)} ({totalChangeVal >= 0 ? '+' : ''}{totalChangePct.toFixed(1)}%)
            </div>
          </div>
          <div className="text-slate-400">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-slate-900 p-5 space-y-4">
          <div className="grid gap-3">
            {rescores.map((rescore, idx) => {
              const rescoreVal = rescore.score || 0;
              const prevVal = idx === 0 ? queryScore : (rescores[idx - 1].score || 0);
              const changeVal = rescoreVal - prevVal;
              const changePct = prevVal > 0 ? (changeVal / prevVal) * 100 : 0;

              return (
                <div
                  key={`${rescore.type}-${idx}`}
                  className="rounded-xl border border-indigo-100/85 dark:border-indigo-950 bg-indigo-50/5 dark:bg-indigo-950/5 p-4 space-y-3 transition-all duration-200 hover:shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded uppercase">
                          Step {rescore.order}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
                          {rescore.title}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 font-mono">
                          ({rescore.type})
                        </span>
                      </div>
                      {rescore.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {rescore.description}
                        </p>
                      )}

                      {/* Rescore Mode Parameters */}
                      {(rescore.score_mode || rescore.boost_mode) && (
                        <div className="flex flex-wrap gap-1.5 text-[9px] font-mono text-slate-400 dark:text-slate-500">
                          {rescore.score_mode && <span>score_mode: {rescore.score_mode}</span>}
                          {rescore.score_mode && rescore.boost_mode && <span>|</span>}
                          {rescore.boost_mode && <span>boost_mode: {rescore.boost_mode}</span>}
                          {typeof rescore.query_weight === 'number' && (
                            <>
                              <span>|</span>
                              <span>query_weight: {rescore.query_weight}</span>
                            </>
                          )}
                          {typeof rescore.rescore_query_weight === 'number' && (
                            <>
                              <span>|</span>
                              <span>rescore_query_weight: {rescore.rescore_query_weight}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0 items-end sm:items-center font-mono">
                      {/* Rescore Query Score */}
                      <div className="text-right rounded-lg bg-violet-50 dark:bg-violet-950/30 px-3 py-1.5 border border-violet-100/50 dark:border-violet-900/30">
                        <div className="text-[8px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans font-semibold">Rescore Query</div>
                        <div className="text-xs font-bold text-violet-750 dark:text-violet-400">{formatNumber(rescore.rescore_query_score)}</div>
                      </div>

                      {/* Combined Score */}
                      <div className="text-right rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 border border-emerald-100/50 dark:border-emerald-900/30">
                        <div className="text-[8px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans font-semibold">Combined</div>
                        <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{formatNumber(rescoreVal)}</div>
                        <div className={cn(
                          "text-[9px] font-bold mt-0.5",
                          changeVal >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                        )}>
                          {changeVal >= 0 ? '+' : ''}{formatNumber(changeVal)} ({changeVal >= 0 ? '+' : ''}{changePct.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Rescore Query Structure Tree */}
                  {rescore.rescore_query_structure && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-3xs mt-2">
                      <button
                        onClick={() => toggleTree(rescore.order)}
                        className="w-full flex items-center justify-between px-4 py-2 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800 text-left font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <GitFork className="h-3.5 w-3.5 text-purple-500" />
                          <span>Rescore Query Structure Tree (재채점 쿼리 연산 트리)</span>
                        </div>
                        {treeExpanded[rescore.order] ? (
                          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </button>
                      {treeExpanded[rescore.order] && (
                        <div className="p-4 border-t border-slate-100 dark:border-slate-900 bg-slate-50/20 dark:bg-slate-950/10">
                          <QueryExplainTreePanel node={rescore.rescore_query_structure} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
