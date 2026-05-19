// ──────────────────────────────────────────────
// Prometheus Metrics Dashboard Types
// Backend Pydantic 스키마와 동기화
// ──────────────────────────────────────────────

export interface MetricPoint {
  timestamp: number;
  value: number;
}

export interface MetricSeries {
  metric_name: string;
  labels: Record<string, string>;
  values: MetricPoint[];
}

// ── Cluster Overview (instant) ──

export interface ClusterHealthSummary {
  status: string;
  number_of_nodes: number;
  number_of_data_nodes: number;
  active_shards: number;
  unassigned_shards: number;
  relocating_shards: number;
  initializing_shards: number;
  pending_tasks: number;
  total_docs: number;
  total_store_size_bytes: number;
}

export interface ClusterOverviewResponse {
  health: ClusterHealthSummary;
}

// ── Node Resources (range) ──

export interface NodeResourcesResponse {
  cpu_percent: MetricSeries[];
  memory_used_bytes: MetricSeries[];
  jvm_heap_used_bytes: MetricSeries[];
  jvm_heap_max_bytes: MetricSeries[];
  gc_collection_count: MetricSeries[];
  gc_collection_time: MetricSeries[];
}

// ── Search Performance (range) ──

export interface SearchPerformanceResponse {
  query_rate: MetricSeries[];
  query_latency: MetricSeries[];
  fetch_rate: MetricSeries[];
  fetch_latency: MetricSeries[];
}

// ── Indexing Performance (range) ──

export interface IndexingPerformanceResponse {
  index_rate: MetricSeries[];
  index_latency: MetricSeries[];
  delete_rate: MetricSeries[];
}

// ── Cache & Thread Pool (range) ──

export interface CacheThreadPoolResponse {
  query_cache_size: MetricSeries[];
  query_cache_evictions: MetricSeries[];
  thread_pool_active: MetricSeries[];
  thread_pool_rejected: MetricSeries[];
  thread_pool_queue: MetricSeries[];
}

// ── Storage Overview (instant) ──

export interface NodeStorageInfo {
  node_name: string;
  total_bytes: number;
  available_bytes: number;
  used_bytes: number;
  used_percent: number;
}

export interface StorageOverviewResponse {
  nodes: NodeStorageInfo[];
}

// ── Time Range ──

export type TimeRange = '15m' | '1h' | '6h' | '24h' | '7d' | 'custom';
