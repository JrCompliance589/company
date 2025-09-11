interface SearchResult {
  id: string;
  name?: string;
  company_name?: string;
  CompanyName?: string;
  CIN?: string;
  Address?: string;
  dateOfIncorporation?: string;
  DateOfIncorporation?: string;
  DateofIncorporation?: string;
  authorisedCapital?: string;
  AuthorisedCapital?: string;
  paidUpCapital?: string;
  PaidUpCapital?: string;
  ROC?: string;
  RocName?: string;
  RegistrationNumber?: string;
  registerationNumber?: string;
  whetherListedOrNot?: string;
  CompanyListedOrNot?: string;
  state?: string;
  country?: string;
  JsonData?: string | object;
  CompanyType?: string;
  CompanyOrigin?: string;
  CompanyCategory?: string;
  CompanySubCategory?: string;
  ClassOfCompany?: string;
  LlpStatus?: string;
  SubscribedCapital?: string;
  CompanyEmail?: string;
  Created_at?: string;
  CompanyStatus?: string;
  Website?: string;           // Add Website field
  Logo_Base64?: string;       // Add Logo_Base64 field
  [key: string]: any;
}

interface SearchResponse {
  hits: SearchResult[];
  estimatedTotalHits: number;
  processingTimeMs: number;
  query: string;
}

// Utility class for handling logo conversion and display
class LogoUtils {
  /**
   * Convert base64 string to blob URL for display
   */
  static base64ToImageUrl(base64String: string, mimeType: string = 'image/webp'): string {
    try {
      // Remove data URL prefix if present
      const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Convert base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create blob and return object URL
      const blob = new Blob([bytes], { type: mimeType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error converting base64 to image URL:', error);
      return '';
    }
  }

  /**
   * Convert base64 to downloadable image blob
   */
  static base64ToBlob(base64String: string, mimeType: string = 'image/png'): Blob | null {
    try {
      const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      return new Blob([bytes], { type: mimeType });
    } catch (error) {
      console.error('Error converting base64 to blob:', error);
      return null;
    }
  }

  /**
   * Download logo as PNG/JPG file
   */
  static downloadLogo(base64String: string, filename: string, format: 'png' | 'jpg' = 'png'): void {
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const blob = this.base64ToBlob(base64String, mimeType);
    
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get image dimensions from base64
   */
  static getImageDimensions(base64String: string): Promise<{width: number, height: number}> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = this.base64ToImageUrl(base64String);
    });
  }

  /**
   * Cleanup blob URLs to prevent memory leaks
   */
  static cleanupImageUrl(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
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
      const response = await fetch(`${this.baseUrl}/indexes/${this.indexName}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          q: query,
          limit: limit,
          attributesToRetrieve: ['*'], // Get all attributes including Website and Logo_Base64
          attributesToHighlight: ['CompanyName', 'name', 'company_name'],
          filter: null,
          sort: null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`MeiliSearch API error: ${response.status} - ${response.statusText}`, errorText);
        throw new Error(`MeiliSearch API error: ${response.status} - ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      return data.hits || [];
    } catch (error) {
      console.error('MeiliSearch search error:', error);
      throw error;
    }
  }

  async getCompanyByCIN(cin: string): Promise<SearchResult | null> {
    if (!cin.trim()) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/indexes/${this.indexName}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          q: cin,
          limit: 1,
          attributesToRetrieve: ['*'], // Include all fields
          filter: null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`MeiliSearch API error: ${response.status} - ${response.statusText}`, errorText);
        throw new Error(`MeiliSearch API error: ${response.status} - ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      return data.hits && data.hits.length > 0 ? data.hits[0] : null;
    } catch (error) {
      console.error('MeiliSearch CIN search error:', error);
      throw error;
    }
  }

  /**
   * Enhanced method to get company with processed logo URL
   */
  async getCompanyWithLogo(cin: string): Promise<(SearchResult & { logoImageUrl?: string }) | null> {
    const company = await this.getCompanyByCIN(cin);
    
    if (!company) return null;

    // Convert base64 logo to blob URL if available
    if (company.Logo_Base64) {
      try {
        company.logoImageUrl = LogoUtils.base64ToImageUrl(company.Logo_Base64);
      } catch (error) {
        console.error('Failed to convert logo to image URL:', error);
      }
    }

    return company;
  }

  /**
   * Get company website URL with validation
   */
  getCompanyWebsite(company: SearchResult): string | null {
    if (!company.Website) return null;
    
    const website = company.Website.trim();
    if (!website) return null;
    
    // Add protocol if missing
    if (!website.startsWith('http://') && !website.startsWith('https://')) {
      return `https://${website}`;
    }
    
    return website;
  }

  /**
   * Check if company has logo
   */
  hasLogo(company: SearchResult): boolean {
    return !!(company.Logo_Base64 && company.Logo_Base64.trim());
  }

  /**
   * Get logo file size in KB
   */
  getLogoSize(company: SearchResult): number | null {
    if (!company.Logo_Base64) return null;
    
    try {
      const base64Data = company.Logo_Base64.replace(/^data:image\/[a-z]+;base64,/, '');
      const bytes = Math.ceil(base64Data.length * 0.75); // Approximate byte size
      return Math.round(bytes / 1024); // Convert to KB
    } catch (error) {
      return null;
    }
  }

  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const results = await this.search(query, limit);
      return results.map(result => {
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
        return data;
      }
    } catch (error) {
      console.error('Failed to get index info:', error);
    }
    return null;
  }

  async getAllCompanies(limit: number = 10000): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/indexes/${this.indexName}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          q: '',
          limit: limit,
          attributesToRetrieve: ['CompanyName', 'CIN', 'Created_at', 'DateOfIncorporation', 'Website', 'Logo_Base64'],
          filter: null,
          sort: null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`MeiliSearch API error: ${response.status} - ${response.statusText}`, errorText);
        throw new Error(`MeiliSearch API error: ${response.status} - ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      return data.hits || [];
    } catch (error) {
      console.error('MeiliSearch getAllCompanies error:', error);
      throw error;
    }
  }

  /**
   * Get companies with logos only
   */
  async getCompaniesWithLogos(limit: number = 100): Promise<SearchResult[]> {
    try {
      const companies = await this.getAllCompanies(limit);
      return companies.filter(company => this.hasLogo(company));
    } catch (error) {
      console.error('Error fetching companies with logos:', error);
      return [];
    }
  }

  /**
   * Get companies with websites only
   */
  async getCompaniesWithWebsites(limit: number = 100): Promise<SearchResult[]> {
    try {
      const companies = await this.getAllCompanies(limit);
      return companies.filter(company => company.Website && company.Website.trim());
    } catch (error) {
      console.error('Error fetching companies with websites:', error);
      return [];
    }
  }
}

// Export both the service and utility classes
export const meiliSearchService = new MeiliSearchService();
export { LogoUtils };
export type { SearchResult };