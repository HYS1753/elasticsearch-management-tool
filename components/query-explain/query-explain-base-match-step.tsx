'use client';

import * as React from 'react';
import type { ExplainFieldScoreGroup, QueryStructureNode, ExplainMatchedToken } from '@/types';
import { cn } from '@/lib/utils';
import { FileText, ChevronDown, ChevronUp, AlertCircle, Sparkles, Terminal, Layers } from 'lucide-react';

interface Props {
  bm25Groups?: ExplainFieldScoreGroup[];
  /** BM25/KNN base score BEFORE function_score is applied (original_score) */
  originalScore?: number | null;
  /** Deprecated alias kept for compatibility — use originalScore */
  finalQueryScore?: number | null;
  defaultExpanded?: boolean;
  queryStructure?: QueryStructureNode | null;
  stepNum?: number;
}

// ──────────────────────────────────────────────────────────────────
// DisMax group analysis derived from query_structure
// ──────────────────────────────────────────────────────────────────

interface FieldEntry {
  field: string;
  term: string | null;
  rawScore: number;
  contribution: number;   // actual score contribution after tie_breaker
  isWinner: boolean;
  status: 'winner' | 'tie_breaker' | 'excluded';
}

interface DisMaxGroup {
  groupIndex: number;
  groupScore: number;
  tie_breaker: number;
  fields: FieldEntry[];
}

interface BaseMatchAnalysis {
  type: 'dismax_sum' | 'flat_sum' | 'knn' | 'single' | 'unknown';
  totalScore: number;
  disMaxGroups: DisMaxGroup[];
  flatFields: FieldEntry[];
}

/** Recursively skip function_score / constant_score wrappers */
function unwrap(node: QueryStructureNode): QueryStructureNode {
  if (
    (node.type === 'function_score' || node.type === 'constant_score') &&
    node.details.length > 0
  ) {
    return unwrap(node.details[0]);
  }
  return node;
}

/** Extract FieldEntry[] from a max_of node */
function extractDisMaxFields(node: QueryStructureNode): FieldEntry[] {
  const tie = node.tie_breaker ?? 0;
  const maxVal = node.details.length > 0 ? Math.max(...node.details.map(d => d.value)) : 0;

  return node.details.map(child => {
    const raw = child.value;
    const isWinner = raw === maxVal;
    const contribution = isWinner ? raw : raw * tie;
    const status: FieldEntry['status'] = isWinner
      ? 'winner'
      : tie > 0 ? 'tie_breaker' : 'excluded';
    return {
      field: child.field ?? child.description ?? '?',
      term: child.term ?? null,
      rawScore: raw,
      contribution,
      isWinner,
      status,
    };
  });
}

/** Full analysis of the query_structure tree */
function analyzeBaseMatchStructure(root: QueryStructureNode | null | undefined): BaseMatchAnalysis {
  const empty: BaseMatchAnalysis = { type: 'unknown', totalScore: 0, disMaxGroups: [], flatFields: [] };
  if (!root) return empty;

  const node = unwrap(root);

  // Single leaf
  if (node.type === 'knn' || node.type === 'bm25' || node.type === 'weight') {
    const entry: FieldEntry = {
      field: node.field ?? node.description ?? '?',
      term: node.term ?? null,
      rawScore: node.value,
      contribution: node.value,
      isWinner: true,
      status: 'winner',
    };
    return {
      type: node.type === 'knn' ? 'knn' : 'single',
      totalScore: node.value,
      disMaxGroups: [],
      flatFields: [entry],
    };
  }

  // max_of = single DisMax group
  if (node.type === 'max_of') {
    const group: DisMaxGroup = {
      groupIndex: 0,
      groupScore: node.value,
      tie_breaker: node.tie_breaker ?? 0,
      fields: extractDisMaxFields(node),
    };
    return { type: 'dismax_sum', totalScore: node.value, disMaxGroups: [group], flatFields: [] };
  }

  // sum_of = could be sum of max_of groups OR sum of leaves
  if (node.type === 'sum_of') {
    const disMaxGroups: DisMaxGroup[] = [];
    const flatFields: FieldEntry[] = [];

    node.details.forEach((child, idx) => {
      const c = unwrap(child);
      if (c.type === 'max_of') {
        disMaxGroups.push({
          groupIndex: idx,
          groupScore: c.value,
          tie_breaker: c.tie_breaker ?? 0,
          fields: extractDisMaxFields(c),
        });
      } else if (c.type === 'bm25' || c.type === 'knn' || c.type === 'weight') {
        flatFields.push({
          field: c.field ?? c.description ?? '?',
          term: c.term ?? null,
          rawScore: c.value,
          contribution: c.value,
          isWinner: true,
          status: 'winner',
        });
      }
    });

    if (disMaxGroups.length > 0) {
      return { type: 'dismax_sum', totalScore: node.value, disMaxGroups, flatFields };
    }
    return { type: 'flat_sum', totalScore: node.value, disMaxGroups: [], flatFields };
  }

  return { ...empty, totalScore: node.value };
}

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

function formatNum(v?: number | null) {
  return typeof v === 'number' ? v.toFixed(4) : '0.0000';
}

function renderSourceValue(value: unknown): string {
  if (value === null || value === undefined) return '데이터 없음';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function renderTokenScoreCard(token: ExplainMatchedToken, key: string) {
  const boost = token.boost ?? 1.0;
  const idf = token.idf ?? 0.0;
  const tf = token.tf ?? 0.0;
  const score = token.score ?? 0.0;

  // Check if we have any detailed BM25 parameters
  const hasDetailedParams = typeof token.freq === 'number' || typeof token.dl === 'number' || typeof token.n_val === 'number';

  return (
    <div
      key={key}
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 p-4 space-y-4 transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800"
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-xs break-all bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
          &quot;{token.token}&quot;
        </span>
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Score:</span>
          <span className="font-bold text-blue-700 dark:text-blue-400 text-xs">
            +{formatNum(score)}
          </span>
        </div>
      </div>

      {/* Formula visualizer */}
      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-3 shadow-2xs space-y-1.5">
        <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">점수 계산식 (BM25 Formula)</div>
        
        {/* Math expression */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-slate-300 py-1">
          <span className="font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-100/50 dark:border-amber-900/30 px-1.5 py-0.5 rounded" title="Boost Weight">
            {boost.toFixed(2)}
          </span>
          <span className="text-slate-400 font-sans">×</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-100/50 dark:border-blue-900/30 px-1.5 py-0.5 rounded" title="Inverse Document Frequency">
            {idf.toFixed(4)}
          </span>
          <span className="text-slate-400 font-sans">×</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/50 dark:border-emerald-900/30 px-1.5 py-0.5 rounded" title="Term Frequency">
            {tf.toFixed(4)}
          </span>
          <span className="text-slate-400 font-sans">=</span>
          <span className="font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 px-2 py-0.5 rounded">
            {formatNum(score)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[8px] text-slate-400 dark:text-slate-500 font-mono">
          <span>Boost</span>
          <span>×</span>
          <span className="underline decoration-blue-300 dark:decoration-blue-700" title="log(1 + (N - n + 0.5) / (n + 0.5))">IDF</span>
          <span>×</span>
          <span className="underline decoration-emerald-300 dark:decoration-emerald-700" title="freq / (freq + k1 * (1 - b + b * dl / avgdl))">TF</span>
          <span>=</span>
          <span>Score</span>
        </div>
      </div>

      {/* Detail Parameters Grid */}
      {hasDetailedParams && (
        <div className="grid grid-cols-2 gap-3 text-[10px] pt-1 font-mono leading-tight">
          {/* IDF Section */}
          <div className="space-y-1.5 border-r border-slate-200 dark:border-slate-800 pr-2">
            <div className="text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wide">IDF 변수 (n, N)</div>
            <div className="space-y-1 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center">
                <span title="n, number of documents containing term">n (매칭 문서 수):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {typeof token.n_val === 'number' ? token.n_val.toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span title="N, total number of documents with field">N (필드 총 문서 수):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {typeof token.N_val === 'number' ? token.N_val.toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* TF Section */}
          <div className="space-y-1.5 pl-1">
            <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide">TF 변수 (freq, dl)</div>
            <div className="space-y-1 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center">
                <span title="freq, occurrences of term within document">freq (문서 내 빈도):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {typeof token.freq === 'number' ? token.freq : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span title="dl, length of field">dl (필드 길이):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {typeof token.dl === 'number' ? token.dl : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center col-span-2">
                <span title="avgdl, average length of field">avgdl (평균 길이):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {typeof token.avgdl === 'number' ? token.avgdl.toFixed(2) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Parameters k1 and b if present */}
          {(typeof token.k1 === 'number' || typeof token.b === 'number') && (
            <div className="col-span-2 flex items-center gap-3 pt-1.5 border-t border-slate-100 dark:border-slate-900 text-[9px] text-slate-400 dark:text-slate-500">
              {typeof token.k1 === 'number' && (
                <span>k1 (포화도): <strong className="text-slate-600 dark:text-slate-400">{token.k1}</strong></span>
              )}
              {typeof token.b === 'number' && (
                <span>b (길이 정규화): <strong className="text-slate-600 dark:text-slate-400">{token.b}</strong></span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {token.description && !hasDetailedParams && (
        <p className="text-[9px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-900 pt-1.5 leading-relaxed font-mono">
          {token.description}
        </p>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────

export function QueryExplainBaseMatchStep({
  bm25Groups = [],
  originalScore,
  finalQueryScore,
  defaultExpanded = false,
  queryStructure = null,
  stepNum,
}: Props) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const [expandedFields, setExpandedFields] = React.useState<Record<string, boolean>>({});

  // Use originalScore (before function_score) as the true base score
  const baseScore = originalScore ?? finalQueryScore ?? 0;

  const analysis = React.useMemo(() => analyzeBaseMatchStructure(queryStructure), [queryStructure]);

  // Build a lookup map: field -> bm25Group (for token details)
  const bm25ByField = React.useMemo(() => {
    const map: Record<string, ExplainFieldScoreGroup> = {};
    bm25Groups.forEach(g => { map[g.field] = g; });
    return map;
  }, [bm25Groups]);

  const toggleField = (key: string) =>
    setExpandedFields(prev => ({ ...prev, [key]: !prev[key] }));

  // Compute primary contributor field from analysis
  const primaryField = React.useMemo(() => {
    if (analysis.type === 'dismax_sum') {
      let best: FieldEntry | null = null;
      for (const g of analysis.disMaxGroups) {
        for (const f of g.fields) {
          if (f.isWinner && (!best || f.contribution > best.contribution)) {
            best = f;
          }
        }
      }
      return best;
    }
    if (analysis.flatFields.length > 0) {
      return [...analysis.flatFields].sort((a, b) => b.contribution - a.contribution)[0];
    }
    // Fallback: derive from bm25Groups
    if (bm25Groups.length > 0) {
      const top = [...bm25Groups].sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0))[0];
      return top ? {
        field: top.field, term: null, rawScore: top.total_score ?? 0,
        contribution: top.total_score ?? 0, isWinner: true, status: 'winner' as const,
      } : null;
    }
    return null;
  }, [analysis, bm25Groups]);

  // Derived flat fields: either from analysis or fallback to bm25Groups
  const effectiveFlatFields = React.useMemo<FieldEntry[]>(() => {
    const flatFieldsFromAnalysis = analysis.flatFields || [];
    const disMaxFieldNames = new Set(
      analysis.disMaxGroups.flatMap(g => g.fields.map(f => f.field))
    );
    const analysisFlatFieldNames = new Set(
      flatFieldsFromAnalysis.map(f => f.field)
    );
    
    // Get fields from bm25Groups that are not in dismax groups and not in analysis.flatFields
    const extraBm25Fields = bm25Groups
      .filter(g => !disMaxFieldNames.has(g.field) && !analysisFlatFieldNames.has(g.field))
      .map(g => ({
        field: g.field,
        term: null,
        rawScore: g.total_score ?? 0,
        contribution: g.total_score ?? 0,
        isWinner: true,
        status: 'winner' as const,
      }));
      
    return [...flatFieldsFromAnalysis, ...extraBm25Fields];
  }, [analysis, bm25Groups]);

  // Empty state
  if (bm25Groups.length === 0 && !queryStructure) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-900 text-slate-500 px-2 py-0.5 rounded-md">
                {stepNum != null ? `Step ${stepNum}` : 'Match'}
              </span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">기본 매칭 기여도 (Base Match Drivers)</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">매칭된 텍스트 필드가 없거나 점수 기여가 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 text-left outline-none hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-900 text-slate-500 px-2 py-0.5 rounded-md">
                {stepNum != null ? `Step ${stepNum}` : 'Match'}
              </span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">기본 매칭 기여도 (Base Match Drivers)</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              BM25 텍스트 매칭 또는 KNN 벡터 유사도로부터 계산된 기본 필드별 매칭 기여도입니다.
              {analysis.type === 'dismax_sum' && (
                <span className="ml-1 text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono">
                  DisMax (최댓값 병합)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center font-mono">
          <div className="text-right">
            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
              {formatNum(baseScore)}
            </span>
            {primaryField && (
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                주 기여: {primaryField.field}
              </div>
            )}
          </div>
          <div className="text-slate-400 dark:text-slate-500">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {/* ── Collapsible Content ── */}
      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-slate-900 p-5 space-y-5">
          {/* Summary box */}
          <div className="rounded-xl border border-blue-100 dark:border-blue-950 bg-blue-50/20 dark:bg-blue-950/10 px-4 py-3 text-xs leading-relaxed flex gap-2">
            <Sparkles className="h-4 w-4 text-blue-500 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <strong>기본 점수 매칭 진단</strong>: 이 문서의 BM25/KNN 기본 점수는{' '}
              <strong>{formatNum(baseScore)}</strong>점입니다.
              {analysis.type === 'dismax_sum' && (
                <> {analysis.disMaxGroups.length}개의 DisMax 그룹(최댓값 병합)이 합산되어 최종 기본 점수를 구성합니다.</>
              )}
              {primaryField && (
                <> 최고 기여 필드는 <strong>&apos;{primaryField.field}&apos;</strong>이며 +{formatNum(primaryField.contribution)}점을 기여했습니다.</>
              )}
              {analysis.type === 'dismax_sum' && (
                <span className="text-slate-400"> (DisMax 내 비선택 필드의 점수는 tie_breaker=0이면 0으로 처리됨)</span>
              )}
            </div>
          </div>

          {/* ── DisMax Groups ── */}
          {analysis.type === 'dismax_sum' && analysis.disMaxGroups.length > 0 && (
            <div className="space-y-4">
              {analysis.disMaxGroups.map((group, gIdx) => (
                <div key={`group-${group.groupIndex}`} className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                  {/* Group header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-900">
                    <div className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                        DisMax Group {gIdx + 1}
                      </span>
                      {group.tie_breaker > 0 && (
                        <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-100/50 dark:border-amber-900/50">
                          tie_breaker: {group.tie_breaker}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">
                      {formatNum(group.groupScore)}
                    </span>
                  </div>

                  {/* Fields in this DisMax group */}
                  <div className="divide-y divide-slate-50 dark:divide-slate-900/60">
                    {group.fields.map((fieldEntry, fIdx) => {
                      const fieldKey = `g${group.groupIndex}-f${fIdx}`;
                      const bm25Detail = bm25ByField[fieldEntry.field];
                      const isFieldExpanded = expandedFields[fieldKey] ?? (fieldEntry.isWinner && gIdx === 0);

                      return (
                        <div key={fieldKey} className="bg-white dark:bg-slate-950">
                          {/* Field row */}
                          <button
                            onClick={() => toggleField(fieldKey)}
                            className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                          >
                            <div className="min-w-0 flex-1 flex items-center flex-wrap gap-2">
                              <Terminal className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 break-all">
                                {fieldEntry.field}
                              </span>
                              {fieldEntry.term && (
                                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded">
                                  &quot;{fieldEntry.term}&quot;
                                </span>
                              )}

                              {/* Status badge */}
                              {fieldEntry.status === 'winner' && (
                                <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                  MAX 선택 (100%)
                                </span>
                              )}
                              {fieldEntry.status === 'tie_breaker' && (
                                <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/50">
                                  <Sparkles className="h-2.5 w-2.5 animate-pulse" />
                                  Tie Breaker (×{group.tie_breaker})
                                </span>
                              )}
                              {fieldEntry.status === 'excluded' && (
                                <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800">
                                  <AlertCircle className="h-2.5 w-2.5 text-slate-400" />
                                  무시됨 (×0)
                                </span>
                              )}
                            </div>

                            {/* Scores */}
                            <div className="flex items-center gap-3 shrink-0 font-mono">
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                                  매칭: {formatNum(fieldEntry.rawScore)}
                                </span>
                                <span className={cn(
                                  'text-sm font-bold block',
                                  fieldEntry.status === 'excluded'
                                    ? 'text-slate-400 line-through decoration-slate-300 dark:decoration-slate-700'
                                    : 'text-blue-700 dark:text-blue-400'
                                )}>
                                  기여: +{formatNum(fieldEntry.contribution)}
                                </span>
                              </div>
                              <div className="text-slate-400">
                                {isFieldExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </div>
                            </div>
                          </button>

                          {/* Field token details */}
                          {isFieldExpanded && bm25Detail && (
                            <div className="border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950/60 px-4 py-3 space-y-3">
                              {bm25Detail.source_value !== undefined && (
                                <div className="space-y-1.5">
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider font-semibold">
                                    문서 내 실제 값
                                  </span>
                                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 rounded-lg p-3 text-xs text-slate-700 dark:text-slate-300 break-words">
                                    {renderSourceValue(bm25Detail.source_value)}
                                  </div>
                                </div>
                              )}
                              {bm25Detail.matched_tokens && bm25Detail.matched_tokens.length > 0 && (
                                <div className="space-y-1.5">
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider font-semibold">
                                    형태소 매칭 상세
                                  </span>
                                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                    {bm25Detail.matched_tokens.map((token, tIdx) =>
                                      renderTokenScoreCard(token, `${token.token}-${tIdx}`)
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Flat fields (non-DisMax) or bm25Groups fallback ── */}
          {(analysis.type === 'flat_sum' || analysis.type === 'single' || analysis.type === 'knn' || effectiveFlatFields.length > 0) &&
            effectiveFlatFields.map((fieldEntry, fIdx) => {
              const fieldKey = `flat-${fIdx}`;
              const bm25Detail = bm25ByField[fieldEntry.field];
              const isFieldExpanded = expandedFields[fieldKey] ?? (fIdx === 0);
              const pct = baseScore > 0 ? (fieldEntry.contribution / baseScore) * 100 : 0;

              return (
                <div key={fieldKey} className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 overflow-hidden shadow-2xs">
                  <button
                    onClick={() => toggleField(fieldKey)}
                    className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center flex-wrap gap-2">
                        <Terminal className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 break-all">{fieldEntry.field}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-mono">기여 {pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 font-mono">
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-400">+{formatNum(fieldEntry.contribution)}</span>
                      <div className="text-slate-400">{isFieldExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}</div>
                    </div>
                  </button>
                  {isFieldExpanded && bm25Detail && (
                    <div className="border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950/60 p-4 space-y-3">
                      {bm25Detail.source_value !== undefined && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider font-semibold">문서 내 실제 값</span>
                          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 rounded-lg p-3 text-xs break-words">{renderSourceValue(bm25Detail.source_value)}</div>
                        </div>
                      )}
                      {bm25Detail.matched_tokens && bm25Detail.matched_tokens.length > 0 && (
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          {bm25Detail.matched_tokens.map((token, tIdx) =>
                            renderTokenScoreCard(token, `${token.token}-${tIdx}`)
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
