import type { IndicesPlacementResponse } from '@/types/indices-placement';
import type { IndicesListResponse } from '@/types/indices-list';
import type { IndexDetailResponse, IndexDetailData } from '@/types/index-detail';

export class IndicesService {
  private apiUrl = process.env.CLUSTER_API_URL;

  async getIndicesPlacement(
    includeHiddenIndex: boolean = false,
    includeClosedIndex: boolean = false
  ): Promise<IndicesPlacementResponse> {
    const params = new URLSearchParams({
      include_hidden_index: includeHiddenIndex.toString(),
      include_closed_index: includeClosedIndex.toString(),
    });

    const response = await fetch(`${this.apiUrl}/app/indices/indices-placement?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch indices placement: ${response.statusText}`);
    }

    const result: IndicesPlacementResponse = await response.json();

    if (result.code === '200' && result.data) {
      return result;
    }

    throw new Error(result.message || 'Failed to fetch indices placement');
  }

  async getIndicesList(
    includeHiddenIndex: boolean = false,
    includeClosedIndex: boolean = false
  ): Promise<IndicesListResponse> {
    const params = new URLSearchParams({
      include_hidden_index: includeHiddenIndex.toString(),
      include_closed_index: includeClosedIndex.toString(),
    });

    const response = await fetch(`${this.apiUrl}/app/indices/indices?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch indices list: ${response.statusText}`);
    }

    const result: IndicesListResponse = await response.json();

    if (result.code === '200' && result.data) {
      return result;
    }

    throw new Error(result.message || 'Failed to fetch indices list');
  }

  async getIndexDetail(indexName: string): Promise<IndexDetailData> {
    const response = await fetch(
      `${this.apiUrl}/app/indices/indices/${encodeURIComponent(indexName)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      let errorMessage = `Failed to fetch index detail: ${response.statusText}`;

      try {
        const errorResult = await response.json();
        errorMessage = errorResult?.message || errorMessage;
      } catch {
        // ignore json parse error
      }

      throw new Error(errorMessage);
    }

    const result: IndexDetailResponse = await response.json();

    if (result.code === '200' && result.data) {
      return result.data;
    }

    throw new Error(result.message || 'Failed to fetch index detail');
  }
}

export const indicesService = new IndicesService();