/**
 * Framer Motion Animation Variants
 * Defines reusable animation variants for the 3D website redesign
 * Requirements: 4.2, 4.3, 4.6
 */

import { Variants, Transition } from 'framer-motion';

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if device is mobile (viewport width < 640px)
 */
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 640;
};

/**
 * Get transition with mobile optimization
 */
const getTransition = (
  duration: number,
  delay: number = 0,
  ease: [number, number, number, number] = [0.4, 0, 0.2, 1]
): Transition => {
  // Simplify animations on mobile or for users who prefer reduced motion
  if (prefersReducedMotion()) {
    return { duration: 0 };
  }
  
  if (isMobileDevice()) {
    return {
      duration: duration * 0.7, // 30% faster on mobile
      delay: delay * 0.7,
      ease,
    };
  }

  return {
    duration,
    delay,
    ease,
  };
};

// ============================================================================
// Basic Animation Variants
// ============================================================================

/**
 * Fade In Animation
 * Simple opacity transition from 0 to 1
 */
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: getTransition(0.5),
  },
  exit: {
    opacity: 0,
    transition: getTransition(0.3),
  },
};

/**
 * Fade In with slight upward movement
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: getTransition(0.5),
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: getTransition(0.3),
  },
};

/**
 * Fade In with slight downward movement
 */
export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: getTransition(0.5),
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: getTransition(0.3),
  },
};

// ============================================================================
// Slide In Animations
// ============================================================================

/**
 * Slide In from Left
 */
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: getTransition(0.5),
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: getTransition(0.3),
  },
};

/**
 * Slide In from Right
 */
export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: getTransition(0.5),
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: getTransition(0.3),
  },
};

/**
 * Slide In from Top
 */
export const slideInTop: Variants = {
  hidden: {
    opacity: 0,
    y: -50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: getTransition(0.5),
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: getTransition(0.3),
  },
};

/**
 * Slide In from Bottom
 */
export const slideInBottom: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: getTransition(0.5),
  },
  exit: {
    opacity: 0,
    y: 50,
    transition: getTransition(0.3),
  },
};

// ============================================================================
// Scale Animations
// ============================================================================

/**
 * Scale In Animation
 * Grows from 0.8 to 1.0 scale
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: getTransition(0.5),
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: getTransition(0.3),
  },
};

/**
 * Scale In with slight rotation
 */
export const scaleInRotate: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotate: -5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: getTransition(0.5),
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    rotate: -5,
    transition: getTransition(0.3),
  },
};

// ============================================================================
// Card Interaction Variants
// ============================================================================

/**
 * Card Hover Animation
 * Lifts card with 3D transform on hover
 */
export const cardHover: Variants = {
  initial: {
    y: 0,
    scale: 1,
    rotateX: 0,
    rotateY: 0,
  },
  hover: isMobileDevice()
    ? {
        // Simplified hover for mobile
        y: -5,
        scale: 1.01,
        transition: getTransition(0.2),
      }
    : {
        // Full 3D effect for desktop
        y: -10,
        scale: 1.02,
        rotateX: 5,
        transition: getTransition(0.3),
      },
};

/**
 * Card Tap Animation
 * Slight scale down on tap/click
 */
export const cardTap: Variants = {
  initial: {
    scale: 1,
  },
  tap: {
    scale: 0.98,
    transition: getTransition(0.1),
  },
};

/**
 * Card 3D Tilt Animation
 * More pronounced 3D effect for feature cards
 */
export const card3DTilt: Variants = {
  initial: {
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  },
  hover: isMobileDevice()
    ? {
        // No tilt on mobile
        scale: 1.02,
        transition: getTransition(0.2),
      }
    : {
        // Dynamic tilt based on mouse position (to be controlled by component)
        scale: 1.05,
        transition: getTransition(0.3),
      },
};

/**
 * Card Flip Animation
 * 180-degree flip for flip cards
 */
export const cardFlip: Variants = {
  front: {
    rotateY: 0,
    transition: getTransition(0.6),
  },
  back: {
    rotateY: 180,
    transition: getTransition(0.6),
  },
};

// ============================================================================
// Stagger Container Variants
// ============================================================================

/**
 * Container for staggered children animations
 */
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: isMobileDevice() ? 0.05 : 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Stagger item (child) animation
 */
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: getTransition(0.5),
  },
};

/**
 * Stagger item with scale
 */
export const staggerItemScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: getTransition(0.5),
  },
};

// ============================================================================
// Page Transition Variants
// ============================================================================

/**
 * Page fade transition
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: getTransition(0.3),
  },
  exit: {
    opacity: 0,
    transition: getTransition(0.2),
  },
};

/**
 * Page slide transition
 */
export const pageSlide: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: getTransition(0.3),
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: getTransition(0.2),
  },
};

// ============================================================================
// Modal/Dialog Variants
// ============================================================================

/**
 * Modal backdrop animation
 */
export const modalBackdrop: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: getTransition(0.2),
  },
  exit: {
    opacity: 0,
    transition: getTransition(0.2),
  },
};

/**
 * Modal content animation
 */
export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: getTransition(0.3),
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: getTransition(0.2),
  },
};

// ============================================================================
// Mobile-Optimized Variants
// ============================================================================

/**
 * Mobile-optimized fade in (faster, no movement)
 */
export const mobileFadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

/**
 * Mobile-optimized slide (reduced distance)
 */
export const mobileSlideIn: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

/**
 * Mobile-optimized card hover (minimal effect)
 */
export const mobileCardHover: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get appropriate variant based on device type
 */
export const getResponsiveVariant = (
  desktopVariant: Variants,
  mobileVariant: Variants
): Variants => {
  return isMobileDevice() ? mobileVariant : desktopVariant;
};

/**
 * Create custom delay for stagger effect
 */
export const createStaggerDelay = (index: number, baseDelay: number = 0.1): number => {
  const delay = index * baseDelay;
  return isMobileDevice() ? delay * 0.7 : delay;
};

/**
 * Export all variants as a collection
 */
export const animationVariants = {
  // Basic
  fadeIn,
  fadeInUp,
  fadeInDown,
  
  // Slide
  slideInLeft,
  slideInRight,
  slideInTop,
  slideInBottom,
  
  // Scale
  scaleIn,
  scaleInRotate,
  
  // Card interactions
  cardHover,
  cardTap,
  card3DTilt,
  cardFlip,
  
  // Stagger
  staggerContainer,
  staggerItem,
  staggerItemScale,
  
  // Page transitions
  pageTransition,
  pageSlide,
  
  // Modal
  modalBackdrop,
  modalContent,
  
  // Mobile optimized
  mobileFadeIn,
  mobileSlideIn,
  mobileCardHover,
} as const;

export default animationVariants;
