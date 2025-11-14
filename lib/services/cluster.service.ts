import { getElasticsearchClient } from '@/lib/elasticsearch/client';
import type { ClusterHealth, NodeStats, ClusterStats } from '@/types/cluster';

export class ClusterService {
  private client = getElasticsearchClient();
  private apiUrl = process.env.CLUSTER_API_URL;

  async getHealth(): Promise<ClusterHealth> {
    const response = await fetch(`${this.apiUrl}/app/cluster/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cluster health: ${response.statusText}`);
    }

    const result = await response.json();
    
    // API 응답 구조에서 data 추출
    if (result.code === '200' && result.data) {
      return result.data as ClusterHealth;
    }
    
    throw new Error(result.message || 'Failed to fetch cluster health');
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
