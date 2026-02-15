/**
 * Glass Effects Configuration
 * 玻璃态效果配置
 * 
 * This file contains the configuration data for glassmorphism effects
 * including all component types and theme variations.
 */

import { ThemeGlassConfig } from '@/types/glass-effect';

/**
 * Glass effect configurations for all themes and intensities
 * 所有主题和强度的玻璃效果配置
 */
export const GLASS_CONFIGS: ThemeGlassConfig = {
  light: {
    light: {
      opacity: 0.1,
      blur: 8,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
      interactive: false,
    },
    medium: {
      opacity: 0.15,
      blur: 12,
      borderColor: 'rgba(255, 255, 255, 0.18)',
      shadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
      interactive: true,
      hoverOpacityIncrease: 0.05,
      hoverBlurIncrease: 4,
    },
    heavy: {
      opacity: 0.25,
      blur: 20,
      borderColor: 'rgba(255, 255, 255, 0.18)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
      interactive: true,
      hoverOpacityIncrease: 0.08,
      hoverBlurIncrease: 6,
    },
  },
  dark: {
    light: {
      opacity: 0.08,
      blur: 8,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.3)',
      interactive: false,
    },
    medium: {
      opacity: 0.12,
      blur: 12,
      borderColor: 'rgba(255, 255, 255, 0.12)',
      shadow: '0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.4)',
      interactive: true,
      hoverOpacityIncrease: 0.04,
      hoverBlurIncrease: 3,
    },
    heavy: {
      opacity: 0.2,
      blur: 20,
      borderColor: 'rgba(255, 255, 255, 0.12)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.5)',
      interactive: true,
      hoverOpacityIncrease: 0.06,
      hoverBlurIncrease: 5,
    },
  },
};

/**
 * Component-specific glass effect ranges
 * 组件特定的玻璃效果范围
 */
export const COMPONENT_GLASS_RANGES = {
  navbar: {
    opacityRange: { min: 0.1, max: 0.3 },
    blurRange: { min: 10, max: 20 },
  },
  card: {
    opacityRange: { min: 0.05, max: 0.15 },
    blurRange: { min: 8, max: 16 },
  },
  button: {
    opacityRange: { min: 0.1, max: 0.25 },
    blurRange: { min: 6, max: 12 },
  },
  input: {
    opacityRange: { min: 0.05, max: 0.15 },
    blurRange: { min: 8, max: 12 },
  },
  modal: {
    opacityRange: { min: 0.1, max: 0.2 },
    blurRange: { min: 12, max: 20 },
  },
} as const;

/**
 * Performance optimization thresholds
 * 性能优化阈值
 */
export const PERFORMANCE_THRESHOLDS = {
  /** Maximum number of simultaneous backdrop-filter elements */
  maxBackdropFilterElements: 15,
  
  /** Minimum hardware concurrency for full effects */
  minHardwareConcurrency: 4,
  
  /** Mobile viewport width threshold */
  mobileViewportWidth: 768,
  
  /** Small mobile viewport width threshold */
  smallMobileViewportWidth: 640,
} as const;
