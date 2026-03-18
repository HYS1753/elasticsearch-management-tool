import type {
  QueryExplainSummaryRequest,
  QueryExplainDetailRequest,
  QueryExplainSummaryResponse,
  QueryExplainDetailResponse,
} from '@/types/query-explain';

interface QueryExplainSummaryApiResponse {
  code: string;
  message: string;
  data: QueryExplainSummaryResponse;
}

interface QueryExplainDetailApiResponse {
  code: string;
  message: string;
  data: QueryExplainDetailResponse;
}

export class QueryExplainService {
  private apiUrl = process.env.NEXT_PUBLIC_CLUSTER_API_URL;

  async getExplainSummary(
    payload: QueryExplainSummaryRequest
  ): Promise<QueryExplainSummaryApiResponse> {
    const response = await fetch(`${this.apiUrl}/app/search/explain/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const text = await response.text();

    let result: QueryExplainSummaryApiResponse;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response from upstream: ${text.slice(0, 300)}`);
    }

    if (!response.ok) {
      throw new Error(result?.message || `Failed to fetch explain summary: ${response.statusText}`);
    }

    if (result.code === '200' && result.data) {
      return result;
    }

    throw new Error(result.message || 'Failed to fetch explain summary');
  }

  async getExplainDetail(
    payload: QueryExplainDetailRequest
  ): Promise<QueryExplainDetailApiResponse> {
    const response = await fetch(`${this.apiUrl}/app/search/explain/detail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const text = await response.text();

    let result: QueryExplainDetailApiResponse;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response from upstream: ${text.slice(0, 300)}`);
    }

    if (!response.ok) {
      throw new Error(result?.message || `Failed to fetch explain detail: ${response.statusText}`);
    }

    if (result.code === '200' && result.data) {
      return result;
    }

    throw new Error(result.message || 'Failed to fetch explain detail');
  }
}

export const queryExplainService = new QueryExplainService();