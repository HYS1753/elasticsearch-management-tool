import { Client } from '@elastic/elasticsearch';

let esClient: Client | null = null;

export function getElasticsearchClient(): Client {
  if (!esClient) {
    const node = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
    const username = process.env.ELASTICSEARCH_USERNAME;
    const password = process.env.ELASTICSEARCH_PASSWORD;
    const apiKey = process.env.ELASTICSEARCH_API_KEY;

    const auth: any = {};
    
    if (apiKey) {
      auth.apiKey = apiKey;
    } else if (username && password) {
      auth.username = username;
      auth.password = password;
    }

    esClient = new Client({
      node,
      auth: Object.keys(auth).length > 0 ? auth : undefined,
      tls: {
        rejectUnauthorized: process.env.ELASTICSEARCH_TLS_REJECT_UNAUTHORIZED !== 'false',
      },
    });
  }

  return esClient;
}

export function closeElasticsearchClient() {
  if (esClient) {
    esClient.close();
    esClient = null;
  }
}
