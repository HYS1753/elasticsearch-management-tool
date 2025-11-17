import { getElasticsearchClient } from '@/lib/elasticsearch/client';
import type { ClusterStatus, NodeStatus, ClusterStats } from '@/types/cluster';

export class ClusterService {
  private client = getElasticsearchClient();
  private apiUrl = process.env.CLUSTER_API_URL;

  async getClusterStatus(): Promise<ClusterStatus> {
    const response = await fetch(`${this.apiUrl}/app/cluster/cluster-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cluster status: ${response}`);
    }

    const result = await response.json();
    
    // API 응답 구조에서 data 추출
    if (result.code === '200' && result.data) {
      return result.data as ClusterStatus;
    }
    
    throw new Error(result.message || 'Failed to fetch cluster status');
  }

  async getStats(): Promise<ClusterStats> {
    const response = await this.client.cluster.stats();
    return response as ClusterStats;
  }


  async getNodeStatus(): Promise<{ code: string; message: string; data: { nodes: NodeStatus[] } }> {
    const response = await fetch(`${this.apiUrl}/app/cluster/node-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch node status: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.code === '200' && result.data) {
      return result;
    }
    throw new Error(result.message || 'Failed to fetch node status');
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
