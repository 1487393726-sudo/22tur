/**
 * 3D Transform Utility Functions
 * 
 * This module provides utility functions for calculating and applying 3D transforms
 * including mouse position to rotation conversion, depth shadow configurations,
 * and browser 3D support detection.
 * 
 * Requirements: 1.2, 1.3
 */

/**
 * Shadow layer configuration for depth effects
 */
export interface ShadowLayer {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
}

/**
 * Depth configuration with shadow layers
 */
export interface DepthConfig {
  level: 'shallow' | 'medium' | 'deep';
  shadowLayers: ShadowLayer[];
  translateZ: number;
}

/**
 * 3D transform configuration
 */
export interface Transform3DConfig {
  perspective: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  translateZ: number;
  scale: number;
}

/**
 * Mouse position relative to element
 */
export interface MousePosition {
  x: number;
  y: number;
  centerX: number;
  centerY: number;
}

/**
 * Browser 3D support detection result
 */
export interface Browser3DSupport {
  transforms3D: boolean;
  perspective: boolean;
  backfaceVisibility: boolean;
  transformStyle: boolean;
}

// ============================================================================
// Mouse Position to Rotation Conversion
// ============================================================================

/**
 * Calculate mouse position relative to element center
 * 
 * @param event - Mouse event
 * @param element - Target element
 * @returns Mouse position relative to element center (normalized -1 to 1)
 */
export const getMousePosition = (
  event: MouseEvent | React.MouseEvent,
  element: HTMLElement
): MousePosition => {
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Calculate center position
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  // Normalize to -1 to 1 range
  const normalizedX = (x - centerX) / centerX;
  const normalizedY = (y - centerY) / centerY;
  
  return {
    x: normalizedX,
    y: normalizedY,
    centerX,
    centerY,
  };
};

/**
 * Convert mouse position to rotation angles
 * 
 * @param mousePosition - Normalized mouse position (-1 to 1)
 * @param maxRotation - Maximum rotation angle in degrees (default: 10)
 * @param invertX - Invert X-axis rotation (default: false)
 * @param invertY - Invert Y-axis rotation (default: false)
 * @returns Rotation angles in degrees
 */
export const mouseToRotation = (
  mousePosition: MousePosition,
  maxRotation: number = 10,
  invertX: boolean = false,
  invertY: boolean = false
): { rotateX: number; rotateY: number } => {
  // Calculate rotation based on mouse position
  // Y position affects X rotation (tilt forward/backward)
  // X position affects Y rotation (tilt left/right)
  const rotateX = mousePosition.y * maxRotation * (invertY ? -1 : 1);
  const rotateY = mousePosition.x * maxRotation * (invertX ? -1 : 1);
  
  return {
    rotateX: -rotateX, // Negative for natural tilt direction
    rotateY,
  };
};

/**
 * Calculate 3D transform based on mouse position
 * 
 * @param event - Mouse event
 * @param element - Target element
 * @param options - Transform options
 * @returns Complete 3D transform configuration
 */
export const calculateMouseTransform = (
  event: MouseEvent | React.MouseEvent,
  element: HTMLElement,
  options: {
    maxRotation?: number;
    perspective?: number;
    scale?: number;
    translateZ?: number;
    invertX?: boolean;
    invertY?: boolean;
  } = {}
): Transform3DConfig => {
  const {
    maxRotation = 10,
    perspective = 1000,
    scale = 1,
    translateZ = 0,
    invertX = false,
    invertY = false,
  } = options;
  
  const mousePos = getMousePosition(event, element);
  const rotation = mouseToRotation(mousePos, maxRotation, invertX, invertY);
  
  return {
    perspective,
    rotateX: rotation.rotateX,
    rotateY: rotation.rotateY,
    rotateZ: 0,
    translateZ,
    scale,
  };
};

/**
 * Convert Transform3DConfig to CSS transform string
 * 
 * @param config - 3D transform configuration
 * @returns CSS transform string
 */
export const transformToCSS = (config: Transform3DConfig): string => {
  const transforms: string[] = [];
  
  if (config.perspective) {
    transforms.push(`perspective(${config.perspective}px)`);
  }
  
  if (config.rotateX !== 0) {
    transforms.push(`rotateX(${config.rotateX}deg)`);
  }
  
  if (config.rotateY !== 0) {
    transforms.push(`rotateY(${config.rotateY}deg)`);
  }
  
  if (config.rotateZ !== 0) {
    transforms.push(`rotateZ(${config.rotateZ}deg)`);
  }
  
  if (config.translateZ !== 0) {
    transforms.push(`translateZ(${config.translateZ}px)`);
  }
  
  if (config.scale !== 1) {
    transforms.push(`scale(${config.scale})`);
  }
  
  return transforms.join(' ');
};

// ============================================================================
// Depth Level to Shadow Configuration Mapping
// ============================================================================

/**
 * Predefined depth configurations
 */
const depthConfigs: Record<'shallow' | 'medium' | 'deep', DepthConfig> = {
  shallow: {
    level: 'shallow',
    translateZ: 10,
    shadowLayers: [
      {
        offsetX: 0,
        offsetY: 2,
        blur: 4,
        spread: 0,
        color: 'rgba(0, 0, 0, 0.1)',
      },
      {
        offsetX: 0,
        offsetY: 4,
        blur: 8,
        spread: 0,
        color: 'rgba(0, 0, 0, 0.1)',
      },
    ],
  },
  medium: {
    level: 'medium',
    translateZ: 30,
    shadowLayers: [
      {
        offsetX: 0,
        offsetY: 4,
        blur: 6,
        spread: 0,
        color: 'rgba(0, 0, 0, 0.1)',
      },
      {
        offsetX: 0,
        offsetY: 8,
        blur: 12,
        spread: 0,
        color: 'rgba(0, 0, 0, 0.15)',
      },
      {
        offsetX: 0,
        offsetY: 12,
        blur: 20,
        spread: 0,
        color: 'rgba(0, 0, 0, 0.1)',
      },
    ],
  },
  deep: {
    level: 'deep',
    translateZ: 50,
    shadowLayers: [
      {
        offsetX: 0,
        offsetY: 6,
        blur: 10,
        spread: 0,
        color: 'rgba(0, 0, 0, 0.15)',
      },
      {
        offsetX: 0,
        offsetY: 12,
        blur: 20,
        spread: 0,
        color: 'rgba(0, 0, 0, 0.15)',
      },
      {
        offsetX: 0,
        offsetY: 20,
        blur: 30,
        spread: 0,
        color: 'rgba(0, 0, 0, 0.1)',
      },
      {
        offsetX: 0,
        offsetY: 30,
        blur: 50,
        spread: 0,
        color: 'rgba(0, 0, 0, 0.25)',
      },
    ],
  },
};

/**
 * Get depth configuration by level
 * 
 * @param level - Depth level (shallow, medium, deep)
 * @returns Depth configuration with shadow layers
 */
export const getDepthConfig = (
  level: 'shallow' | 'medium' | 'deep'
): DepthConfig => {
  return depthConfigs[level];
};

/**
 * Convert shadow layers to CSS box-shadow string
 * 
 * @param shadowLayers - Array of shadow layer configurations
 * @returns CSS box-shadow string
 */
export const shadowLayersToCSS = (shadowLayers: ShadowLayer[]): string => {
  return shadowLayers
    .map(
      (layer) =>
        `${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${layer.spread}px ${layer.color}`
    )
    .join(', ');
};

/**
 * Get complete shadow CSS for a depth level
 * 
 * @param level - Depth level
 * @returns CSS box-shadow string
 */
export const getDepthShadow = (level: 'shallow' | 'medium' | 'deep'): string => {
  const config = getDepthConfig(level);
  return shadowLayersToCSS(config.shadowLayers);
};

/**
 * Create custom depth configuration
 * 
 * @param options - Custom depth options
 * @returns Custom depth configuration
 */
export const createCustomDepth = (options: {
  translateZ?: number;
  shadowCount?: number;
  maxBlur?: number;
  maxOffset?: number;
  baseColor?: string;
  opacity?: number;
}): DepthConfig => {
  const {
    translateZ = 30,
    shadowCount = 3,
    maxBlur = 30,
    maxOffset = 20,
    baseColor = '0, 0, 0',
    opacity = 0.15,
  } = options;
  
  const shadowLayers: ShadowLayer[] = [];
  
  for (let i = 0; i < shadowCount; i++) {
    const progress = (i + 1) / shadowCount;
    shadowLayers.push({
      offsetX: 0,
      offsetY: Math.round(maxOffset * progress),
      blur: Math.round(maxBlur * progress),
      spread: 0,
      color: `rgba(${baseColor}, ${opacity * (1 - progress * 0.3)})`,
    });
  }
  
  return {
    level: 'medium',
    translateZ,
    shadowLayers,
  };
};

// ============================================================================
// Browser 3D Support Detection
// ============================================================================

/**
 * Check if browser supports 3D transforms
 * 
 * @returns Browser 3D support capabilities
 */
export const detect3DSupport = (): Browser3DSupport => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      transforms3D: false,
      perspective: false,
      backfaceVisibility: false,
      transformStyle: false,
    };
  }
  
  const testElement = document.createElement('div');
  const style = testElement.style;
  
  // Test 3D transforms
  const transforms3D = 
    'transform' in style &&
    CSS.supports('transform', 'perspective(1px)');
  
  // Test perspective
  const perspective = 
    'perspective' in style ||
    CSS.supports('perspective', '1px');
  
  // Test backface-visibility
  const backfaceVisibility = 
    'backfaceVisibility' in style ||
    CSS.supports('backface-visibility', 'hidden');
  
  // Test transform-style
  const transformStyle = 
    'transformStyle' in style ||
    CSS.supports('transform-style', 'preserve-3d');
  
  return {
    transforms3D,
    perspective,
    backfaceVisibility,
    transformStyle,
  };
};

/**
 * Check if browser fully supports 3D transforms
 * 
 * @returns True if all 3D features are supported
 */
export const supports3D = (): boolean => {
  const support = detect3DSupport();
  return (
    support.transforms3D &&
    support.perspective &&
    support.backfaceVisibility &&
    support.transformStyle
  );
};

/**
 * Get fallback transform for browsers without 3D support
 * 
 * @param config - Original 3D transform configuration
 * @returns 2D fallback transform configuration
 */
export const get2DFallback = (config: Transform3DConfig): Transform3DConfig => {
  return {
    perspective: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: config.rotateZ,
    translateZ: 0,
    scale: config.scale,
  };
};

/**
 * Apply transform with automatic fallback
 * 
 * @param config - 3D transform configuration
 * @returns CSS transform string with fallback
 */
export const applyTransformWithFallback = (
  config: Transform3DConfig
): string => {
  if (supports3D()) {
    return transformToCSS(config);
  }
  
  const fallback = get2DFallback(config);
  return transformToCSS(fallback);
};

// ============================================================================
// RTL (Right-to-Left) Support
// ============================================================================

/**
 * Adjust 3D transform for RTL layout
 * 
 * @param config - Original transform configuration
 * @param isRTL - Whether RTL layout is active
 * @returns Adjusted transform configuration
 */
export const adjustTransformForRTL = (
  config: Transform3DConfig,
  isRTL: boolean
): Transform3DConfig => {
  if (!isRTL) {
    return config;
  }
  
  // Invert Y rotation for RTL
  return {
    ...config,
    rotateY: -config.rotateY,
  };
};

// ============================================================================
// Performance Utilities
// ============================================================================

/**
 * Check if device is low-end (should use simplified effects)
 * 
 * @returns True if device is considered low-end
 */
export const isLowEndDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2;
  if (cores < 4) return true;
  
  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;
  
  return false;
};

/**
 * Check if user prefers reduced motion
 * 
 * @returns True if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Should simplify 3D effects based on device and user preferences
 * 
 * @returns True if effects should be simplified
 */
export const shouldSimplify3DEffects = (): boolean => {
  return isLowEndDevice() || prefersReducedMotion() || !supports3D();
};

/**
 * Get optimized transform configuration based on device capabilities
 * 
 * @param config - Original transform configuration
 * @returns Optimized transform configuration
 */
export const getOptimizedTransform = (
  config: Transform3DConfig
): Transform3DConfig => {
  if (shouldSimplify3DEffects()) {
    return {
      ...config,
      perspective: 0,
      rotateX: 0,
      rotateY: 0,
      translateZ: 0,
      scale: Math.min(config.scale, 1.02), // Limit scale for performance
    };
  }
  
  return config;
};

// ============================================================================
// Exports
// ============================================================================

export default {
  // Mouse position utilities
  getMousePosition,
  mouseToRotation,
  calculateMouseTransform,
  transformToCSS,
  
  // Depth configuration utilities
  getDepthConfig,
  shadowLayersToCSS,
  getDepthShadow,
  createCustomDepth,
  
  // Browser support detection
  detect3DSupport,
  supports3D,
  get2DFallback,
  applyTransformWithFallback,
  
  // RTL support
  adjustTransformForRTL,
  
  // Performance utilities
  isLowEndDevice,
  prefersReducedMotion,
  shouldSimplify3DEffects,
  getOptimizedTransform,
};
