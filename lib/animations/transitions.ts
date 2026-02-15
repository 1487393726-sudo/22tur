/**
 * Framer Motion Transition Configurations
 * Defines reusable transition settings for animations
 * Requirements: 4.2, 4.3, 4.5, 4.6
 */

import { Transition } from 'framer-motion';

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if device is mobile
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 640;
};

/**
 * Easing functions for smooth animations
 */
export const easings = {
  // Standard easings
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  
  // Custom easings for 3D effects
  smooth: [0.25, 0.1, 0.25, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.175, 0.885, 0.32, 1.275],
  
  // Sharp easings for quick interactions
  sharp: [0.4, 0, 0.6, 1],
  snappy: [0.25, 0.46, 0.45, 0.94],
} as const;

/**
 * Duration presets (in seconds)
 */
export const durations = {
  instant: 0,
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
  slowest: 1.2,
} as const;

/**
 * Spring configurations for natural motion
 */
export const springs = {
  // Gentle spring for subtle animations
  gentle: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 15,
    mass: 1,
  },
  
  // Default spring for most interactions
  default: {
    type: 'spring' as const,
    stiffness: 150,
    damping: 20,
    mass: 1,
  },
  
  // Bouncy spring for playful animations
  bouncy: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 15,
    mass: 1,
  },
  
  // Stiff spring for quick, responsive animations
  stiff: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 25,
    mass: 1,
  },
  
  // Smooth spring for card interactions
  smooth: {
    type: 'spring' as const,
    stiffness: 120,
    damping: 18,
    mass: 0.8,
  },
} as const;

/**
 * Base transition configurations
 */
export const baseTransitions = {
  // Fast transition for hover effects
  fast: {
    duration: durations.fast,
    ease: easings.easeOut,
  } as Transition,
  
  // Normal transition for most animations
  normal: {
    duration: durations.normal,
    ease: easings.easeInOut,
  } as Transition,
  
  // Slow transition for emphasis
  slow: {
    duration: durations.slow,
    ease: easings.smooth,
  } as Transition,
  
  // Smooth transition for 3D transforms
  smooth: {
    duration: durations.normal,
    ease: easings.smooth,
  } as Transition,
} as const;

/**
 * Card-specific transitions
 */
export const cardTransitions = {
  // Hover transition for cards
  hover: {
    duration: durations.normal,
    ease: easings.smooth,
  } as Transition,
  
  // Tap transition for cards
  tap: {
    duration: durations.fast,
    ease: easings.sharp,
  } as Transition,
  
  // 3D tilt transition
  tilt: {
    duration: durations.normal,
    ease: easings.easeOut,
  } as Transition,
  
  // Flip transition
  flip: {
    duration: 0.6,
    ease: easings.easeInOut,
  } as Transition,
} as const;

/**
 * Stagger transition configurations
 */
export const staggerTransitions = {
  // Default stagger
  default: {
    staggerChildren: 0.1,
    delayChildren: 0.1,
  },
  
  // Fast stagger for many items
  fast: {
    staggerChildren: 0.05,
    delayChildren: 0.05,
  },
  
  // Slow stagger for emphasis
  slow: {
    staggerChildren: 0.15,
    delayChildren: 0.15,
  },
  
  // Mobile-optimized stagger
  mobile: {
    staggerChildren: 0.05,
    delayChildren: 0.05,
  },
} as const;

/**
 * Page transition configurations
 */
export const pageTransitions = {
  // Fade transition
  fade: {
    duration: durations.normal,
    ease: easings.easeInOut,
  } as Transition,
  
  // Slide transition
  slide: {
    duration: durations.normal,
    ease: easings.smooth,
  } as Transition,
  
  // Scale transition
  scale: {
    duration: durations.normal,
    ease: easings.easeOut,
  } as Transition,
} as const;

/**
 * Modal transition configurations
 */
export const modalTransitions = {
  // Backdrop fade
  backdrop: {
    duration: durations.fast,
    ease: easings.easeOut,
  } as Transition,
  
  // Content animation
  content: {
    duration: durations.normal,
    ease: easings.smooth,
  } as Transition,
} as const;

/**
 * Get transition with mobile optimization
 * Reduces duration by 30% on mobile devices
 */
export const getMobileOptimizedTransition = (
  transition: Transition
): Transition => {
  if (prefersReducedMotion()) {
    return { duration: 0 };
  }
  
  if (!isMobile()) {
    return transition;
  }
  
  // Optimize for mobile
  if (transition.duration) {
    return {
      ...transition,
      duration: transition.duration * 0.7,
    };
  }
  
  if (transition.type === 'spring') {
    return {
      ...transition,
      stiffness: (transition.stiffness || 150) * 1.2,
      damping: (transition.damping || 20) * 1.1,
    };
  }
  
  return transition;
};

/**
 * Get stagger configuration with mobile optimization
 */
export const getMobileOptimizedStagger = (
  stagger: { staggerChildren?: number; delayChildren?: number }
): { staggerChildren?: number; delayChildren?: number } => {
  if (prefersReducedMotion()) {
    return {
      staggerChildren: 0,
      delayChildren: 0,
    };
  }
  
  if (!isMobile()) {
    return stagger;
  }
  
  return {
    staggerChildren: (stagger.staggerChildren || 0.1) * 0.7,
    delayChildren: (stagger.delayChildren || 0) * 0.7,
  };
};

/**
 * Create custom transition with delay
 */
export const createDelayedTransition = (
  baseTransition: Transition,
  delay: number
): Transition => {
  return {
    ...baseTransition,
    delay: isMobile() ? delay * 0.7 : delay,
  };
};

/**
 * Create stagger delay for individual items
 */
export const createStaggerDelay = (
  index: number,
  baseDelay: number = 0.1
): number => {
  if (prefersReducedMotion()) return 0;
  const delay = index * baseDelay;
  return isMobile() ? delay * 0.7 : delay;
};

/**
 * GPU-accelerated properties for optimal performance
 * These properties trigger GPU acceleration and should be preferred
 */
export const gpuAcceleratedProps = [
  'transform',
  'opacity',
  'filter',
] as const;

/**
 * Check if a property is GPU-accelerated
 */
export const isGPUAccelerated = (property: string): boolean => {
  return gpuAcceleratedProps.includes(property as any);
};

/**
 * Get optimal transition based on context
 */
export const getOptimalTransition = (
  context: 'hover' | 'tap' | 'scroll' | 'page' | 'modal'
): Transition => {
  const transitions = {
    hover: cardTransitions.hover,
    tap: cardTransitions.tap,
    scroll: baseTransitions.slow,
    page: pageTransitions.fade,
    modal: modalTransitions.content,
  };
  
  return getMobileOptimizedTransition(transitions[context]);
};

/**
 * Export all transition configurations
 */
export const transitions = {
  easings,
  durations,
  springs,
  base: baseTransitions,
  card: cardTransitions,
  stagger: staggerTransitions,
  page: pageTransitions,
  modal: modalTransitions,
} as const;

export default transitions;
