import { getElasticsearchClient } from '@/lib/elasticsearch/client';
import type { IndexInfo, CreateIndexRequest, IndexSettings, IndexMappings } from '@/types/indices';

export class IndexService {
  private client = getElasticsearchClient();

  async listIndices(): Promise<IndexInfo[]> {
    const response = await this.client.cat.indices({
      format: 'json',
      h: 'health,status,index,uuid,pri,rep,docs.count,docs.deleted,store.size,pri.store.size',
    });
    return response as IndexInfo[];
  }

  async getIndex(name: string) {
    const response = await this.client.indices.get({
      index: name,
    });
    return response;
  }

  async createIndex(name: string, body?: CreateIndexRequest) {
    const response = await this.client.indices.create({
      index: name,
      body: body as any,
    });
    return response;
  }

  async deleteIndex(name: string) {
    const response = await this.client.indices.delete({
      index: name,
    });
    return response;
  }

  async closeIndex(name: string) {
    const response = await this.client.indices.close({
      index: name,
    });
    return response;
  }

  async openIndex(name: string) {
    const response = await this.client.indices.open({
      index: name,
    });
    return response;
  }

  async getSettings(name: string): Promise<Record<string, { settings: IndexSettings }>> {
    const response = await this.client.indices.getSettings({
      index: name,
    });
    return response as Record<string, { settings: IndexSettings }>;
  }

  async updateSettings(name: string, settings: Partial<IndexSettings>) {
    const response = await this.client.indices.putSettings({
      index: name,
      body: settings,
    });
    return response;
  }

  async getMappings(name: string): Promise<Record<string, { mappings: IndexMappings }>> {
    const response = await this.client.indices.getMapping({
      index: name,
    });
    return response as Record<string, { mappings: IndexMappings }>;
  }

  async updateMappings(name: string, mappings: IndexMappings) {
    const response = await this.client.indices.putMapping({
      index: name,
      body: mappings as any,
    });
    return response;
  }

  async refreshIndex(name: string) {
    const response = await this.client.indices.refresh({
      index: name,
    });
    return response;
  }

  async indexExists(name: string): Promise<boolean> {
    const response = await this.client.indices.exists({
      index: name,
    });
    return response;
  }
}

export const indexService = new IndexService();
