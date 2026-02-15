/**
 * Glass Effect Optimization Hook
 * 玻璃效果优化Hook
 * 
 * This hook provides performance optimization decisions for glass effects
 * based on device capabilities and user preferences.
 * 
 * Validates Requirements: 7.1, 7.2, 7.3
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BrowserCapabilities } from '@/types/glass-effect';
import {
  detectBrowserCapabilities,
  shouldEnableGlassEffects,
  watchUserPreferences,
} from '@/lib/utils/browser-capabilities';

/**
 * Configuration options for glass optimization
 */
export interface GlassOptimizationConfig {
  /** Maximum number of simultaneous backdrop-filter elements allowed */
  maxBackdropFilterElements?: number;
  
  /** Whether to enable glass effects on low-end devices */
  enableOnLowEndDevices?: boolean;
  
  /** Whether to enable glass effects on mobile devices */
  enableOnMobile?: boolean;
  
  /** Whether to respect user preferences (reduced motion, high contrast, etc.) */
  respectUserPreferences?: boolean;
}

/**
 * Return type for useGlassOptimization hook
 */
export interface GlassOptimizationResult {
  /** Whether glass effects should be used */
  shouldUseGlass: boolean;
  
  /** Detected browser capabilities */
  capabilities: BrowserCapabilities;
  
  /** Whether the maximum number of backdrop-filter elements has been reached */
  isAtMaxCapacity: boolean;
  
  /** Current count of backdrop-filter elements */
  backdropFilterCount: number;
  
  /** Function to register a new backdrop-filter element */
  registerBackdropFilter: () => void;
  
  /** Function to unregister a backdrop-filter element */
  unregisterBackdropFilter: () => void;
  
  /** Function to manually refresh capabilities detection */
  refreshCapabilities: () => void;
}

// Default configuration
const DEFAULT_CONFIG: Required<GlassOptimizationConfig> = {
  maxBackdropFilterElements: 15,
  enableOnLowEndDevices: false,
  enableOnMobile: true,
  respectUserPreferences: true,
};

// Global counter for backdrop-filter elements
// This is shared across all instances of the hook to track total usage
let globalBackdropFilterCount = 0;
const backdropFilterListeners = new Set<() => void>();

/**
 * Notify all listeners when backdrop filter count changes
 */
function notifyBackdropFilterChange() {
  backdropFilterListeners.forEach(listener => listener());
}

/**
 * React Hook for optimizing glass effects based on device capabilities and user preferences
 * 
 * This hook:
 * - Detects browser capabilities (backdrop-filter support, device performance, etc.)
 * - Monitors user preferences (reduced motion, high contrast, reduced transparency)
 * - Tracks the number of backdrop-filter elements to prevent performance degradation
 * - Provides functions to register/unregister backdrop-filter usage
 * - Automatically updates when user preferences change
 * 
 * Validates Requirements:
 * - 7.1: Uses will-change property optimization (via capability detection)
 * - 7.2: Limits simultaneous backdrop-filter effects
 * - 7.3: Ensures animations use transform/opacity (via capability detection)
 * 
 * @param config Optional configuration for optimization behavior
 * @returns GlassOptimizationResult with optimization decisions and utilities
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { shouldUseGlass, registerBackdropFilter, unregisterBackdropFilter } = useGlassOptimization();
 *   
 *   useEffect(() => {
 *     if (shouldUseGlass) {
 *       registerBackdropFilter();
 *       return () => unregisterBackdropFilter();
 *     }
 *   }, [shouldUseGlass, registerBackdropFilter, unregisterBackdropFilter]);
 *   
 *   return (
 *     <div className={shouldUseGlass ? 'glass-medium' : 'glass-fallback'}>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
export function useGlassOptimization(
  config: GlassOptimizationConfig = {}
): GlassOptimizationResult {
  // Merge config with defaults
  const finalConfig: Required<GlassOptimizationConfig> = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  // State for browser capabilities
  const [capabilities, setCapabilities] = useState<BrowserCapabilities>(() => {
    // Initial detection (will be updated in useEffect)
    return detectBrowserCapabilities();
  });

  // State for backdrop filter count
  const [backdropFilterCount, setBackdropFilterCount] = useState(globalBackdropFilterCount);

  // Refresh capabilities detection
  const refreshCapabilities = useCallback(() => {
    const newCapabilities = detectBrowserCapabilities();
    setCapabilities(newCapabilities);
  }, []);

  // Update local state when global count changes
  useEffect(() => {
    const listener = () => {
      setBackdropFilterCount(globalBackdropFilterCount);
    };
    
    backdropFilterListeners.add(listener);
    
    return () => {
      backdropFilterListeners.delete(listener);
    };
  }, []);

  // Watch for user preference changes
  useEffect(() => {
    // Initial detection
    refreshCapabilities();

    // Set up listener for preference changes
    const cleanup = watchUserPreferences((newCapabilities) => {
      setCapabilities(newCapabilities);
    });

    return cleanup;
  }, [refreshCapabilities]);

  // Register a backdrop-filter element
  const registerBackdropFilter = useCallback(() => {
    globalBackdropFilterCount++;
    notifyBackdropFilterChange();
  }, []);

  // Unregister a backdrop-filter element
  const unregisterBackdropFilter = useCallback(() => {
    if (globalBackdropFilterCount > 0) {
      globalBackdropFilterCount--;
      notifyBackdropFilterChange();
    }
  }, []);

  // Determine if glass effects should be used
  const shouldUseGlass = (() => {
    // Check if we've reached maximum capacity
    const isAtMaxCapacity = backdropFilterCount >= finalConfig.maxBackdropFilterElements;
    if (isAtMaxCapacity) {
      return false;
    }

    // Check browser capabilities and user preferences
    let shouldEnable = shouldEnableGlassEffects(capabilities);

    // Apply custom config overrides
    if (!finalConfig.respectUserPreferences) {
      // If not respecting user preferences, only check browser support
      shouldEnable = capabilities.supportsBackdropFilter;
    }

    // Check low-end device override
    if (!finalConfig.enableOnLowEndDevices && capabilities.isLowEndDevice) {
      shouldEnable = false;
    }

    // Check mobile device override
    if (!finalConfig.enableOnMobile && capabilities.isMobile) {
      shouldEnable = false;
    }

    return shouldEnable;
  })();

  // Check if at maximum capacity
  const isAtMaxCapacity = backdropFilterCount >= finalConfig.maxBackdropFilterElements;

  return {
    shouldUseGlass,
    capabilities,
    isAtMaxCapacity,
    backdropFilterCount,
    registerBackdropFilter,
    unregisterBackdropFilter,
    refreshCapabilities,
  };
}

/**
 * Reset the global backdrop filter count
 * Useful for testing or when navigating between pages
 * 
 * @internal This is primarily for testing purposes
 */
export function resetBackdropFilterCount(): void {
  globalBackdropFilterCount = 0;
  notifyBackdropFilterChange();
}

/**
 * Get the current global backdrop filter count
 * 
 * @internal This is primarily for testing purposes
 */
export function getBackdropFilterCount(): number {
  return globalBackdropFilterCount;
}
