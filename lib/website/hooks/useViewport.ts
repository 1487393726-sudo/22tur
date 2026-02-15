/**
 * useViewport Hook
 * Hook for detecting and tracking viewport size changes
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getViewportSize, type ViewportSize } from '../responsive';
import { breakpoints } from '../config';

interface ViewportInfo {
  width: number;
  height: number;
  size: ViewportSize;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * useViewport hook
 * Tracks viewport size and provides viewport information
 */
export function useViewport(): ViewportInfo {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    size: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const size = getViewportSize(width);

    setViewportInfo({
      width,
      height,
      size,
      isMobile: size === 'mobile',
      isTablet: size === 'tablet',
      isDesktop: size === 'desktop',
    });
  }, []);

  useEffect(() => {
    // Set initial viewport info
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return viewportInfo;
}

/**
 * useMediaQuery hook
 * Hook for detecting media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * useIsMobile hook
 * Hook for checking if viewport is mobile
 */
export function useIsMobile(): boolean {
  const viewport = useViewport();
  return viewport.isMobile;
}

/**
 * useIsTablet hook
 * Hook for checking if viewport is tablet
 */
export function useIsTablet(): boolean {
  const viewport = useViewport();
  return viewport.isTablet;
}

/**
 * useIsDesktop hook
 * Hook for checking if viewport is desktop
 */
export function useIsDesktop(): boolean {
  const viewport = useViewport();
  return viewport.isDesktop;
}

/**
 * useBreakpoint hook
 * Hook for checking if viewport matches a specific breakpoint
 */
export function useBreakpoint(breakpoint: 'mobile' | 'tablet' | 'desktop'): boolean {
  const viewport = useViewport();
  return viewport.size === breakpoint;
}

/**
 * useViewportWidth hook
 * Hook for getting current viewport width
 */
export function useViewportWidth(): number {
  const viewport = useViewport();
  return viewport.width;
}

/**
 * useViewportHeight hook
 * Hook for getting current viewport height
 */
export function useViewportHeight(): number {
  const viewport = useViewport();
  return viewport.height;
}
