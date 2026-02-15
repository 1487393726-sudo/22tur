/**
 * CountUpAnimation Component
 * Animates numbers counting up from 0 to target value when entering viewport
 * Requirements: 7.3
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

export interface CountUpAnimationProps {
  /**
   * Target number to count up to
   */
  end: number;
  
  /**
   * Starting number (defaults to 0)
   * @default 0
   */
  start?: number;
  
  /**
   * Duration of the counting animation in seconds
   * @default 2
   */
  duration?: number;
  
  /**
   * Text to display before the number
   */
  prefix?: string;
  
  /**
   * Text to display after the number
   */
  suffix?: string;
  
  /**
   * Number of decimal places to display
   * @default 0
   */
  decimals?: number;
  
  /**
   * Whether to use thousand separators (e.g., 1,000)
   * @default true
   */
  separator?: boolean;
  
  /**
   * Custom separator character
   * @default ','
   */
  separatorChar?: string;
  
  /**
   * Custom decimal character
   * @default '.'
   */
  decimalChar?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether to animate only once or every time it enters viewport
   * @default true
   */
  once?: boolean;
  
  /**
   * Threshold for triggering the animation (0-1)
   * @default 0.3
   */
  threshold?: number;
  
  /**
   * Easing function for the animation
   * @default 'easeOut'
   */
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Easing functions
 */
const easingFunctions = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
};

/**
 * Format number with separators and decimals
 */
const formatNumber = (
  value: number,
  decimals: number,
  separator: boolean,
  separatorChar: string,
  decimalChar: string
): string => {
  // Round to specified decimal places
  const rounded = Number(value.toFixed(decimals));
  
  // Split into integer and decimal parts
  const parts = rounded.toString().split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] || '';
  
  // Add thousand separators if enabled
  if (separator) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separatorChar);
  }
  
  // Combine parts
  if (decimals > 0 && decimalPart) {
    return `${integerPart}${decimalChar}${decimalPart.padEnd(decimals, '0')}`;
  }
  
  return integerPart;
};

/**
 * CountUpAnimation Component
 * 
 * Animates a number counting up from start to end value when the element
 * enters the viewport. Supports formatting with prefixes, suffixes, decimals,
 * and thousand separators. Uses Intersection Observer for efficient triggering.
 * 
 * @example
 * ```tsx
 * <CountUpAnimation 
 *   end={1000} 
 *   duration={2.5}
 *   suffix="+"
 *   separator={true}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * <CountUpAnimation 
 *   end={99.9} 
 *   decimals={1}
 *   suffix="%"
 *   prefix="$"
 * />
 * ```
 */
export const CountUpAnimation: React.FC<CountUpAnimationProps> = ({
  end,
  start = 0,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = true,
  separatorChar = ',',
  decimalChar = '.',
  className = '',
  once = true,
  threshold = 0.3,
  easing = 'easeOut',
}) => {
  const [count, setCount] = useState<number>(start);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
  });
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion()) {
      setCount(end);
      return;
    }

    // Skip if not in view or already animated (when once=true)
    if (!isInView || (once && hasAnimated)) {
      return;
    }

    // Mark as animated
    if (!hasAnimated) {
      setHasAnimated(true);
    }

    // Reset count to start value
    setCount(start);

    // Animation function
    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Apply easing function
      const easedProgress = easingFunctions[easing](progress);

      // Calculate current count
      const currentCount = start + (end - start) * easedProgress;
      setCount(currentCount);

      // Continue animation if not complete
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        // Ensure we end exactly at the target value
        setCount(end);
        startTimeRef.current = undefined;
      }
    };

    // Start animation
    frameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      startTimeRef.current = undefined;
    };
  }, [isInView, end, start, duration, easing, once, hasAnimated]);

  // Format the current count
  const formattedCount = formatNumber(
    count,
    decimals,
    separator,
    separatorChar,
    decimalChar
  );

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formattedCount}
      {suffix}
    </span>
  );
};

export default CountUpAnimation;
