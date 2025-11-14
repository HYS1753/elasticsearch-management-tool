import { getElasticsearchClient } from '@/lib/elasticsearch/client';
import type { ClusterHealth, NodeStats, ClusterStats } from '@/types/cluster';

export class ClusterService {
  private client = getElasticsearchClient();

  async getHealth(): Promise<ClusterHealth> {
    const response = await this.client.cluster.health();
    return response as ClusterHealth;
  }

  async getStats(): Promise<ClusterStats> {
    const response = await this.client.cluster.stats();
    return response as ClusterStats;
  }

  async getNodeStats(): Promise<Record<string, NodeStats>> {
    const response = await this.client.nodes.stats();
    return response.nodes as Record<string, NodeStats>;
  }

  async getNodeInfo() {
    const response = await this.client.nodes.info();
    return response.nodes;
  }

  async getClusterInfo() {
    const response = await this.client.info();
    return response;
  }
}

export const clusterService = new ClusterService();
