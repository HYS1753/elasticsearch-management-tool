import type {
  DocumentSearchRequest,
  DocumentSearchResponse,
  DocumentsIndexListResponse,
} from '@/types/document-explorer';

export class DocumentsService {
  private apiUrl = process.env.CLUSTER_API_URL;

  async getDocumentIndices(): Promise<DocumentsIndexListResponse> {
    const response = await fetch(`${this.apiUrl}/app/documents/indices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch document indices: ${response.statusText}`;

      try {
        const errorResult = await response.json();
        errorMessage = errorResult?.message || errorMessage;
      } catch {
        // ignore
      }

      throw new Error(errorMessage);
    }

    const result: DocumentsIndexListResponse = await response.json();

    if (result.code === '200' && result.data) {
      return result;
    }

    throw new Error(result.message || 'Failed to fetch document indices');
  }

  async searchDocuments(payload: DocumentSearchRequest): Promise<DocumentSearchResponse> {
    const response = await fetch(`${this.apiUrl}/app/documents/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorMessage = `Failed to search documents: ${response.statusText}`;

      try {
        const errorResult = await response.json();
        errorMessage = errorResult?.message || errorMessage;
      } catch {
        // ignore
      }

      throw new Error(errorMessage);
    }

    const result: DocumentSearchResponse = await response.json();

    if (result.code === '200' && result.data) {
      return result;
    }

    throw new Error(result.message || 'Failed to search documents');
  }
}

export const documentsService = new DocumentsService();