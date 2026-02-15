/**
 * Glass Effect Type Definitions
 * 玻璃态效果类型定义
 * 
 * This file contains TypeScript type definitions for glassmorphism effects
 * including configuration interfaces, component props, and browser capabilities.
 */

/**
 * Glass effect intensity levels
 * 玻璃效果强度级别
 */
export type GlassIntensity = 'light' | 'medium' | 'heavy';

/**
 * Glass effect configuration
 * 玻璃效果配置
 */
export interface GlassEffectConfig {
  /** Background opacity (0-1) - 背景不透明度 */
  opacity: number;
  
  /** Blur intensity in pixels - 模糊强度（像素） */
  blur: number;
  
  /** Border color (rgba) - 边框颜色 */
  borderColor: string;
  
  /** Shadow definition - 阴影定义 */
  shadow: string;
  
  /** Enable interactive effects - 是否启用交互效果 */
  interactive: boolean;
  
  /** Hover opacity increase - 悬停时的不透明度增量 */
  hoverOpacityIncrease?: number;
  
  /** Hover blur increase in pixels - 悬停时的模糊强度增量 */
  hoverBlurIncrease?: number;
}

/**
 * Theme-specific glass effect configuration
 * 主题特定的玻璃效果配置
 */
export interface ThemeGlassConfig {
  light: Record<GlassIntensity, GlassEffectConfig>;
  dark: Record<GlassIntensity, GlassEffectConfig>;
}

/**
 * Component-specific glass effect props
 * 组件特定的玻璃效果属性
 */
export interface GlassComponentProps {
  /** Glass effect intensity - 玻璃效果强度 */
  glassIntensity?: GlassIntensity;
  
  /** Enable interactive effects - 是否启用交互效果 */
  glassInteractive?: boolean;
  
  /** Custom glass effect configuration - 自定义玻璃效果配置 */
  glassConfig?: Partial<GlassEffectConfig>;
  
  /** Disable glass effect (fallback) - 是否禁用玻璃效果（降级） */
  disableGlass?: boolean;
}

/**
 * Browser capabilities detection result
 * 浏览器能力检测结果
 */
export interface BrowserCapabilities {
  /** Supports backdrop-filter - 是否支持backdrop-filter */
  supportsBackdropFilter: boolean;
  
  /** Is low-end device - 是否为低端设备 */
  isLowEndDevice: boolean;
  
  /** Is mobile device - 是否为移动设备 */
  isMobile: boolean;
  
  /** User prefers reduced motion - 用户是否偏好减少动画 */
  prefersReducedMotion: boolean;
  
  /** User prefers high contrast - 用户是否偏好高对比度 */
  prefersHighContrast?: boolean;
  
  /** User prefers reduced transparency - 用户是否偏好减少透明度 */
  prefersReducedTransparency?: boolean;
}

/**
 * Glass effect optimization options
 * 玻璃效果优化选项
 */
export interface GlassOptimizationOptions {
  /** Maximum number of simultaneous backdrop-filter elements - 最大同时backdrop-filter元素数量 */
  maxBackdropFilterElements?: number;
  
  /** Enable performance monitoring - 启用性能监控 */
  enablePerformanceMonitoring?: boolean;
  
  /** Disable glass effects on low-end devices - 在低端设备上禁用玻璃效果 */
  disableOnLowEndDevices?: boolean;
}
