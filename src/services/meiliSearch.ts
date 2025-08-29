interface SearchResult {
  id: string;
  name?: string;
  company_name?: string;
  CompanyName?: string;
  CIN?: string;
  Address?: string;
  dateOfIncorporation?: string;
  DateofIncorporation?: string;
  authorisedCapital?: string;
  AuthorisedCapital?: string;
  paidUpCapital?: string;
  PaidUpCapital?: string;
  ROC?: string;
  registerationNumber?: string;
  whetherListedOrNot?: string;
  state?: string;
  country?: string;
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
    this.baseUrl = 'https://meilisearch.verifyvista.com/';
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

  async getCompanyByCIN(cin: string): Promise<SearchResult | null> {
    if (!cin.trim()) {
      return null;
    }

    try {
      console.log('Fetching company by CIN:', cin);
      
      const response = await fetch(`${this.baseUrl}/indexes/${this.indexName}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          q: cin,
          limit: 1,
          attributesToRetrieve: ['*'],
          // Try without filter first, then with filter if needed
          filter: null,
        }),
      });

      console.log('MeiliSearch CIN search response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`MeiliSearch API error: ${response.status} - ${response.statusText}`, errorText);
        throw new Error(`MeiliSearch API error: ${response.status} - ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      console.log('MeiliSearch CIN search response data:', data);
      
      return data.hits && data.hits.length > 0 ? data.hits[0] : null;
    } catch (error) {
      console.error('MeiliSearch CIN search error:', error);
      throw error;
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
