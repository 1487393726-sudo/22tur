/**
 * FadeInView Animation Component
 * Wrapper component that fades in children when they enter the viewport
 * Requirements: 4.2
 */

'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeIn } from '@/lib/animations/variants';
import { getMobileOptimizedTransition } from '@/lib/animations/transitions';

export interface FadeInViewProps {
  /**
   * Content to animate
   */
  children: React.ReactNode;
  
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
 * FadeInView Component
 * 
 * Wraps children with a fade-in animation that triggers when the element
 * enters the viewport. Supports customizable delay, duration, and threshold.
 * Automatically respects user's prefers-reduced-motion setting.
 * 
 * @example
 * ```tsx
 * <FadeInView delay={0.2} duration={0.6}>
 *   <h1>This will fade in</h1>
 * </FadeInView>
 * ```
 */
export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
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
      variants={fadeIn}
      transition={customTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeInView;
