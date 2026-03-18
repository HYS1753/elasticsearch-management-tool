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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Hash, Sigma, FileText } from 'lucide-react';
import { ExplainTreeNode } from '@/components/query-explain/explain-tree-node';
import { QueryExplainScoreFlow } from '@/components/query-explain/query-explain-score-flow';
import { QueryExplainTermImpact } from '@/components/query-explain/query-explain-term-impact';
import { QueryExplainRescoreSummary } from '@/components/query-explain/query-explain-rescore-summary';
import { QueryExplainFieldImpact } from '@/components/query-explain/query-explain-field-impact';
import { QueryExplainFilterSummary } from '@/components/query-explain/query-explain-filter-summary';
import { QueryExplainScoringFunctions } from '@/components/query-explain/query-explain-scoring-functions';

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
  const scoreSteps = data
    ? [
        {
          label: 'Original Query',
          value: data.query_section.score,
          tone: 'query' as const,
          description: '검색어 매칭으로 얻은 원본 점수',
        },
        ...data.rescore_sections.map((section, idx) => ({
          label: `Rescore ${idx + 1}`,
          value: section.score,
          tone: 'rescore' as const,
          description: section.title,
        })),
        {
          label: 'Total Score',
          value: data.total_score,
          tone: 'total' as const,
          description: '최종 결과 점수',
        },
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] !max-w-[95vw] xl:!max-w-[1500px] p-0 overflow-hidden">
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
              {/* Top meta */}
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="border-slate-200/70 shadow-sm">
                  <CardContent className="flex items-start gap-3 p-5">
                    <div className="rounded-lg bg-slate-100 p-2">
                      <Hash className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        DOC ID
                      </div>
                      <div className="mt-1 break-all font-mono text-sm text-slate-900">
                        {data.id}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/70 shadow-sm">
                  <CardContent className="flex items-start gap-3 p-5">
                    <div className="rounded-lg bg-blue-50 p-2">
                      <Sigma className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Total Score
                      </div>
                      <div className="mt-1 font-mono text-2xl font-semibold text-slate-900">
                        {data.total_score?.toFixed(4) ?? 'N/A'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/70 shadow-sm">
                  <CardContent className="flex items-start gap-3 p-5">
                    <div className="rounded-lg bg-emerald-50 p-2">
                      <FileText className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Title
                      </div>
                      <div className="mt-1 break-words text-sm text-slate-900">
                        {data.doc_title || data.id}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Score flow */}
              <Card className="border-slate-200/70 shadow-sm">
                <CardHeader className="border-b bg-slate-50/70">
                  <CardTitle className="text-base">점수 계산 흐름</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <QueryExplainScoreFlow steps={scoreSteps} />
                </CardContent>
              </Card>

              {/* Why matched */}
              {/* <Card className="border-slate-200/70 shadow-sm">
                <CardHeader className="border-b bg-slate-50/70">
                  <CardTitle className="text-base">왜 이 문서가 점수를 받았나</CardTitle>
                  <div className="text-sm text-slate-500">
                    어떤 필드의 어떤 단어가 점수에 영향을 줬는지 보여줍니다.
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <QueryExplainTermImpact items={data.term_factors} />
                </CardContent>
              </Card> */}

              <Card className="border-slate-200/70 shadow-sm">
                <CardHeader className="border-b bg-slate-50/70">
                    <CardTitle className="text-base">필드별 점수 기여</CardTitle>
                    <div className="text-sm text-slate-500">
                    어떤 필드의 실제 source 값에서 어떤 토큰이 매칭되어 점수를 받았는지 보여줍니다.
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <QueryExplainFieldImpact items={data.field_impacts} />
                </CardContent>
                </Card>

                <Card className="border-slate-200/70 shadow-sm">
                <CardHeader className="border-b bg-slate-50/70">
                    <CardTitle className="text-base">필터 조건</CardTitle>
                    <div className="text-sm text-slate-500">
                    점수는 없지만 결과 포함 여부에 영향을 준 조건입니다.
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <QueryExplainFilterSummary items={data.filter_matches} />
                </CardContent>
                </Card>

                <Card className="border-slate-200/70 shadow-sm">
                <CardHeader className="border-b bg-slate-50/70">
                    <CardTitle className="text-base">추가 점수 계산</CardTitle>
                    <div className="text-sm text-slate-500">
                    function_score, field_value_factor 등으로 추가된 점수입니다.
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <QueryExplainScoringFunctions items={data.scoring_functions} />
                </CardContent>
                </Card>

              {/* Rescore summary */}
              <Card className="border-slate-200/70 shadow-sm">
                <CardHeader className="border-b bg-slate-50/70">
                  <CardTitle className="text-base">추가 점수 반영 요약</CardTitle>
                  <div className="text-sm text-slate-500">
                    query 이후 어떤 rescore 단계가 적용되었는지 요약합니다.
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <QueryExplainRescoreSummary sections={data.rescore_sections} />
                </CardContent>
              </Card>

              {/* Technical query explain */}
              <details className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-slate-900">
                  Technical Query Explain
                </summary>
                <div className="border-t p-4">
                  <div className="mb-4 font-mono text-sm text-slate-600">
                    score: {data.query_section.score?.toFixed(4) ?? 'N/A'}
                  </div>
                  {data.query_section.items.length > 0 ? (
                    <div className="space-y-3">
                      {data.query_section.items.map((item, idx) => (
                        <ExplainTreeNode key={`${item.key}-${idx}`} node={item} depth={0} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">Query explain 정보가 없습니다.</div>
                  )}
                </div>
              </details>

              {/* Technical rescore explain */}
              {data.rescore_sections.length > 0 && (
                <details className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-slate-900">
                    Technical Rescore Explain
                  </summary>
                  <div className="space-y-4 border-t p-4">
                    {data.rescore_sections.map((section, idx) => (
                      <div
                        key={`${section.title}-${idx}`}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                      >
                        <div className="flex items-center justify-between gap-4 border-b bg-slate-50 px-4 py-3">
                          <h4 className="font-semibold text-slate-900">{section.title}</h4>
                          <span className="rounded-md bg-white px-3 py-1 font-mono text-sm text-slate-700 border">
                            {section.score?.toFixed(4) ?? 'N/A'}
                          </span>
                        </div>

                        <div className="space-y-3 p-4">
                          {section.items.map((item, nodeIdx) => (
                            <ExplainTreeNode key={`${item.key}-${nodeIdx}`} node={item} depth={0} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Source */}
              {data.source && (
                <details className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-slate-900">
                    Source
                  </summary>
                  <div className="border-t p-4">
                    <pre className="overflow-x-auto rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                      {JSON.stringify(data.source, null, 2)}
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