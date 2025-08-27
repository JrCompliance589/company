interface SearchResult {
  id: string;
  name?: string;
  company_name?: string;
  CompanyName?: string;
  [key: string]: any;
}

interface SearchResponse {
  hits: SearchResult[];
  estimatedTotalHits: number;
  processingTimeMs: number;
  query: string;
}

class MeiliSearchService {
  private baseUrl: string;
  private indexName: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = 'http://meilisearch-fs4w0k88c4s0gwgs0sswwc8c.103.109.7.130.sslip.io:7700';
    this.indexName = 'sqldata';
    this.apiKey = 'aSampleMasterKey';
  }

  async search(query: string, limit: number = 10): Promise<SearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      console.log('Searching MeiliSearch with query:', query);
      
      const response = await fetch(`${this.baseUrl}/indexes/${this.indexName}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          q: query,
          limit: limit,
          attributesToRetrieve: ['*'], // Get all attributes
          attributesToHighlight: ['CompanyName', 'name', 'company_name'],
          filter: null,
          sort: null,
        }),
      });

      console.log('MeiliSearch response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`MeiliSearch API error: ${response.status} - ${response.statusText}`, errorText);
        throw new Error(`MeiliSearch API error: ${response.status} - ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      console.log('MeiliSearch response data:', data);
      
      return data.hits || [];
    } catch (error) {
      console.error('MeiliSearch search error:', error);
      throw error; // Re-throw to handle in component
    }
  }

  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const results = await this.search(query, limit);
      return results.map(result => {
        // Try different possible field names for company name
        return result.CompanyName || result.company_name || result.name || '';
      }).filter(Boolean);
    } catch (error) {
      console.error('MeiliSearch suggestions error:', error);
      return [];
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('MeiliSearch connection test failed:', error);
      return false;
    }
  }

  // Method to get index info to understand the data structure
  async getIndexInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/indexes/${this.indexName}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Index info:', data);
        return data;
      }
    } catch (error) {
      console.error('Failed to get index info:', error);
    }
    return null;
  }
}

export const meiliSearchService = new MeiliSearchService();
export type { SearchResult };
