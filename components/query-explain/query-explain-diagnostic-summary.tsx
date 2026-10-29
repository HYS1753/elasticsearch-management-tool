'use client';

import * as React from 'react';
import type { ExplainQueryDetail, ExplainRescoreDetail, QueryExplainScoreTimelineStep } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronRight, Zap, Target, TrendingUp, Trophy, Search, GitMerge } from 'lucide-react';

interface Props {
  query: ExplainQueryDetail;
  rescores: ExplainRescoreDetail[];
  totalScore?: number | null;
  scoreTimeline?: QueryExplainScoreTimelineStep[];
}

// ownScore: 이 단계 자체가 기여한 점수 (base=BM25결과, func=적용 후 query점수, rescore=r.score)
// runningTotal: 이 단계까지 완료된 시점의 점수 (rescore의 경우 이전 점수를 덮어쓰므로 r.score가 됨)
interface ScoreStage {
  id: string;
  label: string;
  sublabel: string;
  ownScore: number;
  runningTotal: number;
  delta?: number;
  formula?: string;
  color: 'blue' | 'amber' | 'indigo' | 'emerald';
  icon: React.ReactNode;
  isFinal?: boolean;
  isPrimary?: boolean;
  subDetails?: Array<{ field?: string | null; score?: number | null; tokens?: string[]; clause_type?: string | null; description?: string | null }>;
}

function formatNum(v?: number | null, decimals = 4) {
  return typeof v === 'number' ? v.toFixed(decimals) : '—';
}

function formatDelta(v: number) {
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(4)}`;
}

// Primary = largest absolute own contribution (for rescore, comparison with previous runningTotal)
function findPrimaryStageId(stages: ScoreStage[]): string {
  let maxContrib = -Infinity;
  let primaryId = '';
  for (const s of stages) {
    if (s.isFinal) continue;
    const contrib = s.delta !== undefined ? Math.abs(s.delta) : s.ownScore;
    if (contrib > maxContrib) {
      maxContrib = contrib;
      primaryId = s.id;
    }
  }
  return primaryId;
}

const colorMap = {
  blue:    { ring: 'ring-blue-200 dark:ring-blue-800',     bg: 'bg-blue-50 dark:bg-blue-950/60',     text: 'text-blue-700 dark:text-blue-300',     badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',     icon: 'text-blue-500' },
  amber:   { ring: 'ring-amber-200 dark:ring-amber-800',   bg: 'bg-amber-50 dark:bg-amber-950/60',   text: 'text-amber-700 dark:text-amber-300',   badge: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',   icon: 'text-amber-500' },
  indigo:  { ring: 'ring-indigo-200 dark:ring-indigo-800', bg: 'bg-indigo-50 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-300', badge: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300', icon: 'text-indigo-500' },
  emerald: { ring: 'ring-emerald-300 dark:ring-emerald-700', bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-500 text-white', icon: 'text-emerald-500' },
};

export function QueryExplainDiagnosticSummary({ query, rescores, scoreTimeline }: Props) {
  const stages = React.useMemo<ScoreStage[]>(() => {
    if (scoreTimeline && scoreTimeline.length > 0) {
      const result: ScoreStage[] = [];
      let prevTotal = 0;

      scoreTimeline.forEach((step, idx) => {
        const key = step.key;
        const value = step.value ?? 0;
        const opVal = step.operator_value ?? 0;

        let label = step.label || '';
        let sublabel = step.description || '';
        let ownScore = opVal;
        let runningTotal = value;
        let color: 'blue' | 'amber' | 'indigo' | 'emerald' = 'indigo';
        let icon: React.ReactNode = <TrendingUp className="h-4 w-4" />;
        let isFinal = false;
        let formula = undefined;
        let delta = undefined;

        if (key === 'query') {
          label = 'Base Match';
          sublabel = step.description || 'BM25 텍스트 / KNN 벡터 유사도';
          ownScore = value;
          runningTotal = value;
          color = 'blue';
          icon = <Search className="h-4 w-4" />;
          prevTotal = value;
        } else if (key === 'function_score') {
          label = 'Function Score';
          sublabel = step.description || '가중치 함수 적용 결과';
          ownScore = opVal;
          runningTotal = value;
          color = 'amber';
          icon = <Zap className="h-4 w-4" />;

          if (step.operator) {
            formula = `${step.operator} ${opVal.toFixed(4)}`;
          }
          delta = runningTotal - prevTotal;
          prevTotal = value;
        } else if (key.startsWith('rescore_')) {
          label = step.label || `Rescore`;
          sublabel = step.description || '';
          ownScore = opVal;
          runningTotal = value;
          color = 'indigo';
          icon = <TrendingUp className="h-4 w-4" />;

          if (step.operator) {
            formula = `${step.operator} ${opVal.toFixed(4)}`;
          }
          delta = runningTotal - prevTotal;
          prevTotal = value;
        } else if (key === 'total') {
          label = '최종 점수';
          sublabel = 'Final Score';
          ownScore = value;
          runningTotal = value;
          color = 'emerald';
          icon = <Trophy className="h-4 w-4" />;
          isFinal = true;
        }

        result.push({
          id: key === 'query' ? 'base' : key,
          label,
          sublabel,
          ownScore,
          runningTotal,
          delta,
          formula,
          color,
          icon,
          isFinal,
          subDetails: step.sub_details,
        });
      });

      const primaryId = findPrimaryStageId(result);
      return result.map(s => ({ ...s, isPrimary: s.id === primaryId }));
    }

    // base = BM25/KNN score before function_score
    const baseScore = query.original_score ?? query.final_query_score ?? 0;
    // queryScore = score after function_score (or same as base if no function_score)
    const queryScore = query.final_query_score ?? 0;
    const hasFunctionScore =
      query.function_score_combined != null &&
      Math.abs(query.function_score_combined - 1.0) > 0.0001;
    const funcMultiplier = hasFunctionScore ? query.function_score_combined! : null;
    const boostMode = query.function_boost_mode ?? 'multiply';

    const result: ScoreStage[] = [];

    // ── Stage 1: Base Match ────────────────────────────────────────
    result.push({
      id: 'base',
      label: 'Base Match',
      sublabel: 'BM25 텍스트 / KNN 벡터 유사도',
      ownScore: baseScore,
      runningTotal: baseScore,
      color: 'blue',
      icon: <Search className="h-4 w-4" />,
    });

    // ── Stage 2: Function Score (only if actually applied) ─────────
    let runningAfterQuery = baseScore;
    if (hasFunctionScore && funcMultiplier != null) {
      let formulaStr = '';
      if (boostMode === 'multiply') {
        formulaStr = `×${funcMultiplier.toFixed(4)} (multiply)`;
      } else if (boostMode === 'sum') {
        formulaStr = `+${funcMultiplier.toFixed(4)} (sum)`;
      } else if (boostMode === 'replace') {
        formulaStr = `→ replace`;
      } else {
        formulaStr = `${boostMode}: ×${funcMultiplier.toFixed(4)}`;
      }
      
      const delta = queryScore - baseScore;
      result.push({
        id: 'func',
        label: 'Function Score',
        sublabel: formulaStr,
        ownScore: queryScore,      // output of function_score = the new query score
        runningTotal: queryScore,
        delta: delta,
        formula: formulaStr,
        color: 'amber',
        icon: <Zap className="h-4 w-4" />,
      });
      runningAfterQuery = queryScore;
    }

    // ── Stage 3+: Each Rescore step ───────────────────────────────
    // rescore 의 점수는 query score 에 더하는 게 아니라,
    // 이전 점수를 대체하여 완전히 변화합니다: 82.8114 → 0.2000 → 0.3500
    // ownScore  = 이 rescore 단계의 출력 점수
    // runningTotal = 이 rescore 단계 완료 시점의 최종 점수 (r.score)
    // delta = 이전 단계 대비 점수 변화량 (r.score - prevTotal)
    let prevTotal = runningAfterQuery;
    for (let i = 0; i < rescores.length; i++) {
      const r = rescores[i];
      const stepScore = r.score ?? 0;   // this rescore step's final output score
      const delta = stepScore - prevTotal;

      let formulaStr = '';
      if (r.score_mode) formulaStr += `score_mode: ${r.score_mode}`;
      if (typeof r.query_weight === 'number') {
        formulaStr += (formulaStr ? ' | ' : '') + `qw: ${r.query_weight}`;
      }
      if (typeof r.rescore_query_weight === 'number') {
        formulaStr += (formulaStr ? ' | ' : '') + `rqw: ${r.rescore_query_weight}`;
      }

      result.push({
        id: `rescore_${i}`,
        label: r.title || `Rescore ${i + 1}`,
        sublabel: r.type ? `(${r.type})` : `재채점 ${i + 1}단계`,
        ownScore: stepScore,
        runningTotal: stepScore,
        delta: delta,
        formula: formulaStr || undefined,
        color: 'indigo',
        icon: <TrendingUp className="h-4 w-4" />,
      });
      prevTotal = stepScore;
    }

    // ── Final stage ────────────────────────────────────────────────
    const finalRunning = rescores.length > 0 ? prevTotal : runningAfterQuery;
    result.push({
      id: 'final',
      label: '최종 점수',
      sublabel: 'Final Score',
      ownScore: finalRunning,
      runningTotal: finalRunning,
      color: 'emerald',
      icon: <Trophy className="h-4 w-4" />,
      isFinal: true,
    });

    // Mark primary contributor
    const primaryId = findPrimaryStageId(result);
    return result.map(s => ({ ...s, isPrimary: s.id === primaryId }));
  }, [query, rescores, scoreTimeline]);

  const nonFinalStages = stages.filter(s => !s.isFinal);
  const finalStage = stages.find(s => s.isFinal);

  return (
    <div className="space-y-5">
      {/* ── Score Transformation Timeline ─────────────────────────── */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <GitMerge className="h-4 w-4 text-slate-400" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 font-mono">
            점수 변환 타임라인 (Score Transformation Pipeline)
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-stretch gap-1 md:gap-0">
          {stages.map((stage, idx) => {
            const c = colorMap[stage.color];
            const isLast = idx === stages.length - 1;
            const isRescore = stage.id.startsWith('rescore_');

            return (
              <React.Fragment key={stage.id}>
                {/* Stage card */}
                <div
                  className={cn(
                    'flex-1 relative rounded-2xl border p-4 transition-all duration-150 flex flex-col justify-between gap-2',
                    c.bg,
                    stage.isPrimary && !stage.isFinal
                      ? `ring-2 ${c.ring} shadow-md`
                      : 'border-transparent',
                    stage.isFinal && 'border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-200/70 dark:ring-emerald-800/70 shadow-md'
                  )}
                >
                  {/* Primary badge */}
                  {stage.isPrimary && !stage.isFinal && (
                    <span className={cn('absolute -top-2 left-3 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm', c.badge)}>
                      주 기여
                    </span>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn('shrink-0', c.icon)}>{stage.icon}</span>
                      <span className={cn('text-xs font-bold leading-tight', c.text)}>
                        {stage.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-relaxed pl-6 break-all">
                      {stage.formula ?? stage.sublabel}
                    </p>
                    {/* Sub-details: top contributing fields for query step */}
                    {stage.id === 'base' && stage.subDetails && stage.subDetails.length > 0 && (
                      <div className="pl-6 pt-1 space-y-0.5">
                        {stage.subDetails.slice(0, 2).map((sd, sdIdx) => (
                          <div key={sdIdx} className="flex items-center gap-1.5 text-[9px] font-mono">
                            <span className="text-blue-500 dark:text-blue-400">▸</span>
                            <span className="text-slate-600 dark:text-slate-400 truncate max-w-[100px]">{sd.field}</span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold">+{(sd.score ?? 0).toFixed(1)}</span>
                            {sd.tokens && sd.tokens.length > 0 && (
                              <span className="text-slate-400 dark:text-slate-500 truncate max-w-[80px]">
                                ({sd.tokens.join(', ')})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Score section: rescore shows delta big + cumulative small; others show own score */}
                  <div className="pl-6 pt-1">
                    <div className={cn('font-mono text-xl font-extrabold tracking-tight', c.text)}>
                      {formatNum(stage.runningTotal)}
                    </div>
                    {isRescore && (
                      <div className="text-[10px] font-mono mt-0.5 text-slate-500 dark:text-slate-400 font-semibold">
                        재채점 쿼리 점수: {formatNum(stage.ownScore)}
                      </div>
                    )}
                    {stage.delta !== undefined && (
                      <div className={cn(
                        "text-[10px] font-mono mt-0.5 font-bold",
                        stage.delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                      )}>
                        이전 대비 {formatDelta(stage.delta)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow connector */}
                {!isLast && (
                  <div className="flex items-center justify-center md:px-1 py-1 md:py-0 shrink-0">
                    <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-700 hidden md:block" />
                    <div className="w-0.5 h-4 bg-slate-200 dark:bg-slate-800 md:hidden mx-auto" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Score Breakdown Table ──────────────────────────────────── */}
      {/* 출력점수 = 해당 단계 자체가 만들어낸 점수 / 누적점수 = 이 단계 이후 합산 총점 */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-900 flex items-center gap-2">
          <Target className="h-4 w-4 text-slate-400" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 font-mono">
            단계별 점수 기여 분석 (Step-by-Step Score Breakdown)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-900 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                <th className="text-left px-5 py-2.5 font-semibold">단계</th>
                <th className="text-left px-4 py-2.5 font-semibold hidden sm:table-cell">변환 방식</th>
                <th className="text-right px-4 py-2.5 font-semibold">출력 점수</th>
                <th className="text-right px-5 py-2.5 font-semibold">누적 점수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-900/70">
              {nonFinalStages.map((stage) => {
                const c = colorMap[stage.color];
                const isRescore = stage.id.startsWith('rescore_');
                // 출력점수: rescore는 delta, function/base는 자체 산출값
                const displayOwnScore = isRescore
                  ? formatDelta(stage.ownScore)
                  : formatNum(stage.ownScore);
                const isBaseStage = stage.id === 'base';

                return (
                  <tr
                    key={stage.id}
                    className={cn(
                      'transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-900/30',
                      stage.isPrimary && 'bg-blue-50/30 dark:bg-blue-950/10'
                    )}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn('shrink-0', c.icon)}>{stage.icon}</span>
                        <div>
                          <div className={cn('font-semibold', c.text)}>{stage.label}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{stage.sublabel}</div>
                        </div>
                        {stage.isPrimary && (
                          <span className={cn('ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full', c.badge)}>주 기여</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {stage.formula ? (
                        <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                          {stage.formula}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">—</span>
                      )}
                    </td>
                    {/* 출력 점수: 이 단계 자체의 기여값 */}
                    <td className="px-4 py-3 text-right">
                      <div className={cn('font-mono font-bold', c.text)}>
                        {formatNum(stage.ownScore)}
                      </div>
                      {stage.delta !== undefined && (
                        <div className={cn(
                          "text-[10px] font-mono mt-0.5 font-bold",
                          stage.delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                        )}>
                          {formatDelta(stage.delta)}
                        </div>
                      )}
                    </td>
                    {/* 누적 점수: 이 단계 이후의 누적 합산 */}
                    <td className="px-5 py-3 text-right">
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {formatNum(stage.runningTotal)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {finalStage && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/10">
                  <td className="px-5 py-3" colSpan={2}>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">최종 점수 (Final Score)</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-slate-300 dark:text-slate-700 font-mono text-[10px]">—</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="font-mono text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                      {formatNum(finalStage.runningTotal)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
