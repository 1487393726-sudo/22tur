/**
 * Website System Performance Optimization
 * Implements code splitting, caching strategies, virtual scrolling, and bundle optimization
 */

/**
 * Cache configuration for different asset types
 */
export interface CacheConfig {
  maxAge: number; // in seconds
  sMaxAge?: number; // shared cache max age
  staleWhileRevalidate?: number; // serve stale while revalidating
  staleIfError?: number; // serve stale on error
}

/**
 * Cache control header configurations
 */
export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Static assets (images, fonts, etc.) - cache for 1 year
  static: {
    maxAge: 31536000,
    sMaxAge: 31536000,
  },
  // CSS and JS bundles - cache for 1 month
  bundle: {
    maxAge: 2592000,
    sMaxAge: 2592000,
  },
  // HTML pages - cache for 1 hour with stale-while-revalidate
  page: {
    maxAge: 3600,
    sMaxAge: 3600,
    staleWhileRevalidate: 86400,
  },
  // API responses - cache for 5 minutes
  api: {
    maxAge: 300,
    sMaxAge: 300,
    staleWhileRevalidate: 3600,
  },
  // No cache for dynamic content
  dynamic: {
    maxAge: 0,
    sMaxAge: 0,
  },
};

/**
 * Generate cache control header value
 */
export function generateCacheControlHeader(config: CacheConfig): string {
  const parts: string[] = [];

  if (config.maxAge === 0) {
    parts.push('no-cache', 'no-store', 'must-revalidate');
  } else {
    parts.push(`public`);
    parts.push(`max-age=${config.maxAge}`);

    if (config.sMaxAge !== undefined) {
      parts.push(`s-maxage=${config.sMaxAge}`);
    }

    if (config.staleWhileRevalidate !== undefined) {
      parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
    }

    if (config.staleIfError !== undefined) {
      parts.push(`stale-if-error=${config.staleIfError}`);
    }
  }

  return parts.join(', ');
}

/**
 * Get cache config for a file path
 */
export function getCacheConfigForPath(path: string): CacheConfig {
  if (path.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i)) {
    return CACHE_CONFIGS.static;
  }

  if (path.match(/\.(js|css)$/i)) {
    return CACHE_CONFIGS.bundle;
  }

  if (path.match(/\.(html)$/i)) {
    return CACHE_CONFIGS.page;
  }

  if (path.startsWith('/api/')) {
    return CACHE_CONFIGS.api;
  }

  return CACHE_CONFIGS.dynamic;
}

/**
 * Virtual scrolling configuration
 */
export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  bufferSize?: number;
  overscan?: number;
}

/**
 * Calculate visible range for virtual scrolling
 */
export interface VisibleRange {
  startIndex: number;
  endIndex: number;
  offsetY: number;
}

/**
 * Calculate which items should be rendered in virtual scrolling
 */
export function calculateVisibleRange(
  scrollTop: number,
  config: VirtualScrollConfig
): VisibleRange {
  const { itemHeight, containerHeight, bufferSize = 5, overscan = 3 } = config;

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    startIndex + visibleCount + overscan * 2,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
  );

  const offsetY = startIndex * itemHeight;

  return {
    startIndex,
    endIndex,
    offsetY,
  };
}

/**
 * Bundle size analyzer
 */
export interface BundleMetrics {
  totalSize: number;
  gzipSize: number;
  modules: ModuleMetric[];
}

export interface ModuleMetric {
  name: string;
  size: number;
  gzipSize: number;
  percentage: number;
}

/**
 * Estimate bundle size (in bytes)
 * This is a simplified estimation based on typical compression ratios
 */
export function estimateBundleSize(modules: Array<{ name: string; size: number }>): BundleMetrics {
  const totalSize = modules.reduce((sum, m) => sum + m.size, 0);
  const gzipSize = Math.round(totalSize * 0.3); // Typical gzip compression ratio

  const moduleMetrics: ModuleMetric[] = modules.map((m) => ({
    name: m.name,
    size: m.size,
    gzipSize: Math.round(m.size * 0.3),
    percentage: (m.size / totalSize) * 100,
  }));

  return {
    totalSize,
    gzipSize,
    modules: moduleMetrics,
  };
}

/**
 * Check if bundle size is within acceptable limits
 */
export function isBundleSizeAcceptable(bundleSize: number, limit: number = 200000): boolean {
  return bundleSize < limit;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  cls?: number; // Cumulative Layout Shift
  fid?: number; // First Input Delay
  ttfb?: number; // Time to First Byte
}

/**
 * Collect performance metrics from the browser
 */
export function collectPerformanceMetrics(): PerformanceMetrics {
  if (typeof window === 'undefined') {
    return {};
  }

  const metrics: PerformanceMetrics = {};

  // Get FCP and LCP from PerformanceObserver
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            metrics.fcp = entry.startTime;
          }
          if (entry.entryType === 'largest-contentful-paint') {
            metrics.lcp = entry.startTime;
          }
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            metrics.cls = (metrics.cls || 0) + (entry as any).value;
          }
        }
      });

      observer.observe({
        entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'],
      });
    } catch (e) {
      // Observer not supported
    }
  }

  // Get TTFB from navigation timing
  if ('performance' in window && 'navigation' in window.performance) {
    const navTiming = window.performance.timing;
    if (navTiming.responseStart && navTiming.fetchStart) {
      metrics.ttfb = navTiming.responseStart - navTiming.fetchStart;
    }
  }

  return metrics;
}

/**
 * Check if performance metrics meet targets
 */
export function meetsPerformanceTargets(metrics: PerformanceMetrics): boolean {
  const targets = {
    fcp: 1800, // 1.8 seconds
    lcp: 2500, // 2.5 seconds
    cls: 0.1, // 0.1 score
  };

  if (metrics.fcp !== undefined && metrics.fcp > targets.fcp) {
    return false;
  }

  if (metrics.lcp !== undefined && metrics.lcp > targets.lcp) {
    return false;
  }

  if (metrics.cls !== undefined && metrics.cls > targets.cls) {
    return false;
  }

  return true;
}

/**
 * Code splitting strategy
 */
export interface CodeSplitConfig {
  maxChunkSize: number; // in bytes
  minChunkSize: number; // in bytes
  strategy: 'size' | 'route' | 'component';
}

/**
 * Determine if a module should be code-split
 */
export function shouldCodeSplit(moduleSize: number, config: CodeSplitConfig): boolean {
  return moduleSize > config.minChunkSize && moduleSize < config.maxChunkSize;
}

/**
 * Dynamic import wrapper with error handling
 */
export async function dynamicImport<T>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    if (fallback) {
      console.warn('Dynamic import failed, using fallback:', error);
      return fallback;
    }
    throw error;
  }
}

/**
 * Prefetch a resource
 */
export function prefetchResource(url: string, type: 'script' | 'style' | 'image' = 'script'): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;

  if (type === 'script') {
    link.as = 'script';
  } else if (type === 'style') {
    link.as = 'style';
  } else if (type === 'image') {
    link.as = 'image';
  }

  document.head.appendChild(link);
}

/**
 * Preload a resource
 */
export function preloadResource(url: string, type: 'script' | 'style' | 'image' = 'script'): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;

  if (type === 'script') {
    link.as = 'script';
  } else if (type === 'style') {
    link.as = 'style';
  } else if (type === 'image') {
    link.as = 'image';
  }

  document.head.appendChild(link);
}

/**
 * Lazy load a script
 */
export function lazyLoadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Intersection Observer wrapper for lazy loading
 */
export function observeElement(
  element: Element,
  callback: (isVisible: boolean) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const observer = new IntersectionObserver(
    ([entry]) => {
      callback(entry.isIntersecting);
    },
    {
      threshold: 0.1,
      ...options,
    }
  );

  observer.observe(element);
  return observer;
}

/**
 * Request idle callback wrapper
 */
export function scheduleIdleTask(callback: () => void): number {
  if ('requestIdleCallback' in window) {
    return (window as any).requestIdleCallback(callback);
  }

  // Fallback to setTimeout
  return window.setTimeout(callback, 0);
}

/**
 * Cancel idle task
 */
export function cancelIdleTask(id: number): void {
  if ('cancelIdleCallback' in window) {
    (window as any).cancelIdleCallback(id);
  } else {
    window.clearTimeout(id);
  }
}
