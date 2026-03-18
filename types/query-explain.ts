export interface QueryExplainScoreStep {
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
  rescore_steps: QueryExplainScoreStep[];
  formula: string;
  source?: Record<string, unknown> | null;
}

export interface QueryExplainSummaryResponse {
  took: number;
  timed_out: boolean;
  total_hits?: number | null;
  hits: QueryExplainSummaryHit[];
}

export interface QueryExplainDetailNode {
  key: string;
  label: string;
  value?: number | null;
  description?: string | null;
  children: QueryExplainDetailNode[];
  expandable: boolean;
}

export interface QueryExplainTermFactor {
  field?: string | null;
  term?: string | null;
  score?: number | null;
  boost?: number | null;
  idf?: number | null;
  tf?: number | null;
  freq?: number | null;
  dl?: number | null;
  avgdl?: number | null;
}

export interface QueryExplainSection {
  score?: number | null;
  title: string;
  items: QueryExplainDetailNode[];
}

export interface QueryExplainDetailResponse {
  index: string;
  id: string;
  doc_title?: string | null;
  total_score?: number | null;
  query_section: QueryExplainSection;
  rescore_sections: QueryExplainSection[];
  term_factors: QueryExplainTermFactor[];
  raw_explanation?: Record<string, unknown> | null;
  source?: Record<string, unknown> | null;
  score_timeline: QueryExplainScoreTimelineStep[];
  field_impacts: QueryExplainFieldImpact[];
  filter_matches: QueryExplainFilterMatch[];
  scoring_functions: QueryExplainScoringFunction[];
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

export interface QueryExplainScoreTimelineStep {
  key: string;
  label: string;
  value?: number | null;
  description?: string | null;
}

export interface QueryExplainMatchedToken {
  token: string;
  score?: number | null;
  boost?: number | null;
  idf?: number | null;
  tf?: number | null;
}

export interface QueryExplainFieldImpact {
  field: string;
  source_value?: unknown;
  total_score?: number | null;
  matched_tokens: QueryExplainMatchedToken[];
}

export interface QueryExplainFilterMatch {
  label: string;
  matched: boolean;
  description?: string | null;
}

export interface QueryExplainScoringFunction {
  label: string;
  score?: number | null;
  description?: string | null;
  field?: string | null;
  source_value?: unknown;
}