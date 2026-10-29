'use client';

import * as React from 'react';
import type {
  ExplainFieldScoreGroup,
  ExplainFilter,
  ExplainFunctionScore,
  ExplainQueryDetail,
  QueryStructureNode,
} from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronRight,
  Sigma,
  Sparkles,
  FileText,
  Cpu,
  Lock,
  Scale,
  HelpCircle,
  TrendingUp,
  Info,
} from 'lucide-react';

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
      <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500 dark:text-slate-400">
        필터 조건이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item, idx) => (
        <div key={`${item.label}-${idx}`} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium text-slate-900 dark:text-slate-50">{item.label}</div>
            <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              matched
            </span>
          </div>

          {item.source_value !== undefined && item.source_value !== null && (
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              source: <span className="font-mono">{renderSourceValue(item.source_value)}</span>
            </div>
          )}

          {item.description && (
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function FieldGroups({ items }: { items: ExplainFieldScoreGroup[] }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500 dark:text-slate-400">
        BM25 매칭 정보가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((group, idx) => (
        <div
          key={`${group.field}-${idx}`}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm"
        >
          <div className="grid gap-3 md:grid-cols-[minmax(0,9fr)_minmax(110px,1fr)] md:items-stretch">
            <div className="min-w-0">
              <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {group.field}
              </div>

              <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-900 px-3 py-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Source Text
                </div>
                <div
                  className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-6 text-slate-900 dark:text-slate-50"
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
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Matched Tokens
            </div>

            <div className="space-y-2">
              {group.matched_tokens.map((token, tokenIdx) => (
                <div
                  key={`${group.field}-${token.token}-${tokenIdx}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2"
                >
                  <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800 dark:text-slate-200">
                    {token.token}
                  </span>

                  <div className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-slate-500 dark:text-slate-400">
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
      <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500 dark:text-slate-400">
        query 내부 function score 정보가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={`${item.label}-${idx}`} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-medium text-slate-900 dark:text-slate-50">{item.label}</div>

                {item.matched === true && (
                  <span className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                    matched
                  </span>
                )}

                {item.matched === false && (
                  <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    not matched
                  </span>
                )}
              </div>

              {item.filter_label && (
                <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">조건</span>: {item.filter_label}
                </div>
              )}

              {item.field && (
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium">필드</span>: <span className="font-mono">{item.field}</span>
                </div>
              )}

              {item.operation && (
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {item.operation}
                </div>
              )}

              {item.source_value !== undefined && item.source_value !== null && (
                <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-900 p-3 text-sm text-slate-700 dark:text-slate-300">
                  <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Source Value
                  </div>
                  {renderSourceValue(item.source_value)}
                </div>
              )}

              {item.params && (
                <div className="mt-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-medium">params:</span> {renderParams(item.params)}
                </div>
              )}

              {item.description && (
                <div className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
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

function getNodeConfig(type: string) {
  switch (type) {
    case 'sum_of':
      return {
        label: 'Boolean Sum (합산)',
        badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-850',
        icon: Sigma,
      };
    case 'max_of':
      return {
        label: 'Disjunction Max (최댓값 병합)',
        badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-850',
        icon: TrendingUp,
      };
    case 'knn':
      return {
        label: 'KNN Vector Search',
        badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-850',
        icon: Sparkles,
      };
    case 'bm25':
      return {
        label: 'BM25 Text Match',
        badgeClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-850',
        icon: FileText,
      };
    case 'function_score':
      return {
        label: 'Function Score (연산)',
        badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-850',
        icon: Cpu,
      };
    case 'constant_score':
      return {
        label: 'Constant Score (고정)',
        badgeClass: 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border-slate-200 dark:border-slate-800',
        icon: Lock,
      };
    case 'weight':
      return {
        label: 'Weight (가중치)',
        badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-850',
        icon: Scale,
      };
    default:
      return {
        label: 'Score Node (일반)',
        badgeClass: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
        icon: HelpCircle,
      };
  }
}

function QueryScoreStructureTreeNode({
  node,
  depth,
  isMaxContributor = false,
  parentTieBreaker = null,
  parentType = null,
}: {
  node: QueryStructureNode;
  depth: number;
  isMaxContributor?: boolean;
  parentTieBreaker?: number | null;
  parentType?: string | null;
}) {
  const [expanded, setExpanded] = React.useState(true);
  const hasChildren = node.details && node.details.length > 0;

  const { label, badgeClass, icon: Icon } = getNodeConfig(node.type);

  // If node type is max_of, calculate which child has the maximum value
  let maxChildIdx = -1;
  if (node.type === 'max_of' && node.details && node.details.length > 0) {
    let maxVal = -Infinity;
    for (let i = 0; i < node.details.length; i++) {
      if (node.details[i].value > maxVal) {
        maxVal = node.details[i].value;
        maxChildIdx = i;
      }
    }
  }

  // Calculate contribution details
  let contributionText = '';
  let showContributionBadge = false;
  let contributionBadgeText = '';
  let contributionBadgeClass = '';

  if (parentType === 'max_of') {
    if (isMaxContributor) {
      showContributionBadge = true;
      contributionBadgeText = 'MAX (100% 반영)';
      contributionBadgeClass = 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500';
      contributionText = `점수: ${node.value.toFixed(4)} (최댓값으로 전체 반영)`;
    } else {
      const tb = parentTieBreaker ?? 0;
      const scaledVal = node.value * tb;
      showContributionBadge = true;
      if (tb === 0) {
        contributionBadgeText = '무시됨 (0%)';
        contributionBadgeClass = 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        contributionText = `점수: ${node.value.toFixed(4)} * 0.0 (tie_breaker) = 0.0000`;
      } else {
        contributionBadgeText = `나머지 (${(tb * 100).toFixed(0)}% 반영)`;
        contributionBadgeClass = 'bg-amber-600 border-amber-600 text-white dark:bg-amber-500 dark:border-amber-500';
        contributionText = `점수: ${node.value.toFixed(4)} * ${tb} = ${scaledVal.toFixed(4)} (tie_breaker 배율 적용)`;
      }
    }
  } else if (parentType === 'sum_of') {
    contributionText = `점수: ${node.value.toFixed(4)} (합산)`;
  } else {
    contributionText = `점수: ${node.value.toFixed(4)}`;
  }

  return (
    <div className="flex flex-col">
      {/* Node Content */}
      <div 
        className={cn(
          "group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-200 hover:shadow-md",
          isMaxContributor 
            ? "border-blue-300 bg-blue-50/40 dark:border-blue-800 dark:bg-blue-950/20 shadow-sm shadow-blue-100 dark:shadow-none" 
            : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/40"
        )}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Collapse/Expand Toggle or Indenter */}
          {hasChildren ? (
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="mt-1 shrink-0 p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <div className="h-5 w-5 shrink-0" />
          )}

          {/* Icon & Details */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", badgeClass)}>
                {label}
              </span>
              
              {showContributionBadge && (
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", contributionBadgeClass)}>
                  {contributionBadgeText}
                </span>
              )}
            </div>

            {/* Field, Term & Description */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-700 dark:text-slate-300">
              {node.field && (
                <span>
                  필드: <span className="font-semibold text-slate-950 dark:text-slate-50 font-mono">{node.field}</span>
                </span>
              )}
              {node.field && node.term && (
                <span className="text-slate-300 dark:text-slate-700">|</span>
              )}
              {node.term && (
                <span>
                  검색어: <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">&quot;{node.term}&quot;</span>
                </span>
              )}
              {node.tie_breaker !== undefined && node.tie_breaker !== null && (
                <span className="text-xs bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900 font-medium">
                  tie_breaker: {node.tie_breaker}
                </span>
              )}
            </div>

            {/* Raw Description (collapsible/hover) */}
            <p className="text-xs text-slate-400 dark:text-slate-500 break-words line-clamp-1 group-hover:line-clamp-none transition-all duration-200">
              {node.description}
            </p>
          </div>
        </div>

        {/* Score & Calculation Details */}
        <div className="flex flex-col items-end shrink-0 justify-center text-right md:border-l md:border-slate-100 dark:md:border-slate-800 md:pl-4 min-w-[150px]">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
            Score
          </div>
          <div className={cn(
            "font-mono text-lg font-bold leading-tight",
            isMaxContributor ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-slate-100"
          )}>
            {node.value.toFixed(4)}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 whitespace-nowrap">
            {contributionText}
          </div>
        </div>
      </div>

      {/* Children Nodes */}
      {hasChildren && expanded && (
        <div className="relative pl-6 ml-3 border-l border-slate-200 dark:border-slate-800 space-y-3 mt-3">
          {node.details.map((child, idx) => (
            <QueryScoreStructureTreeNode
              key={`${child.type}-${idx}`}
              node={child}
              depth={depth + 1}
              isMaxContributor={node.type === 'max_of' && idx === maxChildIdx}
              parentTieBreaker={node.tie_breaker}
              parentType={node.type}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QueryScoreStructureTree({ node }: { node: QueryStructureNode }) {
  return (
    <div className="space-y-4">
      {/* Legend & Help Banner */}
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
          <Info className="h-4 w-4 text-blue-500" />
          점수 계산 트리 가이드
        </div>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Disjunction Max (최댓값 병합)</strong>: 각 필드 쿼리 중 가장 높은 점수 하나(100% 반영)와 나머지 필드들의 점수에 <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">tie_breaker</code> 가중치를 곱해 합산합니다.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Boolean Sum (합산)</strong>: 매칭된 하위 쿼리들의 모든 점수를 단순 더하여 합산합니다.
          </li>
        </ul>
      </div>

      <div className="p-1">
        <QueryScoreStructureTreeNode node={node} depth={0} />
      </div>
    </div>
  );
}

export function QueryExplainQueryPanel({ query }: Props) {
  return (
    <div className="space-y-6">
      {/* 1. Score Calculation Tree */}
      <Card className="border-slate-200/70 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-slate-50/70 dark:bg-slate-900/70 flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle className="text-base font-semibold">점수 연산 구조 (Score Calculation Tree)</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">쿼리 논리 결합 및 점수 합산 구조</p>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {query.query_structure ? (
            <QueryScoreStructureTree node={query.query_structure} />
          ) : (
            <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500 dark:text-slate-400">
              점수 연산 트리 정보가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Detailed Relevance Breakdown Tabs */}
      <Card className="border-slate-200/70 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Tabs defaultValue="bm25" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-slate-50/80 dark:bg-slate-900/70 p-0 h-12">
              <TabsTrigger
                value="bm25"
                className="rounded-none border-b-2 border-transparent px-5 py-3 text-xs font-semibold data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 dark:data-[state=active]:border-blue-400 h-full"
              >
                BM25 매칭 ({query.bm25_groups?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="filters"
                className="rounded-none border-b-2 border-transparent px-5 py-3 text-xs font-semibold data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 dark:data-[state=active]:border-blue-400 h-full"
              >
                필터 조건 ({query.filters?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="functions"
                className="rounded-none border-b-2 border-transparent px-5 py-3 text-xs font-semibold data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 dark:data-[state=active]:border-blue-400 h-full"
              >
                추가 점수 함수 ({query.function_scores?.length || 0})
              </TabsTrigger>
            </TabsList>

            <div className="p-5">
              <TabsContent value="bm25" className="mt-0 outline-none">
                <FieldGroups items={query.bm25_groups || []} />
              </TabsContent>
              <TabsContent value="filters" className="mt-0 outline-none">
                <FilterList items={query.filters || []} />
              </TabsContent>
              <TabsContent value="functions" className="mt-0 outline-none">
                <FunctionScores items={query.function_scores || []} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}