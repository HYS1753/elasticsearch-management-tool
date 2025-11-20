import type { IndicesPlacementResponse } from '@/types/indices-placement';

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
}

export const indicesService = new IndicesService();
