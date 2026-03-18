'use client';

import type { QueryExplainSummaryHit, QueryExplainSummaryResponse } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSearch, RefreshCw } from 'lucide-react';

interface Props {
  loading: boolean;
  summary: QueryExplainSummaryResponse | null;
  onSelectHit: (hit: QueryExplainSummaryHit) => void;
  height?: number | null;
}

export function QueryExplainSummaryList({ loading, summary, onSelectHit, height }: Props) {
  return (
    <Card
        className="border-slate-200/60 shadow-sm flex flex-col overflow-hidden"
        style={height ? { height: `${height}px` } : undefined}
    >
      <CardHeader className="shrink-0">
        <CardTitle>Explain Summary Result</CardTitle>
        <CardDescription>
          검색 결과 문서별 점수 요약입니다
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 min-h-0 flex-col">
        {loading ? (
          <div className="flex h-full items-center justify-center text-slate-500">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            explain summary 조회 중...
          </div>
        ) : !summary || summary.hits.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-500">
            <FileSearch className="mb-3 h-10 w-10 text-slate-300" />
            <p>조회된 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 flex-col gap-3">
            <div className="shrink-0 rounded-lg border bg-slate-50 p-3 text-sm text-slate-600">
              took: {summary.took}ms · total hits: {summary.total_hits ?? 0}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
              {summary.hits.map((hit) => (
                <button
                  key={`${hit.index}-${hit.id}`}
                  onClick={() => onSelectHit(hit)}
                  className="w-full rounded-lg border bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded bg-slate-100 px-2 py-1">{hit.id}</span>
                        <span className="rounded bg-slate-100 px-2 py-1">{hit.index}</span>
                      </div>

                      <div className="text-base font-semibold text-slate-900 break-words">
                        {hit.doc_title || hit.id}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <span className="font-mono text-slate-900">
                          total: {hit.total_score?.toFixed(4) ?? 'N/A'}
                        </span>
                        <span className="font-mono">
                          query: {hit.query_score?.toFixed(4) ?? 'N/A'}
                        </span>
                        {hit.rescore_steps.length > 0 && (
                          <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">
                            rescore {hit.rescore_steps.length}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 break-words font-mono text-sm text-slate-500">
                        {hit.formula}
                      </div>
                    </div>

                    <div className="shrink-0 text-xs text-slate-400">
                      상세 보기
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}