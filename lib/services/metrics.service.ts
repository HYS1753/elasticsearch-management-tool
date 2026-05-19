import type {
  ClusterOverviewResponse,
  NodeResourcesResponse,
  SearchPerformanceResponse,
  IndexingPerformanceResponse,
  CacheThreadPoolResponse,
  StorageOverviewResponse,
  TimeRange,
} from '@/types/metrics';
import { getAuthHeaders } from './auth-helper';

export class MetricsService {
  private apiUrl = process.env.CLUSTER_API_URL;

  private async fetchMetrics<T>(path: string, params?: Record<string, string>): Promise<T> {
    const authHeaders = await getAuthHeaders();
    const searchParams = params ? '?' + new URLSearchParams(params).toString() : '';

    const response = await fetch(`${this.apiUrl}/app/metrics${path}${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch metrics ${path}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.code === '200' && result.data) {
      return result.data as T;
    }

    throw new Error(result.message || `Failed to fetch metrics ${path}`);
  }

  async getClusterOverview(): Promise<ClusterOverviewResponse> {
    return this.fetchMetrics<ClusterOverviewResponse>('/cluster-overview');
  }

  async getNodeResources(timeRange: TimeRange = '1h', step?: string): Promise<NodeResourcesResponse> {
    const params: Record<string, string> = { time_range: timeRange };
    if (step) params.step = step;
    return this.fetchMetrics<NodeResourcesResponse>('/node-resources', params);
  }

  async getSearchPerformance(timeRange: TimeRange = '1h', step?: string): Promise<SearchPerformanceResponse> {
    const params: Record<string, string> = { time_range: timeRange };
    if (step) params.step = step;
    return this.fetchMetrics<SearchPerformanceResponse>('/search-performance', params);
  }

  async getIndexingPerformance(timeRange: TimeRange = '1h', step?: string): Promise<IndexingPerformanceResponse> {
    const params: Record<string, string> = { time_range: timeRange };
    if (step) params.step = step;
    return this.fetchMetrics<IndexingPerformanceResponse>('/indexing-performance', params);
  }

  async getCacheThreadPool(timeRange: TimeRange = '1h', step?: string): Promise<CacheThreadPoolResponse> {
    const params: Record<string, string> = { time_range: timeRange };
    if (step) params.step = step;
    return this.fetchMetrics<CacheThreadPoolResponse>('/cache-threadpool', params);
  }

  async getStorageOverview(): Promise<StorageOverviewResponse> {
    return this.fetchMetrics<StorageOverviewResponse>('/storage-overview');
  }
}

export const metricsService = new MetricsService();
