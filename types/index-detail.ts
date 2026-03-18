export interface IndexDetailSummary {
  index: string;
  uuid: string;
  health: string;
  status: string;
  pri: string;
  rep: string;
  docs_count?: string | null;
  docs_deleted?: string | null;
  store_size?: string | null;
  pri_store_size?: string | null;
  dataset_size?: string | null;
}

export interface IndexAliasItem {
  name: string;
  is_write_index: boolean;
  filter?: string | null;
  routing_index?: string | null;
  routing_search?: string | null;
}

export interface IndexSettingItem {
  key: string;
  value: string;
}

export interface IndexMappingField {
  name: string;
  type: string;
  children: IndexMappingField[];
}

export interface IndexStats {
  docs_count: number;
  docs_deleted: number;
  store_size_in_bytes: number;
  primary_store_size_in_bytes: number;
  search_query_total: number;
  indexing_index_total: number;
}

export interface IndexDetailData {
  summary: IndexDetailSummary;
  aliases: IndexAliasItem[];
  settings: IndexSettingItem[];
  mappings: IndexMappingField[];
  stats: IndexStats;
}