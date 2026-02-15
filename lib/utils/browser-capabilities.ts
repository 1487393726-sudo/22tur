/**
 * Browser Capabilities Detection Utilities
 * 浏览器能力检测工具
 * 
 * This module provides functions to detect browser capabilities and user preferences
 * for optimizing glassmorphism effects across different devices and browsers.
 * 
 * Validates Requirements: 6.5, 8.1, 8.2, 10.3, 10.6, 11.4
 */

import type { BrowserCapabilities } from '@/types/glass-effect';

/**
 * Detects if the browser supports backdrop-filter CSS property
 * 检测浏览器是否支持backdrop-filter CSS属性
 * 
 * Validates Requirements: 6.5, 8.1, 8.2
 * 
 * @returns true if backdrop-filter is supported, false otherwise
 */
export function supportsBackdropFilter(): boolean {
  // Server-side rendering check
  if (typeof window === 'undefined' || typeof CSS === 'undefined') {
    return false;
  }

  // Check for standard and webkit-prefixed backdrop-filter support
  return (
    CSS.supports('backdrop-filter', 'blur(10px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(10px)')
  );
}

/**
 * Detects if the current device is a low-end device based on hardware capabilities
 * 检测当前设备是否为低端设备
 * 
 * Validates Requirements: 6.5, 8.1
 * 
 * Low-end device criteria:
 * - 4 or fewer CPU cores
 * - Less than 4GB of device memory (if available)
 * 
 * @returns true if device is considered low-end, false otherwise
 */
export function isLowEndDevice(): boolean {
  // Server-side rendering check
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // Check CPU cores (hardwareConcurrency)
  const cpuCores = navigator.hardwareConcurrency || 0;
  const hasLowCpuCores = cpuCores > 0 && cpuCores <= 4;

  // Check device memory if available (in GB)
  // @ts-ignore - deviceMemory is not in standard TypeScript definitions
  const deviceMemory = navigator.deviceMemory;
  const hasLowMemory = deviceMemory !== undefined && deviceMemory < 4;

  // Consider low-end if either condition is met
  return hasLowCpuCores || hasLowMemory;
}

/**
 * Detects if the current device is a mobile device
 * 检测当前设备是否为移动设备
 * 
 * Validates Requirements: 6.5, 8.1
 * 
 * @returns true if device is mobile, false otherwise
 */
export function isMobileDevice(): boolean {
  // Server-side rendering check
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // Check user agent for mobile device indicators
  const userAgent = navigator.userAgent || '';
  const mobileRegex = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i;
  
  // Also check for touch support and small screen size
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasSmallScreen = window.innerWidth <= 768;

  return mobileRegex.test(userAgent) || (hasTouchSupport && hasSmallScreen);
}

/**
 * Detects if the user prefers reduced motion
 * 检测用户是否偏好减少动画
 * 
 * Validates Requirements: 11.4
 * 
 * @returns true if user prefers reduced motion, false otherwise
 */
export function prefersReducedMotion(): boolean {
  // Server-side rendering check
  if (typeof window === 'undefined') {
    return false;
  }

  // Check for prefers-reduced-motion media query
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Detects if the user prefers high contrast
 * 检测用户是否偏好高对比度
 * 
 * Validates Requirements: 10.3
 * 
 * @returns true if user prefers high contrast, false otherwise
 */
export function prefersHighContrast(): boolean {
  // Server-side rendering check
  if (typeof window === 'undefined') {
    return false;
  }

  // Check for prefers-contrast: high media query
  const mediaQuery = window.matchMedia('(prefers-contrast: high)');
  return mediaQuery.matches;
}

/**
 * Detects if the user prefers reduced transparency
 * 检测用户是否偏好减少透明度
 * 
 * Validates Requirements: 10.6
 * 
 * Note: prefers-reduced-transparency is not widely supported yet,
 * so this may return false even if the user would prefer reduced transparency
 * 
 * @returns true if user prefers reduced transparency, false otherwise
 */
export function prefersReducedTransparency(): boolean {
  // Server-side rendering check
  if (typeof window === 'undefined') {
    return false;
  }

  // Check for prefers-reduced-transparency media query
  // This is a newer media query with limited browser support
  try {
    const mediaQuery = window.matchMedia('(prefers-reduced-transparency: reduce)');
    return mediaQuery.matches;
  } catch (error) {
    // If the media query is not supported, return false
    return false;
  }
}

/**
 * Detects all browser capabilities and user preferences
 * 检测所有浏览器能力和用户偏好设置
 * 
 * Validates Requirements: 6.5, 8.1, 8.2, 10.3, 10.6, 11.4
 * 
 * This is the main function that should be used to get a complete
 * picture of the browser's capabilities for glass effect optimization.
 * 
 * @returns BrowserCapabilities object with all detection results
 */
export function detectBrowserCapabilities(): BrowserCapabilities {
  return {
    supportsBackdropFilter: supportsBackdropFilter(),
    isLowEndDevice: isLowEndDevice(),
    isMobile: isMobileDevice(),
    prefersReducedMotion: prefersReducedMotion(),
    prefersHighContrast: prefersHighContrast(),
    prefersReducedTransparency: prefersReducedTransparency(),
  };
}

/**
 * Determines if glass effects should be enabled based on browser capabilities
 * 根据浏览器能力判断是否应该启用玻璃效果
 * 
 * Validates Requirements: 6.5, 8.1, 10.3, 10.6, 11.4
 * 
 * Glass effects are disabled if:
 * - Browser doesn't support backdrop-filter
 * - Device is low-end AND mobile (performance concern)
 * - User prefers reduced transparency
 * - User prefers high contrast (readability concern)
 * 
 * @param capabilities Optional pre-detected capabilities (to avoid re-detection)
 * @returns true if glass effects should be enabled, false otherwise
 */
export function shouldEnableGlassEffects(
  capabilities?: BrowserCapabilities
): boolean {
  const caps = capabilities || detectBrowserCapabilities();

  // Disable if browser doesn't support backdrop-filter
  if (!caps.supportsBackdropFilter) {
    return false;
  }

  // Disable if user prefers reduced transparency
  if (caps.prefersReducedTransparency) {
    return false;
  }

  // Disable if user prefers high contrast (glass effects can reduce contrast)
  if (caps.prefersHighContrast) {
    return false;
  }

  // Disable on low-end mobile devices for performance
  if (caps.isLowEndDevice && caps.isMobile) {
    return false;
  }

  return true;
}

/**
 * Creates a listener for changes in user preferences
 * 创建用户偏好设置变化的监听器
 * 
 * This allows the application to respond dynamically when users change
 * their system preferences (e.g., enabling reduced motion).
 * 
 * @param callback Function to call when preferences change
 * @returns Cleanup function to remove the listeners
 */
export function watchUserPreferences(
  callback: (capabilities: BrowserCapabilities) => void
): () => void {
  // Server-side rendering check
  if (typeof window === 'undefined') {
    return () => {};
  }

  const mediaQueries = [
    window.matchMedia('(prefers-reduced-motion: reduce)'),
    window.matchMedia('(prefers-contrast: high)'),
  ];

  // Try to add the reduced transparency query if supported
  try {
    mediaQueries.push(window.matchMedia('(prefers-reduced-transparency: reduce)'));
  } catch (error) {
    // Ignore if not supported
  }

  const handleChange = () => {
    callback(detectBrowserCapabilities());
  };

  // Add listeners to all media queries
  mediaQueries.forEach(mq => {
    // Use addEventListener if available (modern browsers)
    if (mq.addEventListener) {
      mq.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      // @ts-ignore - addListener is deprecated but needed for older browsers
      mq.addListener(handleChange);
    }
  });

  // Return cleanup function
  return () => {
    mediaQueries.forEach(mq => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handleChange);
      } else {
        // @ts-ignore - removeListener is deprecated but needed for older browsers
        mq.removeListener(handleChange);
      }
    });
  };
}
