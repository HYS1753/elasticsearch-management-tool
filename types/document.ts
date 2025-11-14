export interface SearchRequest {
  index: string;
  query?: {
    match_all?: {};
    match?: Record<string, string | { query: string; [key: string]: any }>;
    term?: Record<string, string | number | boolean>;
    terms?: Record<string, (string | number | boolean)[]>;
    range?: Record<string, {
      gte?: number | string;
      lte?: number | string;
      gt?: number | string;
      lt?: number | string;
    }>;
    bool?: {
      must?: any[];
      should?: any[];
      must_not?: any[];
      filter?: any[];
    };
    [key: string]: any;
  };
  from?: number;
  size?: number;
  sort?: Array<string | Record<string, 'asc' | 'desc' | { order: 'asc' | 'desc'; [key: string]: any }>>;
  _source?: boolean | string[];
  aggs?: Record<string, any>;
}

export interface SearchResponse<T = any> {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: 'eq' | 'gte';
    };
    max_score: number | null;
    hits: Array<{
      _index: string;
      _id: string;
      _score: number | null;
      _source: T;
    }>;
  };
  aggregations?: Record<string, any>;
}

export interface Document<T = any> {
  _index: string;
  _id: string;
  _version?: number;
  _source: T;
}

export interface IndexDocumentRequest<T = any> {
  index: string;
  id?: string;
  document: T;
  refresh?: boolean | 'wait_for';
}

export interface UpdateDocumentRequest<T = any> {
  index: string;
  id: string;
  doc?: Partial<T>;
  script?: {
    source: string;
    params?: Record<string, any>;
  };
  refresh?: boolean | 'wait_for';
}

export interface DeleteDocumentRequest {
  index: string;
  id: string;
  refresh?: boolean | 'wait_for';
}

export interface BulkOperation {
  index?: {
    _index: string;
    _id?: string;
  };
  create?: {
    _index: string;
    _id?: string;
  };
  update?: {
    _index: string;
    _id: string;
  };
  delete?: {
    _index: string;
    _id: string;
  };
}

export interface BulkRequest {
  operations: Array<BulkOperation | any>;
  refresh?: boolean | 'wait_for';
}

export interface BulkResponse {
  took: number;
  errors: boolean;
  items: Array<Record<string, {
    _index: string;
    _id: string;
    _version?: number;
    result?: string;
    status: number;
    error?: {
      type: string;
      reason: string;
    };
  }>>;
}
