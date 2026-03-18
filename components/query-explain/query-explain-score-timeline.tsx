'use client';

import type { QueryExplainScoreTimelineStep } from '@/types';

interface Props {
  steps: QueryExplainScoreTimelineStep[];
}

function getStepTone(step: QueryExplainScoreTimelineStep) {
  if (step.key === 'query') {
    return 'border-slate-200 bg-white';
  }

  if (step.key === 'total') {
    return 'border-emerald-200 bg-emerald-50';
  }

  return 'border-blue-200 bg-blue-50';
}

export function QueryExplainScoreTimeline({ steps }: Props) {
  if (!steps.length) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500">
        점수 타임라인 정보가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-stretch gap-3">
        {steps.map((step, idx) => (
          <div key={`${step.key}-${idx}`} className="flex items-center gap-3">
            <div className={`min-w-[220px] rounded-2xl border p-4 shadow-sm ${getStepTone(step)}`}>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {step.label}
              </div>

              <div className="mt-2 font-mono text-2xl font-semibold text-slate-900">
                {typeof step.value === 'number' ? step.value.toFixed(4) : 'N/A'}
              </div>

              {step.description && (
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  {step.description}
                </div>
              )}
            </div>

            {idx < steps.length - 1 && (
              <div className="text-2xl text-slate-300">→</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}