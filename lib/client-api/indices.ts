import type { IndicesPlacementResponse } from '@/types/indices-placement';
import type { IndicesListResponse } from '@/types/indices-list';
import type { IndexDetailResponse, IndexDetailData } from '@/types/index-detail';
import type {
  ExecuteIndexActionRequest,
  IndexActionResponse,
  IndexActionResult,
} from '@/types/index-action';

/**
 * Fetch indices placement data (shard allocation across nodes)
 */
export async function fetchIndicesPlacement(
  includeHidden: boolean,
  includeClosed: boolean
): Promise<IndicesPlacementResponse> {
  const params = new URLSearchParams({
    include_hidden_index: includeHidden.toString(),
    include_closed_index: includeClosed.toString(),
  });

  const response = await fetch(`/api/indices/indices-placement?${params}`);
  const result: IndicesPlacementResponse = await response.json();

  if (response.ok && result.code === '200') {
    return result;
  }

  throw new Error(result.message || 'Failed to fetch indices placement');
}

/**
 * Fetch indices list data (table view with health, status, etc.)
 */
export async function fetchIndicesList(
  includeHidden: boolean,
  includeClosed: boolean
): Promise<IndicesListResponse> {
  const params = new URLSearchParams({
    include_hidden_index: includeHidden.toString(),
    include_closed_index: includeClosed.toString(),
  });

  const response = await fetch(`/api/indices/list?${params}`);
  const result: IndicesListResponse = await response.json();

  if (response.ok && result.code === '200') {
    return result;
  }

  throw new Error(result.message || 'Failed to fetch indices list');
}

export async function getIndexDetail(indexName: string): Promise<IndexDetailData> {
  const response = await fetch(`/api/indices/${encodeURIComponent(indexName)}`, {
    method: 'GET',
    cache: 'no-store',
  });

  const result: IndexDetailResponse = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to fetch index detail');
  }

  return result.data;
}

export async function executeIndexAction(
  indexName: string,
  payload: ExecuteIndexActionRequest
): Promise<IndexActionResult> {
  const response = await fetch(`/api/indices/${encodeURIComponent(indexName)}/actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result: IndexActionResponse = await response.json();

  if (!response.ok || result.code !== '200' || !result.data) {
    throw new Error(result.message || 'Failed to execute index action');
  }

  return result.data;
}