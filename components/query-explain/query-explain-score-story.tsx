'use client';

import * as React from 'react';
import type {
  QueryExplainScoreTimelineStep,
  ExplainQueryDetail,
  ExplainRescoreDetail,
  ScoreSubDetail,
} from '@/types';
import { cn } from '@/lib/utils';
import { Search, Zap, TrendingUp, Trophy, ArrowDown, Hash } from 'lucide-react';

interface Props {
  scoreTimeline: QueryExplainScoreTimelineStep[];
  query?: ExplainQueryDetail;
  rescores?: ExplainRescoreDetail[];
}

/* ── helpers ──────────────────────────────────────────────────────── */

function fmt(v?: number | null, decimals = 4): string {
  return typeof v === 'number' ? v.toFixed(decimals) : '—';
}

function fmtDelta(v: number): string {
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(4)}`;
}

function pct(v: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max((v / total) * 100, 0), 100);
}

/* ── colour system (matching diagnostic-summary) ─────────────────── */

const stepConfig = {
  query: {
    color: 'blue',
    icon: <Search className="h-4 w-4" />,
    border: 'border-l-blue-500',
    bg: 'bg-blue-50/60 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
  },
  function_score: {
    color: 'amber',
    icon: <Zap className="h-4 w-4" />,
    border: 'border-l-amber-500',
    bg: 'bg-amber-50/60 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
  },
  rescore: {
    color: 'indigo',
    icon: <TrendingUp className="h-4 w-4" />,
    border: 'border-l-indigo-500',
    bg: 'bg-indigo-50/60 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    badge: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300',
  },
  total: {
    color: 'emerald',
    icon: <Trophy className="h-4 w-4" />,
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50/60 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-500 text-white',
  },
} as const;

type StepType = keyof typeof stepConfig;

function resolveStepType(key: string): StepType {
  if (key === 'query') return 'query';
  if (key === 'function_score') return 'function_score';
  if (key.startsWith('rescore')) return 'rescore';
  if (key === 'total') return 'total';
  return 'rescore'; // fallback
}

/* ── clause badge ─────────────────────────────────────────────────── */

const clauseBadgeMap: Record<string, string> = {
  must: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
  should: 'bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-300',
  filter: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  knn: 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300',
};

function ClauseTypeBadge({ type }: { type?: string | null }) {
  if (!type) return null;
  const cls = clauseBadgeMap[type] ?? 'bg-slate-100 dark:bg-slate-800 text-slate-500';
  return (
    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider', cls)}>
      {type}
    </span>
  );
}

/* ── field icon ───────────────────────────────────────────────────── */

function FieldIcon({ clauseType }: { clauseType?: string | null }) {
  if (clauseType === 'knn') return <span className="text-sm" aria-label="KNN vector">🔍</span>;
  return <span className="text-sm" aria-label="BM25 text">📝</span>;
}

/* ── sub-detail card (field contribution) ─────────────────────────── */

function SubDetailRow({ detail, maxScore }: { detail: ScoreSubDetail; maxScore: number }) {
  const score = detail.score ?? 0;
  const percentage = pct(score, maxScore);

  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
      <FieldIcon clauseType={detail.clause_type} />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono truncate">
            {detail.field || '(unknown)'}
          </span>
          <ClauseTypeBadge type={detail.clause_type} />
        </div>

        {detail.tokens.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {detail.tokens.map((token, i) => (
              <span
                key={`${token}-${i}`}
                className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded"
              >
                <Hash className="h-2.5 w-2.5 text-slate-400" />
                {token}
              </span>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-400 dark:bg-blue-500 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 shrink-0">
            {fmt(score)}
          </span>
        </div>

        {detail.description && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
            {detail.description}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── delta arrow connector ────────────────────────────────────────── */

function DeltaArrow({ delta }: { delta: number }) {
  return (
    <div className="flex flex-col items-center py-1">
      <ArrowDown className="h-4 w-4 text-slate-300 dark:text-slate-600" />
      <span
        className={cn(
          'text-[10px] font-mono font-bold px-2 py-0.5 rounded-full',
          delta >= 0
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400'
        )}
      >
        점수 변동 {fmtDelta(delta)}
      </span>
    </div>
  );
}

/* ── step narrative builders ──────────────────────────────────────── */

function queryNarrative(step: QueryExplainScoreTimelineStep): string {
  const hasKnn = step.sub_details?.some(d => d.clause_type === 'knn');
  const hasBm25 = step.sub_details?.some(d => d.clause_type !== 'knn');
  if (hasKnn && hasBm25) {
    return '텍스트 매칭(BM25)과 벡터 유사도(KNN)를 결합하여 기본 점수를 산출했습니다.';
  }
  if (hasKnn) {
    return '벡터 유사도(KNN)를 사용하여 기본 점수를 산출했습니다.';
  }
  return '검색어와 문서 필드 간 텍스트 매칭(BM25)으로 기본 점수를 산출했습니다.';
}

function functionScoreNarrative(step: QueryExplainScoreTimelineStep): string {
  const op = step.operator ?? '';
  const val = step.operator_value;
  if (op && typeof val === 'number') {
    return `인기도·최신성 등의 비즈니스 가중치가 적용되었습니다. (${op} ${fmt(val)})`;
  }
  return '인기도·최신성 등의 비즈니스 가중치가 적용되었습니다.';
}

function rescoreNarrative(step: QueryExplainScoreTimelineStep): string {
  const op = step.operator ?? '';
  const val = step.operator_value;
  const label = step.label || '재채점';
  if (op && typeof val === 'number') {
    return `"${label}" 재채점이 수행되었습니다. (${op} ${fmt(val)})`;
  }
  return `"${label}" 재채점이 수행되어 점수가 조정되었습니다.`;
}

/* ── main component ───────────────────────────────────────────────── */

export function QueryExplainScoreStory({ scoreTimeline, query, rescores }: Props) {
  // Compute deltas (hook must be called before any early return)
  const stepsWithDelta = React.useMemo(() => {
    if (!scoreTimeline || scoreTimeline.length === 0) return [];
    let prev = 0;
    return scoreTimeline.map((step, idx) => {
      const value = step.value ?? 0;
      const delta = idx === 0 ? 0 : value - prev;
      prev = value;
      return { step, delta, idx };
    });
  }, [scoreTimeline]);

  if (stepsWithDelta.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <span className="text-base">📖</span>
        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 font-mono">
          점수 스토리 (Score Story)
        </span>
      </div>

      <div className="space-y-0">
        {stepsWithDelta.map(({ step, delta, idx }) => {
          const type = resolveStepType(step.key);
          const config = stepConfig[type];
          const isFirst = idx === 0;
          const isLast = idx === stepsWithDelta.length - 1;

          return (
            <React.Fragment key={step.key}>
              {/* Delta arrow between steps */}
              {!isFirst && <DeltaArrow delta={delta} />}

              {/* Step card */}
              <div
                className={cn(
                  'rounded-2xl border-l-4 p-4 transition-all',
                  config.border,
                  config.bg,
                  type === 'total' && 'ring-1 ring-emerald-200/70 dark:ring-emerald-800/70'
                )}
              >
                {/* Step header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn('shrink-0', `text-${config.color}-500`)}>{config.icon}</span>
                  <h4 className={cn('text-sm font-bold', config.text)}>
                    {step.label || step.key}
                  </h4>
                  <span className={cn('ml-auto font-mono text-lg font-extrabold', config.text)}>
                    {fmt(step.value)}
                  </span>
                </div>

                {/* Narrative */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3 pl-6">
                  {type === 'query' && queryNarrative(step)}
                  {type === 'function_score' && functionScoreNarrative(step)}
                  {type === 'rescore' && rescoreNarrative(step)}
                  {type === 'total' && '🏆 모든 단계를 거쳐 최종 점수가 결정되었습니다.'}
                </p>

                {/* Sub-details for query step: field-level contributions */}
                {type === 'query' && step.sub_details && step.sub_details.length > 0 && (
                  <div className="pl-6 space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono mb-2">
                      필드별 기여 (Field Contributions)
                    </p>
                    <div className="grid gap-1.5">
                      {step.sub_details.map((detail, di) => {
                        const maxScore = Math.max(
                          ...step.sub_details!.map(d => d.score ?? 0),
                          0.0001
                        );
                        return (
                          <SubDetailRow
                            key={`${detail.field}-${di}`}
                            detail={detail}
                            maxScore={maxScore}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Operator info for function_score / rescore */}
                {(type === 'function_score' || type === 'rescore') && step.operator && (
                  <div className="pl-6 mt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-white/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800/60">
                      연산: <span className="font-bold">{step.operator}</span>{' '}
                      {step.operator_value != null && <span>{fmt(step.operator_value)}</span>}
                    </span>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
