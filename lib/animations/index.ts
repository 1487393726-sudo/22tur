/**
 * Animation System Entry Point
 * Exports all animation variants, transitions, and utilities
 * Requirements: 4.2, 4.3, 4.5, 4.6
 */

// Export all variants
export * from './variants';
export { default as animationVariants } from './variants';

// Export all transitions
export * from './transitions';
export { default as transitions } from './transitions';

// Re-export commonly used items for convenience
export {
  // Basic animations
  fadeIn,
  fadeInUp,
  fadeInDown,
  slideInLeft,
  slideInRight,
  slideInTop,
  slideInBottom,
  scaleIn,
  scaleInRotate,
  
  // Card interactions
  cardHover,
  cardTap,
  card3DTilt,
  cardFlip,
  
  // Stagger animations
  staggerContainer,
  staggerItem,
  staggerItemScale,
  
  // Page transitions
  pageTransition,
  pageSlide,
  
  // Modal animations
  modalBackdrop,
  modalContent,
  
  // Mobile optimized
  mobileFadeIn,
  mobileSlideIn,
  mobileCardHover,
  
  // Utilities
  getResponsiveVariant,
  createStaggerDelay,
} from './variants';

export {
  // Transition configurations
  easings,
  durations,
  springs,
  baseTransitions,
  cardTransitions,
  staggerTransitions,
  pageTransitions,
  modalTransitions,
  
  // Utility functions
  prefersReducedMotion,
  isMobile,
  getMobileOptimizedTransition,
  getMobileOptimizedStagger,
  createDelayedTransition,
  getOptimalTransition,
  isGPUAccelerated,
  gpuAcceleratedProps,
} from './transitions';
