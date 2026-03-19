export type IndexActionType =
  | 'open'
  | 'close'
  | 'update_read_only'
  | 'refresh'
  | 'flush'
  | 'forcemerge'
  | 'delete';

export interface ExecuteIndexActionRequest {
  action: IndexActionType;
  read_only?: boolean;
  max_num_segments?: number;
}

export interface IndexActionResult {
  index_name: string;
  action: IndexActionType;
  acknowledged: boolean;
  message: string;
  details?: Record<string, unknown> | null;
}

export interface IndexActionResponse {
  code: string;
  message: string;
  data?: IndexActionResult;
}