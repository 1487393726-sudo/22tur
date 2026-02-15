'use client';

/**
 * FlipCard3D Component
 * 
 * A 3D flip card component that rotates 180 degrees to reveal content on the back.
 * Supports both hover and click triggers with glass morphism effects on both sides.
 * 
 * Features:
 * - 180-degree flip animation (rotateY)
 * - Hover and click trigger modes
 * - Glass effect on both front and back
 * - Keyboard navigation support (Enter/Space)
 * - Accessibility compliant
 * - Mobile optimized
 * - RTL layout support
 * 
 * Requirements: 9.2, 11.3
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cardFlip } from '@/lib/animations/variants';
import { cardTransitions } from '@/lib/animations/transitions';
import { getDepthShadow } from '@/lib/utils/3d-transforms';
import { cn } from '@/lib/utils';

/**
 * FlipCard3D Props Interface
 */
export interface FlipCard3DProps {
  /** Content for the front side of the card */
  frontContent: React.ReactNode;
  
  /** Content for the back side of the card */
  backContent: React.ReactNode;
  
  /** Trigger mode for flipping */
  flipTrigger?: 'hover' | 'click';
  
  /** Additional CSS classes */
  className?: string;
  
  /** Glass effect variant for both sides */
  glassEffect?: 'light' | 'medium' | 'heavy' | 'none';
  
  /** Shadow depth level */
  depth?: 'shallow' | 'medium' | 'deep';
  
  /** Initial flip state (false = front, true = back) */
  initialFlipped?: boolean;
  
  /** Controlled flip state */
  isFlipped?: boolean;
  
  /** Callback when flip state changes */
  onFlipChange?: (isFlipped: boolean) => void;
  
  /** Disable flip interaction */
  disabled?: boolean;
  
  /** RTL layout mode */
  isRTL?: boolean;
  
  /** ARIA label for accessibility */
  ariaLabel?: string;
  
  /** Tab index for keyboard navigation */
  tabIndex?: number;
  
  /** Width of the card */
  width?: string | number;
  
  /** Height of the card */
  height?: string | number;
}

/**
 * FlipCard3D Component
 */
export const FlipCard3D: React.FC<FlipCard3DProps> = ({
  frontContent,
  backContent,
  flipTrigger = 'click',
  className,
  glassEffect = 'medium',
  depth = 'medium',
  initialFlipped = false,
  isFlipped: controlledFlipped,
  onFlipChange,
  disabled = false,
  isRTL = false,
  ariaLabel,
  tabIndex = 0,
  width = '100%',
  height = 'auto',
}) => {
  // Internal flip state (used when not controlled)
  const [internalFlipped, setInternalFlipped] = useState(initialFlipped);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Determine if component is controlled
  const isControlled = controlledFlipped !== undefined;
  const isFlipped = isControlled ? controlledFlipped : internalFlipped;
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  /**
   * Handle flip toggle
   */
  const handleFlip = useCallback(() => {
    if (disabled) return;
    
    const newFlipped = !isFlipped;
    
    if (!isControlled) {
      setInternalFlipped(newFlipped);
    }
    
    onFlipChange?.(newFlipped);
  }, [disabled, isFlipped, isControlled, onFlipChange]);
  
  /**
   * Handle click event
   */
  const handleClick = useCallback(() => {
    if (flipTrigger === 'click') {
      handleFlip();
    }
  }, [flipTrigger, handleFlip]);
  
  /**
   * Handle mouse enter (for hover trigger)
   */
  const handleMouseEnter = useCallback(() => {
    if (flipTrigger === 'hover' && !disabled && !isMobile) {
      if (!isControlled) {
        setInternalFlipped(true);
      }
      onFlipChange?.(true);
    }
  }, [flipTrigger, disabled, isMobile, isControlled, onFlipChange]);
  
  /**
   * Handle mouse leave (for hover trigger)
   */
  const handleMouseLeave = useCallback(() => {
    if (flipTrigger === 'hover' && !disabled && !isMobile) {
      if (!isControlled) {
        setInternalFlipped(false);
      }
      onFlipChange?.(false);
    }
  }, [flipTrigger, disabled, isMobile, isControlled, onFlipChange]);
  
  /**
   * Handle keyboard interaction
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleFlip();
      }
    },
    [disabled, handleFlip]
  );
  
  // Get depth shadow CSS
  const depthShadow = getDepthShadow(depth);
  
  // Glass effect class
  const glassClass = glassEffect !== 'none' ? `glass-${glassEffect}` : '';
  
  // Container classes
  const containerClasses = cn(
    'relative',
    'preserve-3d',
    flipTrigger === 'click' && !disabled && 'cursor-pointer',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );
  
  // Card face classes
  const faceClasses = cn(
    'absolute inset-0',
    'rounded-lg overflow-hidden',
    'backface-hidden',
    glassClass,
    'transition-shadow duration-300'
  );
  
  // Rotation angle (adjust for RTL)
  const rotationAngle = isRTL ? -180 : 180;
  
  // Card style
  const cardStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    minHeight: height === 'auto' ? '200px' : undefined,
  };
  
  return (
    <div
      ref={cardRef}
      className={containerClasses}
      style={{
        perspective: '1000px',
        ...cardStyle,
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      role={flipTrigger === 'click' ? 'button' : undefined}
      aria-label={ariaLabel || `Flip card, currently showing ${isFlipped ? 'back' : 'front'}`}
      aria-pressed={flipTrigger === 'click' ? isFlipped : undefined}
      tabIndex={!disabled ? tabIndex : -1}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        initial={false}
        animate={isFlipped ? 'back' : 'front'}
        variants={{
          front: {
            rotateY: 0,
            transition: cardTransitions.flip,
          },
          back: {
            rotateY: rotationAngle,
            transition: cardTransitions.flip,
          },
        }}
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* Front Face */}
        <div
          className={faceClasses}
          style={{
            boxShadow: depthShadow,
            transform: 'rotateY(0deg)',
          }}
          aria-hidden={isFlipped}
        >
          {frontContent}
        </div>
        
        {/* Back Face */}
        <div
          className={faceClasses}
          style={{
            boxShadow: depthShadow,
            transform: `rotateY(${rotationAngle}deg)`,
          }}
          aria-hidden={!isFlipped}
        >
          {backContent}
        </div>
      </motion.div>
    </div>
  );
};

/**
 * FlipCard3D with custom animation
 * Provides more control over flip animation
 */
export interface FlipCard3DCustomProps extends Omit<FlipCard3DProps, 'flipTrigger'> {
  /** Custom flip duration (in seconds) */
  flipDuration?: number;
  
  /** Custom flip easing */
  flipEasing?: [number, number, number, number];
  
  /** Enable manual flip control only */
  manualOnly?: boolean;
}

export const FlipCard3DCustom: React.FC<FlipCard3DCustomProps> = ({
  frontContent,
  backContent,
  className,
  glassEffect = 'medium',
  depth = 'medium',
  initialFlipped = false,
  isFlipped: controlledFlipped,
  onFlipChange,
  disabled = false,
  isRTL = false,
  ariaLabel,
  tabIndex = 0,
  width = '100%',
  height = 'auto',
  flipDuration = 0.6,
  flipEasing = [0.4, 0, 0.2, 1],
  manualOnly = false,
}) => {
  const [internalFlipped, setInternalFlipped] = useState(initialFlipped);
  const isControlled = controlledFlipped !== undefined;
  const isFlipped = isControlled ? controlledFlipped : internalFlipped;
  
  const handleFlip = useCallback(() => {
    if (disabled) return;
    
    const newFlipped = !isFlipped;
    
    if (!isControlled) {
      setInternalFlipped(newFlipped);
    }
    
    onFlipChange?.(newFlipped);
  }, [disabled, isFlipped, isControlled, onFlipChange]);
  
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleFlip();
      }
    },
    [disabled, handleFlip]
  );
  
  const depthShadow = getDepthShadow(depth);
  const glassClass = glassEffect !== 'none' ? `glass-${glassEffect}` : '';
  const rotationAngle = isRTL ? -180 : 180;
  
  const containerClasses = cn(
    'relative',
    'preserve-3d',
    !manualOnly && !disabled && 'cursor-pointer',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );
  
  const faceClasses = cn(
    'absolute inset-0',
    'rounded-lg overflow-hidden',
    'backface-hidden',
    glassClass,
    'transition-shadow duration-300'
  );
  
  const cardStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    minHeight: height === 'auto' ? '200px' : undefined,
  };
  
  return (
    <div
      className={containerClasses}
      style={{
        perspective: '1000px',
        ...cardStyle,
      }}
      onClick={!manualOnly ? handleFlip : undefined}
      onKeyDown={handleKeyDown}
      role={!manualOnly ? 'button' : undefined}
      aria-label={ariaLabel || `Flip card, currently showing ${isFlipped ? 'back' : 'front'}`}
      aria-pressed={!manualOnly ? isFlipped : undefined}
      tabIndex={!disabled ? tabIndex : -1}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        initial={false}
        animate={{
          rotateY: isFlipped ? rotationAngle : 0,
        }}
        transition={{
          duration: flipDuration,
          ease: flipEasing,
        }}
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* Front Face */}
        <div
          className={faceClasses}
          style={{
            boxShadow: depthShadow,
            transform: 'rotateY(0deg)',
          }}
          aria-hidden={isFlipped}
        >
          {frontContent}
        </div>
        
        {/* Back Face */}
        <div
          className={faceClasses}
          style={{
            boxShadow: depthShadow,
            transform: `rotateY(${rotationAngle}deg)`,
          }}
          aria-hidden={!isFlipped}
        >
          {backContent}
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard3D;
