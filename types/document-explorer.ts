export interface DocumentExplorerIndexItem {
  index: string;
  health?: string;
  status?: string;
  docs_count?: string;
  store_size?: string;
}

export interface DocumentHitItem {
  _index: string;
  _id: string;
  _score?: number | null;
  _source: Record<string, unknown>;
  sort?: unknown[];
}

export interface DocumentSearchRequest {
  index_name: string;
  query?: Record<string, unknown>;
  from?: number;
  size?: number;
  sort?: Array<Record<string, 'asc' | 'desc'>>;
}

export interface DocumentSearchData {
  took: number;
  timed_out: boolean;
  total: number;
  hits: DocumentHitItem[];
}

export interface DocumentSearchResponse {
  code: string;
  message: string;
  data?: DocumentSearchData;
}

export interface DocumentsIndexListData {
  indices: DocumentExplorerIndexItem[];
}

export interface DocumentsIndexListResponse {
  code: string;
  message: string;
  data?: DocumentsIndexListData;
}