export interface ClusterHealth {
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

export interface NodeStats {
  name: string;
  transport_address: string;
  host: string;
  ip: string;
  roles: string[];
  indices: {
    docs: {
      count: number;
      deleted: number;
    };
    store: {
      size_in_bytes: number;
    };
  };
  os: {
    cpu: {
      percent: number;
    };
    mem: {
      used_percent: number;
    };
  };
  fs: {
    total: {
      total_in_bytes: number;
      available_in_bytes: number;
      free_in_bytes: number;
    };
  };
  jvm: {
    mem: {
      heap_used_percent: number;
      heap_used_in_bytes: number;
      heap_max_in_bytes: number;
    };
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
