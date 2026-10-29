'use client';

import * as React from 'react';
import type { QueryStructureNode } from '@/types';
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
  Calculator,
} from 'lucide-react';

interface Props {
  node?: QueryStructureNode | null;
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
    case 'min_of':
      return {
        label: 'Minimum of (최솟값 병합)',
        badgeClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-850',
        icon: ChevronDown,
      };
    case 'mean_of':
      return {
        label: 'Mean/Average of (평균값 병합)',
        badgeClass: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-850',
        icon: Sigma,
      };
    case 'product_of':
      return {
        label: 'Product of (곱셈 병합)',
        badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-850',
        icon: Calculator,
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
  } else if (parentType === 'product_of') {
    contributionText = `점수: ${node.value.toFixed(4)} (곱산)`;
  } else if (parentType === 'min_of') {
    contributionText = `점수: ${node.value.toFixed(4)} (최솟값 병합)`;
  } else if (parentType === 'mean_of') {
    contributionText = `점수: ${node.value.toFixed(4)} (평균값 병합)`;
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

export function QueryExplainTreePanel({ node }: Props) {
  if (!node) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500 dark:text-slate-400 text-center">
        점수 연산 트리 정보가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-full">
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
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Product (곱셈 병합)</strong>: 매칭된 하위 쿼리들의 모든 점수를 곱하여 합산합니다.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Min (최솟값 병합)</strong>: 매칭된 하위 쿼리들의 점수 중 최솟값만을 취합니다.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Mean/Average (평균값 병합)</strong>: 매칭된 하위 쿼리들의 점수의 평균을 취합니다.
          </li>
        </ul>
      </div>

      <div className="p-1">
        <QueryScoreStructureTreeNode node={node} depth={0} />
      </div>
    </div>
  );
}
