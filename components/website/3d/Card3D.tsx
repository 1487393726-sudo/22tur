'use client';

/**
 * Card3D Component
 * 
 * A reusable 3D card component with mouse-based rotation effects,
 * glass morphism styling, and depth shadows.
 * 
 * Features:
 * - 3D transform on hover based on mouse position
 * - Configurable depth shadows (shallow/medium/deep)
 * - Glass effect integration
 * - Touch-optimized for mobile devices
 * - RTL layout support
 * - Accessibility compliant
 * 
 * Requirements: 1.1, 1.2, 1.3, 2.2, 5.5
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  calculateMouseTransform,
  getDepthShadow,
  transformToCSS,
  shouldSimplify3DEffects,
  adjustTransformForRTL,
  type Transform3DConfig,
} from '@/lib/utils/3d-transforms';
import { cn } from '@/lib/utils';

/**
 * Card3D Props Interface
 */
export interface Card3DProps {
  /** Card content */
  children: React.ReactNode;
  
  /** Hover effect intensity */
  intensity?: 'light' | 'medium' | 'heavy';
  
  /** Enable hover 3D effects */
  enableHover?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Shadow depth level */
  depth?: 'shallow' | 'medium' | 'deep';
  
  /** Glass effect variant */
  glassEffect?: 'light' | 'medium' | 'heavy' | 'none';
  
  /** Disable 3D effects (fallback to 2D) */
  disable3D?: boolean;
  
  /** RTL layout mode */
  isRTL?: boolean;
  
  /** ARIA label for accessibility */
  ariaLabel?: string;
  
  /** Role for accessibility */
  role?: string;
  
  /** Tab index for keyboard navigation */
  tabIndex?: number;
}

/**
 * Intensity configuration mapping
 */
const intensityConfig = {
  light: {
    maxRotation: 5,
    translateY: -5,
    scale: 1.01,
  },
  medium: {
    maxRotation: 10,
    translateY: -10,
    scale: 1.02,
  },
  heavy: {
    maxRotation: 15,
    translateY: -15,
    scale: 1.03,
  },
} as const;

/**
 * Card3D Component
 */
export const Card3D: React.FC<Card3DProps> = ({
  children,
  intensity = 'medium',
  enableHover = true,
  className,
  onClick,
  depth = 'medium',
  glassEffect = 'medium',
  disable3D = false,
  isRTL = false,
  ariaLabel,
  role,
  tabIndex = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [shouldSimplify, setShouldSimplify] = useState(false);
  
  // Motion values for smooth 3D transforms
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const translateY = useMotionValue(0);
  const scale = useMotionValue(1);
  
  // Spring configuration for smooth animations
  const springConfig = { stiffness: 150, damping: 20, mass: 1 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);
  const translateYSpring = useSpring(translateY, springConfig);
  const scaleSpring = useSpring(scale, springConfig);
  
  // Check device capabilities on mount
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 640);
      setShouldSimplify(shouldSimplify3DEffects());
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  // Get intensity configuration
  const config = intensityConfig[intensity];
  
  // Determine if 3D effects should be applied
  const use3D = enableHover && !disable3D && !shouldSimplify && !isMobile;
  
  /**
   * Handle mouse move for 3D tilt effect
   */
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!use3D || !cardRef.current) return;
      
      // Calculate 3D transform based on mouse position
      const transform = calculateMouseTransform(
        event,
        cardRef.current,
        {
          maxRotation: config.maxRotation,
          perspective: 1000,
        }
      );
      
      // Adjust for RTL if needed
      const adjustedTransform = adjustTransformForRTL(transform, isRTL);
      
      // Update motion values
      rotateX.set(adjustedTransform.rotateX);
      rotateY.set(adjustedTransform.rotateY);
    },
    [use3D, config.maxRotation, isRTL, rotateX, rotateY]
  );
  
  /**
   * Handle mouse enter
   */
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    
    if (use3D) {
      translateY.set(config.translateY);
      scale.set(config.scale);
    } else if (enableHover) {
      // Simplified hover for mobile/simplified mode
      translateY.set(-5);
      scale.set(1.01);
    }
  }, [use3D, enableHover, config, translateY, scale]);
  
  /**
   * Handle mouse leave
   */
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    
    // Reset all transforms
    rotateX.set(0);
    rotateY.set(0);
    translateY.set(0);
    scale.set(1);
  }, [rotateX, rotateY, translateY, scale]);
  
  /**
   * Handle keyboard interaction
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (onClick && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick();
      }
    },
    [onClick]
  );
  
  // Get depth shadow CSS
  const depthShadow = getDepthShadow(depth);
  
  // Glass effect class
  const glassClass = glassEffect !== 'none' ? `glass-${glassEffect}` : '';
  
  // Combine class names
  const cardClasses = cn(
    'relative rounded-lg overflow-hidden',
    'transition-shadow duration-300 ease-out',
    glassClass,
    onClick && 'cursor-pointer',
    className
  );
  
  // Motion props for tap animation
  const motionProps = onClick
    ? {
        whileTap: { scale: 0.98 },
      }
    : {};
  
  return (
    <motion.div
      ref={cardRef}
      className={cardClasses}
      style={{
        rotateX: use3D ? rotateXSpring : 0,
        rotateY: use3D ? rotateYSpring : 0,
        y: translateYSpring,
        scale: scaleSpring,
        transformStyle: 'preserve-3d',
        boxShadow: isHovered ? depthShadow : getDepthShadow('shallow'),
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={role || (onClick ? 'button' : undefined)}
      aria-label={ariaLabel}
      tabIndex={onClick ? tabIndex : undefined}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

/**
 * Card3D with custom transform (for advanced use cases)
 */
export interface Card3DCustomProps extends Omit<Card3DProps, 'intensity'> {
  /** Custom transform configuration */
  transform?: Transform3DConfig;
}

export const Card3DCustom: React.FC<Card3DCustomProps> = ({
  children,
  transform,
  className,
  depth = 'medium',
  glassEffect = 'medium',
  isRTL = false,
  ...props
}) => {
  const depthShadow = getDepthShadow(depth);
  const glassClass = glassEffect !== 'none' ? `glass-${glassEffect}` : '';
  
  const adjustedTransform = transform
    ? adjustTransformForRTL(transform, isRTL)
    : undefined;
  
  const transformCSS = adjustedTransform
    ? transformToCSS(adjustedTransform)
    : undefined;
  
  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden',
        'transition-all duration-300 ease-out',
        glassClass,
        className
      )}
      style={{
        transform: transformCSS,
        transformStyle: 'preserve-3d',
        boxShadow: depthShadow,
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card3D;
