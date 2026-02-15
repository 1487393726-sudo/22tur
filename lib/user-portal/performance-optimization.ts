/**
 * Performance Optimization Utilities for User Portal
 * Handles code splitting, lazy loading, and performance monitoring
 */

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  ttfb: number; // Time to First Byte
  loadTime: number; // Total page load time
}

export interface LazyLoadConfig {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
}

export interface CodeSplitConfig {
  chunkName: string;
  maxSize?: number;
  minSize?: number;
}

/**
 * Measure Web Vitals
 */
export function measureWebVitals(): PerformanceMetrics {
  const metrics: PerformanceMetrics = {
    fcp: 0,
    lcp: 0,
    cls: 0,
    fid: 0,
    ttfb: 0,
    loadTime: 0,
  };

  if (typeof window === 'undefined') {
    return metrics;
  }

  // First Contentful Paint
  const paintEntries = performance.getEntriesByType('paint');
  const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
  if (fcp) {
    metrics.fcp = fcp.startTime;
  }

  // Largest Contentful Paint
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    metrics.lcp = lastEntry.startTime;
  });

  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // LCP not supported
  }

  // Time to First Byte
  const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigationTiming) {
    metrics.ttfb = navigationTiming.responseStart - navigationTiming.fetchStart;
    metrics.loadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
  }

  // Cumulative Layout Shift
  let cls = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        cls += (entry as any).value;
      }
    }
    metrics.cls = cls;
  });

  try {
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    // CLS not supported
  }

  return metrics;
}

/**
 * Setup Intersection Observer for lazy loading
 */
export function setupLazyLoading(
  selector: string,
  callback: (element: Element) => void,
  config?: LazyLoadConfig
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  const defaultConfig: LazyLoadConfig = {
    threshold: 0.1,
    rootMargin: '50px',
    ...config,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, defaultConfig);

  const elements = document.querySelectorAll(selector);
  elements.forEach((element) => observer.observe(element));

  return observer;
}

/**
 * Lazy load images
 */
export function lazyLoadImages(selector: string = 'img[data-src]'): IntersectionObserver | null {
  return setupLazyLoading(selector, (element) => {
    const img = element as HTMLImageElement;
    const src = img.getAttribute('data-src');
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
      img.classList.add('loaded');
    }
  });
}

/**
 * Lazy load components
 */
export function lazyLoadComponents(selector: string): IntersectionObserver | null {
  return setupLazyLoading(selector, (element) => {
    element.classList.add('visible');
  });
}

/**
 * Prefetch resources
 */
export function prefetchResource(url: string, type: 'script' | 'style' | 'fetch' = 'fetch'): void {
  if (typeof document === 'undefined') {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;

  if (type === 'script') {
    link.as = 'script';
  } else if (type === 'style') {
    link.as = 'style';
  }

  document.head.appendChild(link);
}

/**
 * Preload critical resources
 */
export function preloadResource(url: string, type: 'script' | 'style' | 'font' = 'script'): void {
  if (typeof document === 'undefined') {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;

  if (type === 'script') {
    link.as = 'script';
  } else if (type === 'style') {
    link.as = 'style';
  } else if (type === 'font') {
    link.as = 'font';
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request Animation Frame wrapper for smooth animations
 */
export function requestAnimationFrameThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return function executedFunction(...args: Parameters<T>) {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
}

/**
 * Measure function execution time
 */
export function measureExecutionTime(
  func: () => void,
  label: string = 'Execution'
): number {
  const start = performance.now();
  func();
  const end = performance.now();
  const duration = end - start;

  if (typeof console !== 'undefined') {
    console.log(`${label}: ${duration.toFixed(2)}ms`);
  }

  return duration;
}

/**
 * Get performance report
 */
export function getPerformanceReport(): {
  metrics: PerformanceMetrics;
  resourceTiming: PerformanceResourceTiming[];
  navigationTiming: PerformanceNavigationTiming | null;
} {
  const metrics = measureWebVitals();
  const resourceTiming = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const navigationTiming = (performance.getEntriesByType('navigation')[0] ||
    null) as PerformanceNavigationTiming | null;

  return {
    metrics,
    resourceTiming,
    navigationTiming,
  };
}

/**
 * Check if performance is acceptable
 */
export function isPerformanceAcceptable(metrics: PerformanceMetrics): boolean {
  return (
    metrics.fcp < 1800 && // First Contentful Paint < 1.8s
    metrics.lcp < 2500 && // Largest Contentful Paint < 2.5s
    metrics.cls < 0.1 && // Cumulative Layout Shift < 0.1
    metrics.ttfb < 600 // Time to First Byte < 600ms
  );
}

/**
 * Get performance score (0-100)
 */
export function getPerformanceScore(metrics: PerformanceMetrics): number {
  let score = 100;

  // FCP scoring
  if (metrics.fcp > 1800) score -= 10;
  if (metrics.fcp > 3000) score -= 10;

  // LCP scoring
  if (metrics.lcp > 2500) score -= 15;
  if (metrics.lcp > 4000) score -= 15;

  // CLS scoring
  if (metrics.cls > 0.1) score -= 10;
  if (metrics.cls > 0.25) score -= 10;

  // TTFB scoring
  if (metrics.ttfb > 600) score -= 10;
  if (metrics.ttfb > 1200) score -= 10;

  return Math.max(0, score);
}

/**
 * Performance optimization guidelines
 */
export const PERFORMANCE_GUIDELINES = {
  FCP_TARGET: 1800, // First Contentful Paint target (ms)
  LCP_TARGET: 2500, // Largest Contentful Paint target (ms)
  CLS_TARGET: 0.1, // Cumulative Layout Shift target
  TTFB_TARGET: 600, // Time to First Byte target (ms)
  LOAD_TIME_TARGET: 3000, // Total load time target (ms)
  LAZY_LOAD_THRESHOLD: 0.1,
  LAZY_LOAD_MARGIN: '50px',
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
};
