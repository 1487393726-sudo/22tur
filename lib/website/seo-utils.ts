/**
 * SEO Utilities
 * Utilities for SEO optimization including meta tags, sitemap, and structured data
 */

import { websiteConfig, seoConfig } from './config';

/**
 * SEO Metadata interface
 */
export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  structuredData?: Record<string, unknown>;
}

/**
 * Generate meta tags HTML
 */
export function generateMetaTags(metadata: SEOMetadata): string {
  const {
    title,
    description,
    keywords = [],
    ogImage = seoConfig.defaultImage,
    ogUrl = websiteConfig.siteUrl,
    canonical = websiteConfig.siteUrl,
  } = metadata;

  const tags: string[] = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="keywords" content="${escapeHtml(keywords.join(', '))}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
    `<meta property="og:url" content="${escapeHtml(ogUrl)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
  ];

  return tags.join('\n');
}

/**
 * Validate meta description length (50-160 characters)
 */
export function isValidMetaDescription(description: string): boolean {
  return description.length >= 50 && description.length <= 160;
}

/**
 * Generate sitemap entry
 */
export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate sitemap XML
 */
export function generateSitemap(entries: SitemapEntry[]): string {
  const urlEntries = entries
    .map((entry) => {
      let xml = `  <url>\n    <loc>${escapeHtml(entry.url)}</loc>\n`;

      if (entry.lastmod) {
        xml += `    <lastmod>${escapeHtml(entry.lastmod)}</lastmod>\n`;
      }

      if (entry.changefreq) {
        xml += `    <changefreq>${escapeHtml(entry.changefreq)}</changefreq>\n`;
      }

      if (entry.priority !== undefined) {
        xml += `    <priority>${entry.priority}</priority>\n`;
      }

      xml += `  </url>\n`;
      return xml;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}</urlset>`;
}

/**
 * Generate JSON-LD structured data
 */
export function generateJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data);
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: websiteConfig.siteName,
    url: websiteConfig.siteUrl,
    logo: websiteConfig.logo,
    description: websiteConfig.siteDescription,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: websiteConfig.contactInfo.phone,
      contactType: 'Customer Service',
    },
    sameAs: websiteConfig.socialLinks.map((link) => link.url),
  };
}

/**
 * Generate LocalBusiness schema
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: websiteConfig.siteName,
    image: websiteConfig.logo,
    description: websiteConfig.siteDescription,
    address: {
      '@type': 'PostalAddress',
      streetAddress: websiteConfig.contactInfo.address,
    },
    telephone: websiteConfig.contactInfo.phone,
    email: websiteConfig.contactInfo.email,
    url: websiteConfig.siteUrl,
    openingHoursSpecification: websiteConfig.businessHours.map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.day,
      opens: hours.isClosed ? undefined : hours.openTime,
      closes: hours.isClosed ? undefined : hours.closeTime,
    })),
  };
}

/**
 * Generate Article schema
 */
export function generateArticleSchema(article: {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.author || websiteConfig.siteName,
    },
  };
}

/**
 * Validate heading hierarchy
 */
export function validateHeadingHierarchy(headings: string[]): boolean {
  if (headings.length === 0) return true;

  // Extract heading levels (h1, h2, h3, etc.)
  const levels = headings.map((h) => {
    const match = h.match(/^h(\d)/i);
    return match ? parseInt(match[1], 10) : 0;
  });

  // Check for proper hierarchy (no skipping levels)
  for (let i = 1; i < levels.length; i++) {
    const currentLevel = levels[i];
    const previousLevel = levels[i - 1];

    // Level should not skip more than 1 level down
    if (currentLevel > previousLevel + 1) {
      return false;
    }
  }

  return true;
}

/**
 * Extract headings from HTML
 */
export function extractHeadings(html: string): string[] {
  const headingRegex = /<h([1-6])[^>]*>([^<]*)<\/h\1>/gi;
  const headings: string[] = [];
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    headings.push(`h${match[1]}`);
  }

  return headings;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Validate structured data
 */
export function validateStructuredData(data: Record<string, unknown>): boolean {
  try {
    // Check if it's valid JSON
    JSON.stringify(data);

    // Check for required @context and @type
    if (!data['@context'] || !data['@type']) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  const baseUrl = websiteConfig.siteUrl;
  return `${baseUrl}${path}`;
}

/**
 * Check if URL is canonical
 */
export function isCanonicalUrl(url: string, canonical: string): boolean {
  return url === canonical;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /private

Sitemap: ${websiteConfig.siteUrl}${websiteConfig.contactInfo.sitemapUrl}`;
}

/**
 * Validate SEO metadata
 */
export function validateSEOMetadata(metadata: SEOMetadata): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!metadata.title || metadata.title.length === 0) {
    errors.push('Title is required');
  }

  if (!metadata.description || !isValidMetaDescription(metadata.description)) {
    errors.push('Description must be between 50 and 160 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
