'use client';

import * as React from 'react';
import type { ExplainQueryDetail, ExplainRescoreDetail, QueryExplainScoreTimelineStep } from '@/types';
import { QueryExplainScoreStory } from './query-explain-score-story';
import { QueryExplainDiagnosticSummary } from './query-explain-diagnostic-summary';
import { QueryExplainFilterStep } from './query-explain-filter-step';
import { QueryExplainBaseMatchStep } from './query-explain-base-match-step';
import { QueryExplainFunctionScoreStep } from './query-explain-function-score-step';
import { QueryExplainRescoreStep } from './query-explain-rescore-step';

interface Props {
  query: ExplainQueryDetail;
  rescores: ExplainRescoreDetail[];
  totalScore?: number | null;
  scoreTimeline?: QueryExplainScoreTimelineStep[];
}

export function QueryExplainDiagnosis({ query, rescores, totalScore, scoreTimeline }: Props) {
  const hasUnmatchedFilters = React.useMemo(() => {
    return (query.filters || []).some(f => !f.matched);
  }, [query.filters]);

  // Compute step numbering: filter step only counts when shown
  let stepNum = 0;
  const filterStepNum = hasUnmatchedFilters ? ++stepNum : null;
  const baseMatchStepNum = ++stepNum;
  const hasFunctionScore =
    query.function_score_combined != null &&
    Math.abs(query.function_score_combined - 1.0) > 0.0001;
  const functionStepNum = hasFunctionScore ? ++stepNum : null;
  const rescoreStepNum = (rescores?.length ?? 0) > 0 ? ++stepNum : null;

  return (
    <div className="space-y-6">
      {/* Score Story – natural language narrative */}
      <QueryExplainScoreStory
        scoreTimeline={scoreTimeline ?? []}
        query={query}
        rescores={rescores}
      />

      {/* Score Transformation Timeline + Breakdown Table */}
      <QueryExplainDiagnosticSummary
        query={query}
        rescores={rescores}
        totalScore={totalScore}
        scoreTimeline={scoreTimeline}
      />

      {/* Section Divider */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-900">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono mb-4">
          단계별 상세 진단 (Detailed Diagnostic Steps)
        </h3>
      </div>

      <div className="space-y-4">
        {/* Filter Check — only shown when a filter FAILS (all-pass is trivially expected) */}
        {hasUnmatchedFilters && (
          <QueryExplainFilterStep
            filters={query.filters}
            stepNum={filterStepNum ?? 1}
            defaultExpanded={true}
          />
        )}

        {/* Base Match: always shown, auto-expanded when filters all pass */}
        <QueryExplainBaseMatchStep
          bm25Groups={query.bm25_groups}
          originalScore={query.original_score}
          finalQueryScore={query.final_query_score}
          defaultExpanded={!hasUnmatchedFilters}
          queryStructure={query.query_structure}
          stepNum={baseMatchStepNum}
        />

        {/* Function Score: only when function_score_combined meaningfully differs from 1.0 */}
        {hasFunctionScore && (
          <QueryExplainFunctionScoreStep
            functionScores={query.function_scores}
            scoreMode={query.function_score_mode}
            boostMode={query.function_boost_mode}
            combinedScore={query.function_score_combined}
            defaultExpanded={false}
            stepNum={functionStepNum ?? stepNum}
          />
        )}

        {/* Rescore: only when rescore steps exist */}
        {(rescores?.length ?? 0) > 0 && (
          <QueryExplainRescoreStep
            rescores={rescores}
            queryScore={query.final_query_score || 0}
            defaultExpanded={false}
            stepNum={rescoreStepNum ?? stepNum}
          />
        )}
      </div>
    </div>
  );
}
