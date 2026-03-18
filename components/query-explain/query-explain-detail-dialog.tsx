'use client';

import type { QueryExplainSummaryHit, QueryExplainDetailResponse } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Hash, Sigma, FileText } from 'lucide-react';
import { QueryExplainScoreTimeline } from '@/components/query-explain/query-explain-score-timeline';
import { QueryExplainQueryPanel } from '@/components/query-explain/query-explain-query-panel';
import { QueryExplainRescorePanel } from '@/components/query-explain/query-explain-rescore-panel';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  data: QueryExplainDetailResponse | null;
  selectedHit: QueryExplainSummaryHit | null;
}

export function QueryExplainDetailDialog({
  open,
  onOpenChange,
  loading,
  data,
  selectedHit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] !max-w-[95vw] xl:!max-w-[1500px] overflow-hidden p-0">
        <div className="border-b bg-white px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              Query Explain Detail
            </DialogTitle>
            <DialogDescription className="mt-1 break-words text-sm text-slate-600">
              {selectedHit?.doc_title || selectedHit?.id || '선택된 문서'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="h-[82vh]">
          {loading ? (
            <div className="flex h-[540px] items-center justify-center text-slate-500">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              explain detail 조회 중...
            </div>
          ) : !data ? (
            <div className="flex h-[540px] items-center justify-center text-slate-500">
              상세 데이터가 없습니다.
            </div>
          ) : (
            <div className="space-y-6 p-6">
              <div className="grid gap-4 lg:grid-cols-4">
                <Card className="border-slate-200/70 shadow-sm">
                    <CardContent className="p-5">
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        DOC ID
                    </div>
                    <div className="mt-2 break-all font-mono text-sm text-slate-900">
                        {data.id}
                    </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/70 shadow-sm">
                    <CardContent className="p-5">
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        TOTAL SCORE
                    </div>
                    <div className="mt-2 font-mono text-2xl font-semibold text-slate-900">
                        {typeof data.total_score === 'number' ? data.total_score.toFixed(4) : 'N/A'}
                    </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/70 shadow-sm">
                    <CardContent className="p-5">
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        FINAL QUERY SCORE
                    </div>
                    <div className="mt-2 font-mono text-2xl font-semibold text-blue-700">
                        {typeof data.query?.final_query_score === 'number'
                        ? data.query.final_query_score.toFixed(4)
                        : 'N/A'}
                    </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/70 shadow-sm">
                    <CardContent className="p-5">
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        TITLE
                    </div>
                    <div className="mt-2 break-words text-sm text-slate-900">
                        {data.doc_title || data.id}
                    </div>
                    </CardContent>
                </Card>
                </div>

              <Card className="border-slate-200/70 shadow-sm">
                <CardContent className="p-5">
                  <QueryExplainScoreTimeline steps={data.score_timeline} />
                </CardContent>
              </Card>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                <QueryExplainQueryPanel query={data.query} />
                <QueryExplainRescorePanel items={data.rescores} />
              </div>

              {data.source && (
                <details className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-slate-900">
                    Source
                  </summary>
                  <div className="border-t p-4">
                    <pre className="overflow-x-auto rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                      {JSON.stringify(data.source, null, 2)}
                    </pre>
                  </div>
                </details>
              )}

              {data.raw_explanation && (
                <details className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-slate-900">
                    Raw Explain
                  </summary>
                  <div className="border-t p-4">
                    <pre className="overflow-x-auto rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                      {JSON.stringify(data.raw_explanation, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}