export interface IndexListItem {
  health: 'green' | 'yellow' | 'red';
  status: 'open' | 'closed';
  index: string;
  uuid: string;
  pri: string;
  rep: string;
  docs_count: string;
  docs_deleted: string;
  store_size: string;
  pri_store_size: string;
  dataset_size: string;
}

export interface IndicesListResponse {
  code: string;
  message: string;
  data: {
    indices: IndexListItem[];
  };
}
