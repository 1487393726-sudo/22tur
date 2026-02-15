/**
 * Responsive Design Types for User Portal System
 * Defines breakpoints and responsive utilities
 */

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveConfig {
  mobile: {
    minWidth: number;
    maxWidth: number;
    columns: number;
    padding: string;
    gap: string;
  };
  tablet: {
    minWidth: number;
    maxWidth: number;
    columns: number;
    padding: string;
    gap: string;
  };
  desktop: {
    minWidth: number;
    maxWidth: number;
    columns: number;
    padding: string;
    gap: string;
  };
}

export const RESPONSIVE_CONFIG: ResponsiveConfig = {
  mobile: {
    minWidth: 0,
    maxWidth: 767,
    columns: 1,
    padding: 'p-4',
    gap: 'gap-3',
  },
  tablet: {
    minWidth: 768,
    maxWidth: 1023,
    columns: 2,
    padding: 'p-6',
    gap: 'gap-4',
  },
  desktop: {
    minWidth: 1024,
    maxWidth: Infinity,
    columns: 3,
    padding: 'p-8',
    gap: 'gap-6',
  },
};

export interface ResponsiveLayoutProps {
  /**
   * Mobile layout (< 768px)
   */
  mobileLayout?: 'stack' | 'grid' | 'carousel';
  /**
   * Tablet layout (768px - 1023px)
   */
  tabletLayout?: 'grid' | 'two-column' | 'sidebar';
  /**
   * Desktop layout (>= 1024px)
   */
  desktopLayout?: 'grid' | 'three-column' | 'sidebar-main';
  /**
   * Number of columns for grid layouts
   */
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
}

export interface ResponsiveSpacing {
  mobile: string;
  tablet: string;
  desktop: string;
}

export const RESPONSIVE_SPACING: ResponsiveSpacing = {
  mobile: 'p-4 sm:p-4',
  tablet: 'sm:p-6 md:p-6',
  desktop: 'lg:p-8 xl:p-8',
};

export interface ResponsiveText {
  mobile: string;
  tablet: string;
  desktop: string;
}

export const RESPONSIVE_TEXT_SIZE: Record<string, ResponsiveText> = {
  heading1: {
    mobile: 'text-2xl',
    tablet: 'text-3xl',
    desktop: 'text-4xl',
  },
  heading2: {
    mobile: 'text-xl',
    tablet: 'text-2xl',
    desktop: 'text-3xl',
  },
  heading3: {
    mobile: 'text-lg',
    tablet: 'text-xl',
    desktop: 'text-2xl',
  },
  body: {
    mobile: 'text-sm',
    tablet: 'text-base',
    desktop: 'text-base',
  },
  small: {
    mobile: 'text-xs',
    tablet: 'text-sm',
    desktop: 'text-sm',
  },
};

/**
 * Get responsive grid classes
 */
export function getResponsiveGridClasses(
  mobileColumns: number = 1,
  tabletColumns: number = 2,
  desktopColumns: number = 3
): string {
  const gridMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return `grid ${gridMap[mobileColumns]} md:${gridMap[tabletColumns]} lg:${gridMap[desktopColumns]}`;
}

/**
 * Get responsive padding classes
 */
export function getResponsivePaddingClasses(): string {
  return 'p-4 sm:p-6 md:p-6 lg:p-8';
}

/**
 * Get responsive gap classes
 */
export function getResponsiveGapClasses(): string {
  return 'gap-3 sm:gap-4 md:gap-4 lg:gap-6';
}

/**
 * Get responsive text size classes
 */
export function getResponsiveTextClasses(size: keyof typeof RESPONSIVE_TEXT_SIZE): string {
  const config = RESPONSIVE_TEXT_SIZE[size];
  return `${config.mobile} sm:${config.tablet} lg:${config.desktop}`;
}
