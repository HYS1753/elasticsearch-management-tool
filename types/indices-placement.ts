export interface Node {
  id: string;
  name: string;
  host: string;
  roles: string[];
  is_master: boolean;
}

export interface ShardInfo {
  shard: string;
  prirep: 'p' | 'r';
  state: string;
  node_id: string;
  node_name: string;
  store: string;
  docs: string;
}

export interface UnassignedShard {
  shard: string;
  prirep: 'p' | 'r';
  state: string;
}

export interface IndexPlacement {
  index: string;
  status: string;
  shards_by_node: {
    [nodeName: string]: ShardInfo[];
  };
  unassigned: UnassignedShard[];
}

export interface IndicesPlacementData {
  nodes: Node[];
  indices: IndexPlacement[];
  has_unassigned_shards: boolean;
}

export interface IndicesPlacementResponse {
  code: string;
  message: string;
  data: IndicesPlacementData;
}
