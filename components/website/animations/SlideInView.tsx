/**
 * SlideInView Animation Component
 * Wrapper component that slides in children from a specified direction when they enter the viewport
 * Requirements: 4.2
 */

'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import {
  slideInLeft,
  slideInRight,
  slideInTop,
  slideInBottom,
} from '@/lib/animations/variants';
import { getMobileOptimizedTransition } from '@/lib/animations/transitions';

export type SlideDirection = 'left' | 'right' | 'up' | 'down';

export interface SlideInViewProps {
  /**
   * Content to animate
   */
  children: React.ReactNode;
  
  /**
   * Direction from which the element slides in
   * @default 'up'
   */
  direction?: SlideDirection;
  
  /**
   * Delay before animation starts (in seconds)
   * @default 0
   */
  delay?: number;
  
  /**
   * Duration of the animation (in seconds)
   * @default 0.5
   */
  duration?: number;
  
  /**
   * Threshold for triggering the animation (0-1)
   * 0 = as soon as any part enters viewport
   * 1 = only when fully in viewport
   * @default 0.1
   */
  threshold?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether to animate only once or every time it enters viewport
   * @default true
   */
  once?: boolean;
}

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get the appropriate animation variant based on direction
 */
const getVariantForDirection = (direction: SlideDirection) => {
  const variantMap = {
    left: slideInLeft,
    right: slideInRight,
    up: slideInBottom, // Slide up means coming from bottom
    down: slideInTop,   // Slide down means coming from top
  };
  
  return variantMap[direction];
};

/**
 * SlideInView Component
 * 
 * Wraps children with a slide-in animation that triggers when the element
 * enters the viewport. Supports four directions (left, right, up, down),
 * customizable delay, duration, and threshold.
 * Automatically respects user's prefers-reduced-motion setting and
 * optimizes animations for mobile devices.
 * 
 * @example
 * ```tsx
 * <SlideInView direction="left" delay={0.2} duration={0.6}>
 *   <h1>This will slide in from the left</h1>
 * </SlideInView>
 * ```
 */
export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  threshold = 0.1,
  className,
  once = true,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
  });

  // Check for reduced motion preference
  const shouldReduceMotion = prefersReducedMotion();

  // Get the appropriate variant for the direction
  const variants = getVariantForDirection(direction);

  // Create custom transition with user-provided values
  const customTransition = getMobileOptimizedTransition({
    duration: shouldReduceMotion ? 0 : duration,
    delay: shouldReduceMotion ? 0 : delay,
    ease: [0.4, 0, 0.2, 1],
  });

  // If reduced motion is preferred, skip animation
  if (shouldReduceMotion) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={customTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default SlideInView;
