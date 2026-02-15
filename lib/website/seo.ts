/**
 * SEO Utilities for Website System
 * Handles SEO metadata generation and management
 */

import type { SEOMetadata } from '@/types/website';
import { seoConfig, websiteConfig } from './config';

/**
 * Generate SEO metadata for a page
 */
export function generateSEOMetadata(
  title: string,
  description: string,
  options?: {
    keywords?: string[];
    image?: string;
    url?: string;
    canonical?: string;
    structuredData?: Record<string, unknown>;
  }
): SEOMetadata {
  const url = options?.url || websiteConfig.siteUrl;
  const image = options?.image || seoConfig.defaultImage;

  return {
    title,
    description,
    keywords: options?.keywords || [],
    ogImage: image,
    ogUrl: url,
    canonicalUrl: options?.canonical || url,
    structuredData: options?.structuredData,
  };
}

/**
 * Generate Open Graph meta tags
 */
export function generateOpenGraphTags(metadata: SEOMetadata): Record<string, string> {
  return {
    'og:title': metadata.title,
    'og:description': metadata.description,
    'og:image': metadata.ogImage,
    'og:url': metadata.ogUrl,
    'og:type': 'website',
    'og:locale': seoConfig.locale,
  };
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterCardTags(metadata: SEOMetadata): Record<string, string> {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': metadata.title,
    'twitter:description': metadata.description,
    'twitter:image': metadata.ogImage,
    'twitter:creator': seoConfig.twitterHandle,
  };
}

/**
 * Generate structured data (JSON-LD)
 */
export function generateStructuredData(
  type: 'Organization' | 'LocalBusiness' | 'Article' | 'BreadcrumbList',
  data: Record<string, unknown>
): Record<string, unknown> {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  return {
    ...baseData,
    ...data,
  };
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema(): Record<string, unknown> {
  return generateStructuredData('Organization', {
    name: websiteConfig.siteName,
    url: websiteConfig.siteUrl,
    logo: `${websiteConfig.siteUrl}${websiteConfig.logo}`,
    description: websiteConfig.siteDescription,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: websiteConfig.contactInfo.phone,
      contactType: 'Customer Service',
    },
    sameAs: websiteConfig.socialLinks.map((link) => link.url),
  });
}

/**
 * Generate LocalBusiness structured data
 */
export function generateLocalBusinessSchema(): Record<string, unknown> {
  return generateStructuredData('LocalBusiness', {
    name: websiteConfig.siteName,
    url: websiteConfig.siteUrl,
    telephone: websiteConfig.contactInfo.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: websiteConfig.contactInfo.address,
    },
    openingHoursSpecification: websiteConfig.businessHours.map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.day,
      opens: hours.isClosed ? undefined : hours.openTime,
      closes: hours.isClosed ? undefined : hours.closeTime,
    })),
  });
}

/**
 * Generate Article structured data
 */
export function generateArticleSchema(
  title: string,
  description: string,
  author: string,
  publishDate: Date,
  image?: string
): Record<string, unknown> {
  return generateStructuredData('Article', {
    headline: title,
    description,
    image: image || seoConfig.defaultImage,
    author: {
      '@type': 'Person',
      name: author,
    },
    datePublished: publishDate.toISOString(),
    publisher: {
      '@type': 'Organization',
      name: websiteConfig.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${websiteConfig.siteUrl}${websiteConfig.logo}`,
      },
    },
  });
}

/**
 * Generate Breadcrumb structured data
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): Record<string, unknown> {
  return generateStructuredData('BreadcrumbList', {
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

/**
 * Generate sitemap entry
 */
export function generateSitemapEntry(
  url: string,
  lastmod?: Date,
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
  priority?: number
): Record<string, unknown> {
  return {
    url,
    lastmod: lastmod?.toISOString().split('T')[0],
    changefreq: changefreq || 'weekly',
    priority: priority || 0.8,
  };
}
