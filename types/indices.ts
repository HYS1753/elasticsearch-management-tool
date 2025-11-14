export interface IndexInfo {
  health: 'green' | 'yellow' | 'red';
  status: 'open' | 'close';
  index: string;
  uuid: string;
  pri: string;
  rep: string;
  'docs.count': string;
  'docs.deleted': string;
  'store.size': string;
  'pri.store.size': string;
}

export interface IndexSettings {
  index: {
    number_of_shards: string;
    number_of_replicas: string;
    provided_name?: string;
    creation_date?: string;
    uuid?: string;
    version?: {
      created: string;
    };
  };
}

export interface IndexMappings {
  properties: Record<string, {
    type: string;
    fields?: Record<string, {
      type: string;
      [key: string]: any;
    }>;
    [key: string]: any;
  }>;
}

export interface CreateIndexRequest {
  settings?: {
    number_of_shards?: number;
    number_of_replicas?: number;
    [key: string]: any;
  };
  mappings?: IndexMappings;
  aliases?: Record<string, any>;
}

export interface IndexStats {
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _all: {
    primaries: {
      docs: {
        count: number;
        deleted: number;
      };
      store: {
        size_in_bytes: number;
      };
    };
    total: {
      docs: {
        count: number;
        deleted: number;
      };
      store: {
        size_in_bytes: number;
      };
    };
  };
  indices: Record<string, {
    uuid: string;
    primaries: {
      docs: {
        count: number;
        deleted: number;
      };
      store: {
        size_in_bytes: number;
      };
    };
    total: {
      docs: {
        count: number;
        deleted: number;
      };
      store: {
        size_in_bytes: number;
      };
    };
  }>;
}
