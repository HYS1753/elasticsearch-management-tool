import type {
  DocumentSearchRequest,
  DocumentSearchResponse,
  DocumentsIndexListResponse,
} from '@/types/document-explorer';

export async function fetchDocumentIndices(): Promise<DocumentsIndexListResponse> {
  const response = await fetch('/api/documents/indices', {
    method: 'GET',
    cache: 'no-store',
  });

  const result: DocumentsIndexListResponse = await response.json();

  if (!response.ok || result.code !== '200' || !result.data) {
    throw new Error(result.message || 'Failed to fetch document indices');
  }

  return result;
}

export async function searchDocuments(
  payload: DocumentSearchRequest
): Promise<DocumentSearchResponse> {
  const response = await fetch('/api/documents/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const result: DocumentSearchResponse = await response.json();

  if (!response.ok || result.code !== '200' || !result.data) {
    throw new Error(result.message || 'Failed to search documents');
  }

  return result;
}