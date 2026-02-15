'use client';

/**
 * CardGrid3D Component
 * 
 * A responsive grid layout component for 3D cards with stagger animations
 * triggered by Intersection Observer.
 * 
 * Features:
 * - Responsive column configuration (mobile/tablet/desktop)
 * - Intersection Observer for scroll-triggered animations
 * - Stagger animation effect (sequential display)
 * - Performance optimized with viewport detection
 * - RTL layout support
 * - Accessibility compliant
 * 
 * Requirements: 4.2, 5.2, 5.3, 5.4
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations/variants';
import { getMobileOptimizedStagger } from '@/lib/animations/transitions';
import { cn } from '@/lib/utils';

/**
 * Responsive column configuration
 */
export interface ResponsiveColumns {
  /** Number of columns on mobile (<640px) */
  mobile: number;
  /** Number of columns on tablet (640px-1024px) */
  tablet: number;
  /** Number of columns on desktop (>1024px) */
  desktop: number;
}

/**
 * CardGrid3D Props Interface
 */
export interface CardGrid3DProps {
  /** Grid items (Card3D components or other elements) */
  children: React.ReactNode;
  
  /** Responsive column configuration */
  columns?: ResponsiveColumns;
  
  /** Gap between grid items (Tailwind spacing value) */
  gap?: string;
  
  /** Delay between each item animation (in seconds) */
  staggerDelay?: number;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Disable animations */
  disableAnimation?: boolean;
  
  /** Intersection Observer threshold (0-1) */
  threshold?: number;
  
  /** Trigger animation only once */
  once?: boolean;
  
  /** Custom animation delay before starting */
  animationDelay?: number;
  
  /** ARIA label for accessibility */
  ariaLabel?: string;
  
  /** Role for accessibility */
  role?: string;
}

/**
 * Default column configuration
 */
const defaultColumns: ResponsiveColumns = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
};

/**
 * CardGrid3D Component
 */
export const CardGrid3D: React.FC<CardGrid3DProps> = ({
  children,
  columns = defaultColumns,
  gap = '6',
  staggerDelay = 0.1,
  className,
  disableAnimation = false,
  threshold = 0.1,
  once = true,
  animationDelay = 0,
  ariaLabel,
  role,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, {
    once,
    amount: threshold,
  });
  
  const [isMounted, setIsMounted] = useState(false);
  
  // Ensure component is mounted before animating
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Convert children to array for mapping
  const childArray = React.Children.toArray(children);
  
  // Get optimized stagger configuration
  const staggerConfig = getMobileOptimizedStagger({
    staggerChildren: staggerDelay,
    delayChildren: animationDelay,
  });
  
  // Grid column classes based on responsive configuration
  const gridColsClass = cn(
    // Mobile columns
    `grid-cols-${columns.mobile}`,
    // Tablet columns
    `md:grid-cols-${columns.tablet}`,
    // Desktop columns
    `lg:grid-cols-${columns.desktop}`
  );
  
  // Container classes
  const containerClasses = cn(
    'grid',
    gridColsClass,
    `gap-${gap}`,
    'w-full',
    className
  );
  
  // Animation variants
  const containerVariants = disableAnimation
    ? undefined
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: staggerConfig,
        },
      };
  
  const itemVariants = disableAnimation ? undefined : staggerItem;
  
  // Determine animation state
  const animationState = disableAnimation
    ? undefined
    : isMounted && isInView
    ? 'visible'
    : 'hidden';
  
  return (
    <motion.div
      ref={containerRef}
      className={containerClasses}
      variants={containerVariants}
      initial="hidden"
      animate={animationState}
      role={role || 'list'}
      aria-label={ariaLabel}
    >
      {childArray.map((child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          role={role ? 'listitem' : undefined}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * CardGrid3D with custom stagger animation
 * Provides more control over individual item animations
 */
export interface CardGrid3DCustomProps extends Omit<CardGrid3DProps, 'staggerDelay'> {
  /** Custom stagger function: (index: number) => delay in seconds */
  getItemDelay?: (index: number) => number;
  
  /** Custom animation variants for items */
  itemVariants?: any;
}

export const CardGrid3DCustom: React.FC<CardGrid3DCustomProps> = ({
  children,
  columns = defaultColumns,
  gap = '6',
  className,
  disableAnimation = false,
  threshold = 0.1,
  once = true,
  animationDelay = 0,
  getItemDelay,
  itemVariants,
  ariaLabel,
  role,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, {
    once,
    amount: threshold,
  });
  
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const childArray = React.Children.toArray(children);
  
  // Grid column classes
  const gridColsClass = cn(
    `grid-cols-${columns.mobile}`,
    `md:grid-cols-${columns.tablet}`,
    `lg:grid-cols-${columns.desktop}`
  );
  
  const containerClasses = cn(
    'grid',
    gridColsClass,
    `gap-${gap}`,
    'w-full',
    className
  );
  
  const animationState = disableAnimation
    ? undefined
    : isMounted && isInView
    ? 'visible'
    : 'hidden';
  
  return (
    <div
      ref={containerRef}
      className={containerClasses}
      role={role || 'list'}
      aria-label={ariaLabel}
    >
      {childArray.map((child, index) => {
        const delay = getItemDelay ? getItemDelay(index) : index * 0.1;
        
        return (
          <motion.div
            key={index}
            variants={itemVariants || staggerItem}
            initial="hidden"
            animate={animationState}
            transition={{
              delay: animationDelay + delay,
            }}
            role={role ? 'listitem' : undefined}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  );
};

/**
 * Utility: Create wave stagger effect
 * Items animate in a wave pattern based on their position
 */
export const createWaveStagger = (
  columns: number,
  baseDelay: number = 0.05
): ((index: number) => number) => {
  return (index: number) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    return (row + col) * baseDelay;
  };
};

/**
 * Utility: Create diagonal stagger effect
 * Items animate diagonally across the grid
 */
export const createDiagonalStagger = (
  columns: number,
  baseDelay: number = 0.05
): ((index: number) => number) => {
  return (index: number) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    return (row + col) * baseDelay;
  };
};

/**
 * Utility: Create spiral stagger effect
 * Items animate in a spiral pattern from center
 */
export const createSpiralStagger = (
  columns: number,
  rows: number,
  baseDelay: number = 0.05
): ((index: number) => number) => {
  return (index: number) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    
    // Calculate distance from center
    const centerRow = rows / 2;
    const centerCol = columns / 2;
    const distance = Math.sqrt(
      Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
    );
    
    return distance * baseDelay;
  };
};

/**
 * Utility: Create random stagger effect
 * Items animate in random order
 */
export const createRandomStagger = (
  totalItems: number,
  baseDelay: number = 0.05,
  seed?: number
): ((index: number) => number) => {
  // Generate random order
  const order = Array.from({ length: totalItems }, (_, i) => i);
  
  // Simple seeded shuffle
  if (seed !== undefined) {
    let currentSeed = seed;
    for (let i = order.length - 1; i > 0; i--) {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      const j = Math.floor((currentSeed / 233280) * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  } else {
    // Random shuffle
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  }
  
  return (index: number) => {
    const position = order.indexOf(index);
    return position * baseDelay;
  };
};

export default CardGrid3D;
