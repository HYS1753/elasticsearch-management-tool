import type { SearchDictionaryRequest, DictionaryListResponse, DictionaryEntity, ApiResponse } from '@/types/dictionary';

export async function searchDictionary(
  type: string,
  payload: SearchDictionaryRequest
): Promise<DictionaryListResponse<any>> {
  const response = await fetch(`/api/dictionary/${type}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const result: ApiResponse<DictionaryListResponse<any>> = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error?.message || `Failed to search dictionary ${type}`);
  }

  return result.data;
}

export async function createDictionaryEntry(
  type: string,
  payload: any
): Promise<DictionaryEntity> {
  const response = await fetch(`/api/dictionary/${type}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<DictionaryEntity> = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error?.message || `Failed to create entry in ${type}`);
  }

  return result.data;
}

export async function updateDictionaryEntry(
  type: string,
  key: string,
  payload: any
): Promise<DictionaryEntity> {
  const response = await fetch(`/api/dictionary/${type}/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<DictionaryEntity> = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error?.message || `Failed to update entry in ${type}`);
  }

  return result.data;
}

export async function deleteDictionaryEntry(
  type: string,
  key: string
): Promise<boolean> {
  const response = await fetch(`/api/dictionary/${type}/${encodeURIComponent(key)}`, {
    method: 'DELETE',
  });

  const result: ApiResponse<boolean> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error?.message || `Failed to delete entry in ${type}`);
  }

  return true;
}
