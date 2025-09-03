export type CompanySeoData = {
  name: string;
  cin?: string;
  description?: string;
  logoUrl?: string;
  state?: string;
  industry?: string;
};

function ensureMetaTag(attrName: 'name' | 'property', attrValue: string): HTMLMetaElement {
  let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrName, attrValue);
    document.head.appendChild(tag);
  }
  return tag;
}

function setTagContent(attrName: 'name' | 'property', attrValue: string, content: string | undefined) {
  if (!content) return;
  const tag = ensureMetaTag(attrName, attrValue);
  tag.setAttribute('content', content);
}

export function setCompanyPageSEO(data: CompanySeoData) {
  const siteName = 'Verifyvista';
  const title = `${data.name} – Company Profile | ${siteName}`;
  const url = window.location.href;
  const image = data.logoUrl || '/veri.png';
  const baseDescription = data.description || `Explore ${data.name}'s company profile, directors, key indicators, compliance and more.`;

  // Title
  document.title = title;

  // Basic meta
  setTagContent('name', 'description', baseDescription);
  setTagContent('name', 'keywords', `${data.name}, company profile, ${data.industry || 'industry'}, ${data.state || 'india'}, directors, financials, CIN ${data.cin || ''}`);
  setTagContent('name', 'robots', 'index, follow');

  // Open Graph
  setTagContent('property', 'og:type', 'website');
  setTagContent('property', 'og:title', title);
  setTagContent('property', 'og:description', baseDescription);
  setTagContent('property', 'og:image', image);
  setTagContent('property', 'og:url', url);

  // Twitter
  setTagContent('name', 'twitter:card', 'summary_large_image');
  setTagContent('name', 'twitter:title', title);
  setTagContent('name', 'twitter:description', baseDescription);
  setTagContent('name', 'twitter:image', image);

  // Canonical link
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
}

export function resetToDefaultSEO() {
  const defaultTitle = 'Verifyvista - Company Profile & Business Intelligence';
  document.title = defaultTitle;
  // Do not aggressively remove tags; keep defaults from index.html.
}


