'use client';

import type {
  ExplainFieldScoreGroup,
  ExplainFilter,
  ExplainFunctionScore,
  ExplainQueryDetail,
} from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  query: ExplainQueryDetail;
}

function renderSourceValue(value: unknown) {
  if (value === null || value === undefined) {
    return 'source 없음';
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
}

function formatNumber(value?: number | null) {
  return typeof value === 'number' ? value.toFixed(4) : 'N/A';
}

function renderParams(params?: Record<string, unknown> | null) {
  if (!params) return null;
  return JSON.stringify(params);
}

function FilterList({ items }: { items: ExplainFilter[] }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500">
        필터 조건이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item, idx) => (
        <div key={`${item.label}-${idx}`} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium text-slate-900">{item.label}</div>
            <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              matched
            </span>
          </div>

          {item.source_value !== undefined && item.source_value !== null && (
            <div className="mt-2 text-sm text-slate-600">
              source: <span className="font-mono">{renderSourceValue(item.source_value)}</span>
            </div>
          )}

          {item.description && (
            <div className="mt-2 text-xs text-slate-500">{item.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function FieldGroups({ items }: { items: ExplainFieldScoreGroup[] }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500">
        BM25 매칭 정보가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((group, idx) => (
        <div
          key={`${group.field}-${idx}`}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="grid gap-3 md:grid-cols-[minmax(0,9fr)_minmax(110px,1fr)] md:items-stretch">
            <div className="min-w-0">
              <div className="text-lg font-bold tracking-tight text-slate-900">
                {group.field}
              </div>

              <div className="mt-3 rounded-xl bg-slate-50 px-3 py-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Source Text
                </div>
                <div
                  className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-6 text-slate-900"
                  title={renderSourceValue(group.source_value)}
                >
                  {renderSourceValue(group.source_value)}
                </div>
              </div>
            </div>

            <div className="flex min-h-[92px] flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-center">
              <div className="text-[11px] font-medium uppercase tracking-wide text-blue-700">
                Total
              </div>
              <div className="mt-2 font-mono text-lg font-bold text-blue-700">
                {typeof group.total_score === 'number' ? group.total_score.toFixed(4) : 'N/A'}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Matched Tokens
            </div>

            <div className="space-y-2">
              {group.matched_tokens.map((token, tokenIdx) => (
                <div
                  key={`${group.field}-${token.token}-${tokenIdx}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2"
                >
                  <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800">
                    {token.token}
                  </span>

                  <div className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-slate-500">
                    {typeof token.boost === 'number' && <span>boost {token.boost.toFixed(2)}</span>}
                    {typeof token.idf === 'number' && (
                      <span>{typeof token.boost === 'number' ? ' | ' : ''}idf {token.idf.toFixed(2)}</span>
                    )}
                    {typeof token.tf === 'number' && (
                      <span>
                        {(typeof token.boost === 'number' || typeof token.idf === 'number') ? ' | ' : ''}
                        tf {token.tf.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <span className="shrink-0 font-mono text-sm font-semibold text-blue-700">
                    {typeof token.score === 'number' ? token.score.toFixed(4) : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FunctionScores({ items }: { items: ExplainFunctionScore[] }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500">
        query 내부 function score 정보가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={`${item.label}-${idx}`} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-medium text-slate-900">{item.label}</div>

                {item.matched === true && (
                  <span className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                    matched
                  </span>
                )}

                {item.matched === false && (
                  <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                    not matched
                  </span>
                )}
              </div>

              {item.filter_label && (
                <div className="mt-2 text-sm text-slate-700">
                  <span className="font-medium">조건</span>: {item.filter_label}
                </div>
              )}

              {item.field && (
                <div className="mt-1 text-sm text-slate-600">
                  <span className="font-medium">필드</span>: <span className="font-mono">{item.field}</span>
                </div>
              )}

              {item.operation && (
                <div className="mt-1 text-xs text-slate-500">
                  {item.operation}
                </div>
              )}

              {item.source_value !== undefined && item.source_value !== null && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Source Value
                  </div>
                  {renderSourceValue(item.source_value)}
                </div>
              )}

              {item.params && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span className="font-medium">params:</span> {renderParams(item.params)}
                </div>
              )}

              {item.description && (
                <div className="mt-3 text-xs leading-5 text-slate-500">
                  {item.description}
                </div>
              )}
            </div>

            <div className="shrink-0 rounded bg-blue-50 px-3 py-2 text-right">
              <div className="text-[10px] font-medium uppercase tracking-wide text-blue-600">
                Score
              </div>
              <div className="font-mono text-sm font-semibold text-blue-700">
                {formatNumber(item.score)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function QueryExplainQueryPanel({ query }: Props) {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader className="border-b bg-slate-50/70">
          <CardTitle className="text-base">Query Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Original Text Score
              </div>
              <div className="mt-2 font-mono text-2xl font-semibold text-slate-900">
                {formatNumber(query.original_score)}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                BM25 및 텍스트 relevance 기반 원점수
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Function Score Combined
              </div>
              <div className="mt-2 font-mono text-2xl font-semibold text-slate-900">
                {formatNumber(query.function_score_combined)}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                score_mode={query.function_score_mode ?? 'N/A'} / boost_mode={query.function_boost_mode ?? 'N/A'}
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-blue-700">
                Final Query Score
              </div>
              <div className="mt-2 font-mono text-2xl font-semibold text-blue-700">
                {formatNumber(query.final_query_score)}
              </div>
              <div className="mt-2 text-xs text-blue-600">
                query 단계 최종 점수
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader className="border-b bg-slate-50/70">
          <CardTitle className="text-base">필터 조건</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <FilterList items={query.filters} />
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader className="border-b bg-slate-50/70">
          <CardTitle className="text-base">BM25 점수 기여</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <FieldGroups items={query.bm25_groups} />
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader className="border-b bg-slate-50/70">
          <CardTitle className="text-base">Query 내부 추가 점수</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <FunctionScores items={query.function_scores} />
        </CardContent>
      </Card>
    </div>
  );
}