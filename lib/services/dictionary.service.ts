import type { DictionaryListResponse, DictionaryEntity, SearchDictionaryRequest } from '@/types/dictionary';

export class DictionaryService {
  private apiUrl = process.env.CLUSTER_API_URL;

  async search(type: string, params: SearchDictionaryRequest): Promise<DictionaryListResponse<any>> {
    const { keyword = '', skip = 0, limit = 100, sort_by = 'index', sort_order = -1, isAdmin = false } = params;
    const searchPath = isAdmin ? 'admin/search' : 'search';
    
    const query = new URLSearchParams({
      keyword,
      skip: skip.toString(),
      limit: limit.toString(),
      sort_by,
      sort_order: sort_order.toString()
    });

    const response = await fetch(`${this.apiUrl}/app/dictionaries/${type}/${searchPath}?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      cache: 'no-store',
    });

    const text = await response.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response from upstream: ${text.slice(0, 300)}`);
    }

    if (!response.ok) {
      throw new Error(result?.message || `Failed to fetch dictionary ${type}`);
    }

    return result as DictionaryListResponse<any>;
  }

  async create(type: string, payload: any): Promise<any> {
    const response = await fetch(`${this.apiUrl}/app/dictionaries/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let result;
    try { result = JSON.parse(text); } catch { throw new Error(`Invalid JSON response`); }

    if (!response.ok) throw new Error(result?.message || `Failed to create dictionary entry`);
    return result;
  }

  async update(type: string, key: string, payload: any): Promise<any> {
    const response = await fetch(`${this.apiUrl}/app/dictionaries/${type}/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let result;
    try { result = JSON.parse(text); } catch { throw new Error(`Invalid JSON response`); }

    if (!response.ok) throw new Error(result?.message || `Failed to update dictionary entry`);
    return result;
  }

  async remove(type: string, key: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/app/dictionaries/${type}/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: {
        accept: 'application/json',
      },
    });

    const text = await response.text();
    let result;
    try { result = JSON.parse(text); } catch { throw new Error(`Invalid JSON response`); }

    if (!response.ok) throw new Error(result?.message || `Failed to delete dictionary entry`);
    return result;
  }
}

export const dictionaryService = new DictionaryService();
