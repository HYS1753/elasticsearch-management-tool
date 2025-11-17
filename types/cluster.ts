export interface ClusterStatus {
  cluster_name: string;
  status: 'green' | 'yellow' | 'red';
  timed_out: boolean;
  number_of_nodes: number;
  number_of_data_nodes: number;
  active_primary_shards: number;
  active_shards: number;
  relocating_shards: number;
  initializing_shards: number;
  unassigned_shards: number;
  delayed_unassigned_shards: number;
  number_of_pending_tasks: number;
  number_of_in_flight_fetch: number;
  task_max_waiting_in_queue_millis: number;
  active_shards_percent_as_number: number;
}

export interface NodeInfo {
  id: string;
  name: string;
  transport_address: string;
  host: string;
  ip: string;
  version: string;
  build_flavor: string;
  build_type: string;
  build_hash: string;
  roles: string[];
  attributes: Record<string, string>;
}


export interface NodeStatus {
  is_master_node: boolean;
  id: string;
  name: string;
  host: string;
  transport: string;
  roles: string[];
  stats: {
    docs_count: number;
    docs_deleted: number;
    docs_store_size: string;
    os_cpu_percent: number;
    os_cpu_load_average_1m: number;
    os_cpu_load_average_5m: number;
    os_cpu_load_average_15m: number;
    os_mem_total: string;
    os_mem_used: string;
    os_mem_used_percent: number;
    os_mem_free: string;
    jvm_heap_used: string;
    jvm_heap_used_percent: number;
    jvm_heap_max: string;
    fs_total: string;
    fs_free: string;
    fs_used: string;
    fs_used_percent: number;
    search_threads: number;
    search_queue: number;
    search_active: number;
    search_rejected: number;
    search_completed: number;
    indexing_current_all: string;
    indexing_total_all: string;
    indexing_limit: string;
    indexing_pressure_percent: number;
    indexing_rejections_total: number;
  };
}

export interface ClusterStats {
  cluster_name: string;
  cluster_uuid: string;
  timestamp: number;
  status: 'green' | 'yellow' | 'red';
  indices: {
    count: number;
    shards: {
      total: number;
      primaries: number;
      replication: number;
    };
    docs: {
      count: number;
      deleted: number;
    };
    store: {
      size_in_bytes: number;
    };
  };
  nodes: {
    count: {
      total: number;
      data: number;
      coordinating_only: number;
      master: number;
      ingest: number;
    };
  };
}
