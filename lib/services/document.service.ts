import { getElasticsearchClient } from '../elasticsearch/client';
import type {
  SearchRequest,
  SearchResponse,
  IndexDocumentRequest,
  UpdateDocumentRequest,
  DeleteDocumentRequest,
  BulkRequest,
  BulkResponse,
} from '@/types/document';

export class DocumentService {
  private client = getElasticsearchClient();

  async search<T = any>(params: SearchRequest): Promise<SearchResponse<T>> {
    const { index, query, from, size, sort, _source, aggs } = params;
    
    const body: any = {};
    if (query) body.query = query;
    if (from !== undefined) body.from = from;
    if (size !== undefined) body.size = size;
    if (sort) body.sort = sort;
    if (_source !== undefined) body._source = _source;
    if (aggs) body.aggs = aggs;

    const response = await this.client.search({
      index,
      body,
    });

    return response as SearchResponse<T>;
  }

  async getDocument<T = any>(index: string, id: string) {
    const response = await this.client.get({
      index,
      id,
    });
    return {
      _index: response._index,
      _id: response._id,
      _version: response._version,
      _source: response._source as T,
    };
  }

  async indexDocument<T = any>(params: IndexDocumentRequest<T>) {
    const { index, id, document, refresh } = params;
    
    const response = await this.client.index({
      index,
      id,
      body: document,
      refresh,
    });

    return response;
  }

  async updateDocument<T = any>(params: UpdateDocumentRequest<T>) {
    const { index, id, doc, script, refresh } = params;
    
    const body: any = {};
    if (doc) body.doc = doc;
    if (script) body.script = script;

    const response = await this.client.update({
      index,
      id,
      body,
      refresh,
    });

    return response;
  }

  async deleteDocument(params: DeleteDocumentRequest) {
    const { index, id, refresh } = params;
    
    const response = await this.client.delete({
      index,
      id,
      refresh,
    });

    return response;
  }

  async bulkOperation(params: BulkRequest): Promise<BulkResponse> {
    const { operations, refresh } = params;
    
    const response = await this.client.bulk({
      body: operations,
      refresh,
    });

    return response as BulkResponse;
  }

  async count(index: string, query?: any): Promise<number> {
    const response = await this.client.count({
      index,
      body: query ? { query } : undefined,
    });

    return response.count;
  }

  async deleteByQuery(index: string, query: any) {
    const response = await this.client.deleteByQuery({
      index,
      body: { query },
    });

    return response;
  }

  async updateByQuery(index: string, query: any, script: any) {
    const response = await this.client.updateByQuery({
      index,
      body: {
        query,
        script,
      },
    });

    return response;
  }
}

export const documentService = new DocumentService();
