import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://verifyvista.com';
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');

// Static pages configuration
const STATIC_PAGES = [
  {
    loc: '/',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: '1.0'
  },
  {
    loc: '/pricing',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    loc: '/about',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.6'
  },
  {
    loc: '/contact',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.6'
  },
  {
    loc: '/privacy',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'yearly',
    priority: '0.3'
  },
  {
    loc: '/terms',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'yearly',
    priority: '0.3'
  }
];

// Function to generate XML sitemap
function generateSitemap(companyUrls = []) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';
  
  // Add static pages
  STATIC_PAGES.forEach(page => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${page.loc}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n\n`;
  });
  
  // Add company profile pages
  companyUrls.forEach(company => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/company/${encodeURIComponent(company.name)}/${company.cin}</loc>\n`;
    xml += `    <lastmod>${company.lastmod || new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n\n`;
  });
  
  xml += '</urlset>';
  return xml;
}

// Function to fetch company data from MeiliSearch
async function fetchCompanyUrls() {
  try {
    console.log('Fetching companies from MeiliSearch...');
    
    // MeiliSearch configuration
    const baseUrl = 'https://meilisearch.verifyvista.com/';
    const indexName = 'sqldata';
    const apiKey = 'aSampleMasterKey';
    
    let allCompanies = [];
    let offset = 0;
    const limit = 1000; // Fetch in batches of 1000
    let hasMore = true;
    
    // Fetch companies in batches to handle large datasets
    while (hasMore) {
      console.log(`Fetching batch ${Math.floor(offset / limit) + 1} (offset: ${offset})...`);
      
      const response = await fetch(`${baseUrl}/indexes/${indexName}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          q: '', // Empty query to get all companies
          limit: limit,
          offset: offset,
          attributesToRetrieve: ['CompanyName', 'CIN', 'Created_at', 'DateOfIncorporation'],
          filter: null,
          sort: null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`MeiliSearch API error: ${response.status} - ${response.statusText}`, errorText);
        throw new Error(`MeiliSearch API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const companies = data.hits || [];
      
      if (companies.length === 0) {
        hasMore = false;
      } else {
        allCompanies = allCompanies.concat(companies);
        offset += limit;
        
        // Safety check to prevent infinite loops
        if (offset > 100000) { // Max 100,000 companies
          console.warn('Reached maximum limit of 100,000 companies. Stopping fetch.');
          hasMore = false;
        }
      }
    }
    
    console.log(`Found ${allCompanies.length} companies in MeiliSearch`);
    
    // Map the companies to sitemap format
    return allCompanies.map(company => {
      // Get company name from various possible fields
      const companyName = company.CompanyName || company.company_name || company.name || 'Unknown Company';
      
      // Get CIN
      const cin = company.CIN || company.cin || '';
      
      // Get last modified date (use Created_at or DateOfIncorporation)
      let lastmod = null;
      if (company.Created_at) {
        lastmod = new Date(company.Created_at).toISOString().split('T')[0];
      } else if (company.DateOfIncorporation) {
        lastmod = new Date(company.DateOfIncorporation).toISOString().split('T')[0];
      } else {
        lastmod = new Date().toISOString().split('T')[0]; // Default to today
      }
      
      return {
        name: companyName,
        cin: cin,
        lastmod: lastmod
      };
    }).filter(company => company.name && company.cin); // Filter out companies without name or CIN
    
  } catch (error) {
    console.error('Error fetching company data from MeiliSearch:', error);
    return [];
  }
}

// Main function
async function main() {
  try {
    console.log('Generating sitemap...');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Output file: ${OUTPUT_FILE}`);
    
    // Fetch company URLs from MeiliSearch
    const companyUrls = await fetchCompanyUrls();
    
    if (companyUrls.length === 0) {
      console.warn('No company URLs found. Generating sitemap with static pages only.');
    }
    
    // Generate sitemap XML
    const sitemapXml = generateSitemap(companyUrls);
    
    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write to file
    fs.writeFileSync(OUTPUT_FILE, sitemapXml, 'utf8');
    
    console.log(`\n✅ Sitemap generated successfully!`);
    console.log(`📁 Location: ${OUTPUT_FILE}`);
    console.log(`📊 Statistics:`);
    console.log(`   - Static pages: ${STATIC_PAGES.length}`);
    console.log(`   - Company pages: ${companyUrls.length}`);
    console.log(`   - Total URLs: ${STATIC_PAGES.length + companyUrls.length}`);
    
    // Validate sitemap size
    const fileSize = fs.statSync(OUTPUT_FILE).size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    console.log(`📏 File size: ${fileSizeMB} MB`);
    
    if (fileSize > 50 * 1024 * 1024) { // 50MB limit
      console.warn('⚠️  Warning: Sitemap is larger than 50MB. Consider splitting into multiple sitemaps.');
    }
    
    if (STATIC_PAGES.length + companyUrls.length > 50000) {
      console.warn('⚠️  Warning: Sitemap has more than 50,000 URLs. Consider splitting into multiple sitemaps.');
    }
    
    console.log(`\n🚀 Next steps:`);
    console.log(`   1. Submit sitemap to Google Search Console: ${BASE_URL}/sitemap.xml`);
    console.log(`   2. Add to robots.txt: Sitemap: ${BASE_URL}/sitemap.xml`);
    console.log(`   3. Monitor indexing in Google Search Console`);
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Check if this module is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateSitemap, fetchCompanyUrls };