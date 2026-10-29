'use client';

import * as React from 'react';
import type { ExplainFunctionScore } from '@/types';
import { cn } from '@/lib/utils';
import { Award, ChevronDown, ChevronUp, Cpu, Info } from 'lucide-react';

interface Props {
  functionScores?: ExplainFunctionScore[];
  scoreMode?: string | null;
  boostMode?: string | null;
  combinedScore?: number | null;
  defaultExpanded?: boolean;
  stepNum?: number;
}

function formatNumber(value?: number | null) {
  return typeof value === 'number' ? value.toFixed(4) : '0.0000';
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

export function QueryExplainFunctionScoreStep({
  functionScores = [],
  scoreMode = 'multiply',
  boostMode = 'multiply',
  combinedScore = 0,
  defaultExpanded = false,
  stepNum,
}: Props) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const hasFunctionScores = functionScores && functionScores.length > 0;
  const combinedVal = combinedScore || 0;
  const hasScoreDiff = combinedVal !== 0;

  if (!hasFunctionScores && !hasScoreDiff) {
    return null; // Don't show step if there are no function scores and no boost
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
      {/* Header (Accordion Toggle) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 text-left outline-none hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-900 text-slate-500 px-2 py-0.5 rounded-md">
                {stepNum != null ? `Step ${stepNum}` : 'Func'}
              </span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                수식/부스트 점수 반영 (Function Scores)
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              필드 값(인기도, 조회수, 등록시간 등)에 따른 감쇠 함수, 스크립트 점수 등 복잡한 수식 연산 가중치입니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center font-mono">
          <div className="text-right">
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
              배율/점수: {formatNumber(combinedVal)}
            </span>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
              함수 수 {functionScores.length}개 작동
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
          {/* Metadata banner */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex gap-2">
            <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <strong>수식 결합 모드 (Function Score Modes)</strong>
              <ul className="list-disc list-inside mt-1.5 space-y-0.5">
                <li>하위 함수 점수 간 결합 (score_mode): <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono font-bold text-amber-700 dark:text-amber-400">{scoreMode || 'multiply'}</code></li>
                <li>기본 쿼리 점수와 수식 점수 결합 (boost_mode): <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono font-bold text-amber-700 dark:text-amber-400">{boostMode || 'multiply'}</code></li>
              </ul>
            </div>
          </div>

          {/* Functions list */}
          {!hasFunctionScores ? (
            <div className="rounded-xl border border-dashed border-amber-200 dark:border-amber-900/30 bg-amber-50/5 dark:bg-amber-950/5 p-4 text-xs text-slate-500 dark:text-slate-400">
              개별 함수 조건이 없습니다. 단일 부스트 가중치가 전체 스코어에 반영되었습니다.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {functionScores.map((fs, index) => {
                const matched = fs.matched !== false; // default true if undefined
                return (
                  <div
                    key={`${fs.label}-${index}`}
                    className={cn(
                      "rounded-xl border p-4 space-y-3 transition-all duration-200 hover:shadow-xs",
                      matched
                        ? "border-amber-200/80 dark:border-amber-900/30 bg-amber-50/5 dark:bg-amber-950/5"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10"
                    )}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Cpu className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
                          {fs.label}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-sm font-bold text-amber-700 dark:text-amber-400">
                          {formatNumber(fs.score)}
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-sans">
                          {matched ? 'Matched' : 'Not Matched'}
                        </div>
                      </div>
                    </div>

                    {fs.filter_label && (
                      <div className="text-xs text-slate-700 dark:text-slate-300">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono mr-1.5">적용 조건:</span>
                        <span className="font-mono bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-slate-800 text-[11px] font-semibold">{fs.filter_label}</span>
                      </div>
                    )}

                    {fs.field && (
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono mr-1.5">대상 필드:</span>
                        <span className="font-mono">{fs.field}</span>
                      </div>
                    )}

                    {fs.source_value !== undefined && fs.source_value !== null && (
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider font-semibold">
                          문서 내 대상 필드 값 (Document Value)
                        </span>
                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate">
                          {renderSourceValue(fs.source_value)}
                        </div>
                      </div>
                    )}

                    {fs.description && (
                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-900 pt-2">
                        {fs.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
