'use client';

interface ScoreStep {
  label: string;
  value?: number | null;
  tone?: 'default' | 'query' | 'rescore' | 'total';
  description?: string;
}

interface Props {
  steps: ScoreStep[];
}

function toneClass(tone: ScoreStep['tone']) {
  switch (tone) {
    case 'query':
      return 'border-slate-200 bg-white';
    case 'rescore':
      return 'border-blue-200 bg-blue-50/70';
    case 'total':
      return 'border-emerald-200 bg-emerald-50/80';
    default:
      return 'border-slate-200 bg-white';
  }
}

export function QueryExplainScoreFlow({ steps }: Props) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-center gap-3">
        {steps.map((step, idx) => (
          <div key={`${step.label}-${idx}`} className="flex items-center gap-3">
            <div className={`min-w-[180px] rounded-xl border p-4 ${toneClass(step.tone)}`}>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {step.label}
              </div>
              <div className="mt-2 font-mono text-2xl font-semibold text-slate-900">
                {step.value?.toFixed(4) ?? 'N/A'}
              </div>
              {step.description && (
                <div className="mt-2 text-xs text-slate-500">
                  {step.description}
                </div>
              )}
            </div>

            {idx < steps.length - 1 && (
              <div className="flex h-full items-center text-slate-300 text-2xl font-light">
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}