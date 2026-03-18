export interface ExplainScoreStep {
  key: string;
  label: string;
  value?: number | null;
  formula_label?: string | null;
}

export interface QueryExplainSummaryHit {
  index: string;
  id: string;
  doc_title?: string | null;
  total_score?: number | null;
  query_score?: number | null;
  rescore_steps: ExplainScoreStep[];
  formula: string;
  source?: Record<string, unknown> | null;
}

export interface QueryExplainSummaryResponse {
  took: number;
  timed_out: boolean;
  total_hits?: number | null;
  hits: QueryExplainSummaryHit[];
}

export interface ExplainMatchedToken {
  token: string;
  score?: number | null;
  boost?: number | null;
  idf?: number | null;
  tf?: number | null;
  description?: string | null;
}

export interface ExplainFieldScoreGroup {
  field: string;
  source_value?: unknown;
  total_score?: number | null;
  matched_tokens: ExplainMatchedToken[];
}

export interface ExplainFilter {
  label: string;
  matched: boolean;
  source_value?: unknown;
  description?: string | null;
}

export interface ExplainFunctionScore {
  label: string;
  score?: number | null;
  field?: string | null;
  source_value?: unknown;
  description?: string | null;
}

export interface ExplainRescoreDetail {
  order: number;
  type: string;
  title: string;
  score?: number | null;
  description?: string | null;
  details: ExplainFunctionScore[];
}

export interface ExplainQueryDetail {
  original_score?: number | null;
  filters: ExplainFilter[];
  bm25_groups: ExplainFieldScoreGroup[];
  function_scores: ExplainFunctionScore[];
}

export interface QueryExplainScoreTimelineStep {
  key: string;
  label: string;
  value?: number | null;
  description?: string | null;
}

export interface QueryExplainDetailResponse {
  index: string;
  id: string;
  doc_title?: string | null;
  total_score?: number | null;
  query: ExplainQueryDetail;
  rescores: ExplainRescoreDetail[];
  score_timeline: QueryExplainScoreTimelineStep[];
  raw_explanation?: Record<string, unknown> | null;
  source?: Record<string, unknown> | null;
}

export interface QueryExplainSummaryRequest {
  index: string;
  body: Record<string, unknown>;
  include_source_fields: boolean;
  doc_title_fields: string[];
}

export interface QueryExplainDetailRequest {
  index: string;
  body: Record<string, unknown>;
  doc_id: string;
  include_raw_explain: boolean;
  include_source_fields: boolean;
  doc_title_fields: string[];
}