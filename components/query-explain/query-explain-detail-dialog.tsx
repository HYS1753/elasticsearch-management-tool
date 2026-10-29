'use client';

import * as React from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw,
  Copy,
  Check,
  Activity,
  GitFork,
  TrendingUp,
  Database
} from 'lucide-react';
import { QueryExplainDiagnosis } from '@/components/query-explain/query-explain-diagnosis';
import { QueryExplainTreePanel } from '@/components/query-explain/query-explain-tree-panel';
import { QueryExplainRescorePanel } from '@/components/query-explain/query-explain-rescore-panel';
import { cn } from '@/lib/utils';

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
  const [copied, setCopied] = React.useState(false);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFallbackFormula = () => {
    if (!data?.score_timeline || data.score_timeline.length === 0) return '';
    
    const queryStep = data.score_timeline.find(s => s.key === 'query');
    const totalStep = data.score_timeline.find(s => s.key === 'total');
    const rescoreSteps = data.score_timeline.filter(s => s.key !== 'query' && s.key !== 'total');
    
    const query_score = queryStep?.value;
    const total_score = totalStep?.value;
    
    if (query_score === undefined && rescoreSteps.length === 0) {
      return total_score !== undefined && total_score !== null
        ? `total(${total_score.toFixed(4)})`
        : 'total(null)';
    }
    
    if (query_score !== undefined && query_score !== null && rescoreSteps.length === 0) {
      if (total_score !== undefined && total_score !== null) {
        return `query(${query_score.toFixed(4)}) = total(${total_score.toFixed(4)})`;
      }
      return `query(${query_score.toFixed(4)})`;
    }
    
    const validSteps = rescoreSteps.filter(step => step.value !== undefined && step.value !== null);
    
    if ((query_score === undefined || query_score === null) && validSteps.length > 0) {
      const exprParts: string[] = [];
      validSteps.forEach((step, idx) => {
        const match = step.key.match(/rescore_(\d+)/);
        const rescoreNum = match ? parseInt(match[1], 10) : (idx + 1);
        let label = `rescore${rescoreNum}`;
        if (step.key.includes('_normalizer') && step.description?.startsWith('score_normalizer:')) {
          const normType = step.description.split(':')[1] || 'score_normalizer';
          label = `rescore${rescoreNum}:${normType}`;
        } else if (step.key.includes('_function_score')) {
          if (step.description?.includes('field_value_factor')) {
            label = `rescore${rescoreNum}:field_value_factor`;
          } else {
            label = `rescore${rescoreNum}:function_score`;
          }
        }
        
        const valStr = typeof step.value === 'number' ? step.value.toFixed(4) : '0.0000';
        const op = step.operator || '->';
        
        const stepStr = `${label}(${valStr})`;
        if (idx === 0) {
          exprParts.push(stepStr);
        } else {
          exprParts.push(`${op} ${stepStr}`);
        }
      });
      let formula = exprParts.join(' ');
      if (total_score !== undefined && total_score !== null) {
        formula += ` = total(${total_score.toFixed(4)})`;
      }
      return formula;
    }
    
    const exprParts: string[] = [`query(${query_score?.toFixed(4) || '0.0000'})`];
    validSteps.forEach((step, idx) => {
      const match = step.key.match(/rescore_(\d+)/);
      const rescoreNum = match ? parseInt(match[1], 10) : (idx + 1);
      let label = `rescore${rescoreNum}`;
      if (step.key === 'function_score') {
        label = 'function_score';
      } else if (step.key.includes('_normalizer') && step.description?.startsWith('score_normalizer:')) {
        const normType = step.description.split(':')[1] || 'score_normalizer';
        label = `rescore${rescoreNum}:${normType}`;
      } else if (step.key.includes('_function_score')) {
        if (step.description?.includes('field_value_factor')) {
          label = `rescore${rescoreNum}:field_value_factor`;
        } else {
          label = `rescore${rescoreNum}:function_score`;
        }
      }
      
      const op = step.operator || '->';
      const opVal = typeof step.operator_value === 'number' ? step.operator_value : (step.value ?? 0);
      const valStr = typeof step.value === 'number' ? step.value.toFixed(4) : '0.0000';
      
      if (label === 'function_score') {
        exprParts.push(`* boost(${opVal.toFixed(4)})`);
      } else {
        exprParts.push(`${op} ${label}(${valStr})`);
      }
    });
    
    let formula = exprParts.join(' ');
    if (total_score !== undefined && total_score !== null) {
      formula += ` = total(${total_score.toFixed(4)})`;
    }
    return formula;
  };

  const formulaString = selectedHit?.formula || getFallbackFormula();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] !max-w-[95vw] xl:!max-w-[1500px] overflow-hidden p-0">
        <div className="border-b bg-white dark:bg-slate-950 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Query Explain Detail
            </DialogTitle>
            <DialogDescription className="mt-1 break-words text-sm text-slate-600 dark:text-slate-400">
              검색 질의에 매칭된 문서의 매칭 세부 정보와 점수 계산 근거를 확인합니다.
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="h-[82vh]">
          {loading ? (
            <div className="flex h-[540px] items-center justify-center text-slate-500 dark:text-slate-400">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              explain detail 조회 중...
            </div>
          ) : !data ? (
            <div className="flex h-[540px] items-center justify-center text-slate-500 dark:text-slate-400">
              상세 데이터가 없습니다.
            </div>
          ) : (
            <div className="space-y-6 p-6">
              {/* Score Calculation Dashboard */}
              <Card className="overflow-hidden border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 shadow-sm rounded-3xl">
                <CardContent className="p-6 space-y-6">
                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-xs px-2.5 py-1 rounded-lg">
                        <span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider mr-1">Index</span>
                        {data.index}
                      </span>
                      <button
                        onClick={() => handleCopyId(data.id)}
                        className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 font-mono text-xs px-2.5 py-1 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-950/50 transition-colors"
                        title="Click to copy Doc ID"
                      >
                        <span className="font-semibold text-blue-400 dark:text-blue-500 uppercase text-[9px] tracking-wider mr-1">ID</span>
                        {data.id}
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-full">
                      {data.doc_title || selectedHit?.doc_title || 'No Title'}
                    </div>
                  </div>

                  {/* Score Equation Chain */}
                  <div className="flex flex-col items-center justify-center py-2">
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                      {data.score_timeline.map((step, idx) => {
                        const isFirst = idx === 0;
                        const isLast = idx === data.score_timeline.length - 1;
                        const isQuery = step.key === 'query';
                        const isTotal = step.key === 'total';

                        let cardBg = '';
                        let textTheme = '';
                        let labelColor = '';
                        
                        if (isQuery) {
                          cardBg = 'bg-gradient-to-br from-blue-50/60 to-indigo-50/60 dark:from-blue-950/10 dark:to-indigo-950/10 border-blue-200/80 dark:border-blue-900/40';
                          textTheme = 'text-blue-700 dark:text-blue-300';
                          labelColor = 'text-blue-600/80 dark:text-blue-400/80';
                        } else if (isTotal) {
                          cardBg = 'bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 border-emerald-600 dark:border-emerald-700 text-white shadow-sm';
                          textTheme = 'text-white dark:text-emerald-50';
                          labelColor = 'text-white/80 dark:text-emerald-100/80';
                        } else {
                          cardBg = 'bg-gradient-to-br from-violet-50/60 to-purple-50/60 dark:from-violet-950/10 dark:to-purple-950/10 border-violet-200/80 dark:border-violet-900/40';
                          textTheme = 'text-violet-700 dark:text-violet-300';
                          labelColor = 'text-violet-600/80 dark:text-violet-400/80';
                        }

                        return (
                          <React.Fragment key={`${step.key}-${idx}`}>
                            {/* Operator Pill */}
                            {!isFirst && (
                              <div className={cn(
                                "flex items-center justify-center px-3 py-1.5 rounded-full border shadow-sm shrink-0 select-none font-mono text-xs font-bold",
                                isLast
                                  ? "bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                  : (() => {
                                      const op = step.operator;
                                      if (op === '*') return "bg-indigo-50/80 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-300";
                                      if (op === '+') return "bg-emerald-50/80 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-300";
                                      if (op === 'max') return "bg-amber-50/80 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-300";
                                      if (op === 'min') return "bg-cyan-50/80 border-cyan-200 text-cyan-700 dark:bg-cyan-950/20 dark:border-cyan-900/50 dark:text-cyan-300";
                                      return "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400";
                                    })()
                              )}>
                                {isLast ? (
                                  '='
                                ) : (
                                  (() => {
                                    const op = step.operator;
                                    const opVal = step.operator_value;
                                    const valStr = typeof opVal === 'number' ? opVal.toFixed(4) : '';
                                    if (op === '*') {
                                      return `× ${valStr}`;
                                    }
                                    if (op === '+') {
                                      return `+ ${valStr}`;
                                    }
                                    if (op === 'max') {
                                      return `max(${valStr})`;
                                    }
                                    if (op === 'min') {
                                      return `min(${valStr})`;
                                    }
                                    return `→ ${valStr}`;
                                  })()
                                )}
                              </div>
                            )}

                            {/* Score Step Card */}
                            <div className={cn("min-w-[180px] sm:min-w-[200px] rounded-2xl border p-4 transition-all duration-200 hover:shadow-md", cardBg)}>
                              <div className={cn("text-[10px] font-bold uppercase tracking-wider", labelColor)}>
                                {step.label}
                              </div>
                              <div className={cn("mt-1.5 font-mono text-2xl font-bold tracking-tight", textTheme)}>
                                {typeof step.value === 'number' ? step.value.toFixed(4) : 'N/A'}
                              </div>
                              {/* Natural language description */}
                              {step.description && (
                                <div className={cn("mt-1 text-[11px] leading-relaxed truncate", isTotal ? "text-white/70 dark:text-emerald-200/70" : "text-slate-500 dark:text-slate-400")}>
                                  {step.description}
                                </div>
                              )}
                              {/* Sub-details: top contributing fields (query step only) */}
                              {isQuery && step.sub_details && step.sub_details.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-blue-100/60 dark:border-blue-900/30 space-y-1">
                                  {step.sub_details.slice(0, 3).map((sd, sdIdx) => (
                                    <div key={sdIdx} className="flex items-center justify-between gap-2 text-[10px] font-mono">
                                      <span className="text-blue-600/80 dark:text-blue-400/80 truncate max-w-[120px]" title={sd.field || ''}>
                                        {sd.field}
                                      </span>
                                      <span className="text-blue-700 dark:text-blue-300 font-bold shrink-0">
                                        +{typeof sd.score === 'number' ? sd.score.toFixed(2) : '0'}
                                      </span>
                                    </div>
                                  ))}
                                  {step.sub_details.length > 3 && (
                                    <div className="text-[9px] text-slate-400 dark:text-slate-500">
                                      외 {step.sub_details.length - 3}개 필드
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Raw Formula Expression */}
                  {formulaString && (
                    <div className="flex justify-center border-t border-slate-100 dark:border-slate-800/80 pt-4">
                      <div className="inline-flex flex-col md:flex-row items-center gap-2 bg-slate-100/60 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                          Score Formula
                        </span>
                        <span className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all select-all font-semibold">
                          {formulaString}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tab Navigation for Detailed Breakdown */}
              <Tabs defaultValue="diagnosis" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 rounded-xl bg-slate-100 dark:bg-slate-900 p-1 mb-6">
                  <TabsTrigger
                    value="diagnosis"
                    className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm transition-all"
                  >
                    <Activity className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span>점수 진단 및 요약</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="tree"
                    className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm transition-all"
                  >
                    <GitFork className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    <span>점수 연산 트리</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="rescore"
                    className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm transition-all"
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Rescore 상세</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="raw"
                    className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm transition-all"
                  >
                    <Database className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>원천 데이터</span>
                  </TabsTrigger>
                </TabsList>

                {/* Tab Contents */}
                <div className="mt-2 min-h-[300px]">
                  <TabsContent value="diagnosis" className="mt-0 outline-none focus-visible:outline-none">
                    <Card className="border-slate-200/70 dark:border-slate-800/80 shadow-sm rounded-2xl">
                      <CardContent className="p-6">
                        <QueryExplainDiagnosis
                          query={data.query}
                          rescores={data.rescores}
                          totalScore={data.total_score}
                          scoreTimeline={data.score_timeline}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="tree" className="mt-0 outline-none focus-visible:outline-none">
                    <Card className="border-slate-200/70 dark:border-slate-800/80 shadow-sm rounded-2xl">
                      <CardContent className="p-6">
                        <QueryExplainTreePanel node={data.query.query_structure} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="rescore" className="mt-0 outline-none focus-visible:outline-none">
                    <QueryExplainRescorePanel items={data.rescores} />
                  </TabsContent>

                  <TabsContent value="raw" className="mt-0 outline-none focus-visible:outline-none space-y-6">
                    {/* Source Document Details */}
                    {data.source && (
                      <Card className="border-slate-200/70 dark:border-slate-800/80 shadow-sm rounded-2xl overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-900 px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
                          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                            Source Document Content (문서 소스)
                          </h4>
                        </div>
                        <CardContent className="p-4">
                          <pre className="w-full overflow-auto rounded-xl bg-slate-50 dark:bg-slate-900 p-4 text-xs text-slate-700 dark:text-slate-300 font-mono max-h-[400px] whitespace-pre-wrap break-all">
                            {JSON.stringify(data.source, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    )}

                    {/* Raw Lucene Explanation */}
                    {data.raw_explanation && (
                      <Card className="border-slate-200/70 dark:border-slate-800/80 shadow-sm rounded-2xl overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-900 px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
                          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                            Raw Lucene Explanation JSON (원본 트리)
                          </h4>
                        </div>
                        <CardContent className="p-4">
                          <pre className="w-full overflow-auto rounded-xl bg-slate-50 dark:bg-slate-900 p-4 text-xs text-slate-700 dark:text-slate-300 font-mono max-h-[400px] whitespace-pre-wrap break-all">
                            {JSON.stringify(data.raw_explanation, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}