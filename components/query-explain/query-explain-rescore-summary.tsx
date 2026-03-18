'use client';

import type { QueryExplainSection } from '@/types';

interface Props {
  sections: QueryExplainSection[];
}

function summarizeTitle(title: string) {
  if (title.toLowerCase().includes('normalizer')) {
    return '검색 결과를 정규화해서 점수를 재계산했습니다.';
  }
  if (title.toLowerCase().includes('function score')) {
    return '추가 함수 점수를 반영했습니다.';
  }
  return '추가 점수 계산 단계입니다.';
}

export function QueryExplainRescoreSummary({ sections }: Props) {
  if (!sections.length) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500">
        rescore 단계가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sections.map((section, idx) => (
        <div key={`${section.title}-${idx}`} className="rounded-xl border p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Rescore {idx + 1}
          </div>
          <div className="mt-2 text-base font-semibold text-slate-900">
            {section.title}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            {summarizeTitle(section.title)}
          </div>
          <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 font-mono text-lg font-semibold text-slate-900">
            {section.score?.toFixed(4) ?? 'N/A'}
          </div>
        </div>
      ))}
    </div>
  );
}