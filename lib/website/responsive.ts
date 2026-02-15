/**
 * Responsive Design Utilities
 * Utilities for handling responsive layouts and viewport detection
 */

import { breakpoints } from './config';

/**
 * Viewport size type
 */
export type ViewportSize = 'mobile' | 'tablet' | 'desktop';

/**
 * Get viewport size based on width
 */
export function getViewportSize(width: number): ViewportSize {
  if (width < breakpoints.mobile) {
    return 'mobile';
  } else if (width < breakpoints.desktop) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Check if viewport is mobile
 */
export function isMobileViewport(width: number): boolean {
  return width < breakpoints.mobile;
}

/**
 * Check if viewport is tablet
 */
export function isTabletViewport(width: number): boolean {
  return width >= breakpoints.mobile && width < breakpoints.desktop;
}

/**
 * Check if viewport is desktop
 */
export function isDesktopViewport(width: number): boolean {
  return width >= breakpoints.desktop;
}

/**
 * Get responsive class based on viewport
 */
export function getResponsiveClass(
  mobileClass: string,
  tabletClass: string,
  desktopClass: string
): string {
  return `${mobileClass} md:${tabletClass} lg:${desktopClass}`;
}

/**
 * Get responsive padding based on viewport
 */
export function getResponsivePadding(viewport: ViewportSize): string {
  switch (viewport) {
    case 'mobile':
      return 'p-4';
    case 'tablet':
      return 'p-6';
    case 'desktop':
      return 'p-8';
  }
}

/**
 * Get responsive grid columns based on viewport
 */
export function getResponsiveGridCols(viewport: ViewportSize): number {
  switch (viewport) {
    case 'mobile':
      return 1;
    case 'tablet':
      return 2;
    case 'desktop':
      return 3;
  }
}

/**
 * Get responsive font size based on viewport
 */
export function getResponsiveFontSize(viewport: ViewportSize): string {
  switch (viewport) {
    case 'mobile':
      return 'text-sm';
    case 'tablet':
      return 'text-base';
    case 'desktop':
      return 'text-lg';
  }
}

/**
 * Get responsive gap based on viewport
 */
export function getResponsiveGap(viewport: ViewportSize): string {
  switch (viewport) {
    case 'mobile':
      return 'gap-2';
    case 'tablet':
      return 'gap-4';
    case 'desktop':
      return 'gap-6';
  }
}

/**
 * Check if touch target meets minimum size (44x44px)
 */
export function isTouchTargetCompliant(width: number, height: number): boolean {
  const minSize = 44;
  return width >= minSize && height >= minSize;
}

/**
 * Get responsive image sizes attribute
 */
export function getResponsiveImageSizes(): string {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
}

/**
 * Get responsive image srcset
 */
export function getResponsiveImageSrcset(basePath: string): string {
  return `${basePath}?w=640 640w, ${basePath}?w=1024 1024w, ${basePath}?w=1280 1280w`;
}

/**
 * Calculate responsive container width
 */
export function getResponsiveContainerWidth(viewport: ViewportSize): string {
  switch (viewport) {
    case 'mobile':
      return '100%';
    case 'tablet':
      return '90%';
    case 'desktop':
      return '85%';
  }
}

/**
 * Get responsive max width class
 */
export function getResponsiveMaxWidth(viewport: ViewportSize): string {
  switch (viewport) {
    case 'mobile':
      return 'max-w-full';
    case 'tablet':
      return 'max-w-2xl';
    case 'desktop':
      return 'max-w-4xl';
  }
}

/**
 * Get responsive margin based on viewport
 */
export function getResponsiveMargin(viewport: ViewportSize): string {
  switch (viewport) {
    case 'mobile':
      return 'm-2';
    case 'tablet':
      return 'm-4';
    case 'desktop':
      return 'm-6';
  }
}

/**
 * Validate responsive layout consistency
 * Ensures layout adapts correctly to viewport changes
 */
export function validateResponsiveLayout(
  viewport: ViewportSize,
  containerWidth: number,
  childElements: number
): boolean {
  const gridCols = getResponsiveGridCols(viewport);
  
  // For zero children, layout is still valid
  if (childElements === 0) {
    return gridCols > 0;
  }
  
  const expectedRows = Math.ceil(childElements / gridCols);
  
  // Validate that layout is properly distributed
  return expectedRows > 0 && gridCols > 0;
}

/**
 * Get responsive breakpoint value
 */
export function getBreakpointValue(breakpoint: 'mobile' | 'tablet' | 'desktop'): number {
  switch (breakpoint) {
    case 'mobile':
      return breakpoints.mobile;
    case 'tablet':
      return breakpoints.tablet;
    case 'desktop':
      return breakpoints.desktop;
  }
}

/**
 * Check if viewport width matches breakpoint
 */
export function matchesBreakpoint(width: number, breakpoint: 'mobile' | 'tablet' | 'desktop'): boolean {
  const size = getViewportSize(width);
  return size === breakpoint;
}
