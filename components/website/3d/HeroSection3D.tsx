'use client';

/**
 * HeroSection3D Component
 * 
 * Eye-catching hero section with 3D elements, parallax scrolling,
 * floating animations, gradient backgrounds, and glass CTA button.
 * 
 * Features:
 * - Parallax scrolling effect
 * - 3D floating elements animation
 * - Gradient background with depth
 * - Animated text entrance
 * - Glass morphism CTA button with 3D hover effect
 * - Responsive design with mobile optimization
 * - RTL layout support
 * - Accessibility compliant
 * 
 * Requirements: 1.4, 7.1, 7.5
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeInUp, fadeInDown } from '@/lib/animations/variants';

/**
 * HeroSection3D Props Interface
 */
export interface HeroSection3DProps {
  /** Main title text */
  title: string;
  
  /** Subtitle or description text */
  subtitle: string;
  
  /** Call-to-action button text */
  ctaText: string;
  
  /** CTA button link/href */
  ctaLink: string;
  
  /** Optional background image URL */
  backgroundImage?: string;
  
  /** Current locale for text direction */
  locale: string;
  
  /** Additional CSS classes */
  className?: string;
  
  /** CTA button click handler */
  onCtaClick?: () => void;
  
  /** Enable parallax scrolling effect */
  enableParallax?: boolean;
  
  /** Enable floating elements animation */
  enableFloatingElements?: boolean;
  
  /** Gradient color scheme */
  gradientScheme?: 'blue' | 'purple' | 'green' | 'orange';
}

/**
 * Gradient configurations for different color schemes
 */
const gradientSchemes = {
  blue: {
    from: 'from-blue-600/20',
    via: 'via-cyan-500/10',
    to: 'to-purple-600/20',
    accent: 'bg-blue-500/10',
  },
  purple: {
    from: 'from-purple-600/20',
    via: 'via-pink-500/10',
    to: 'to-indigo-600/20',
    accent: 'bg-purple-500/10',
  },
  green: {
    from: 'from-green-600/20',
    via: 'via-emerald-500/10',
    to: 'to-teal-600/20',
    accent: 'bg-green-500/10',
  },
  orange: {
    from: 'from-orange-600/20',
    via: 'via-amber-500/10',
    to: 'to-red-600/20',
    accent: 'bg-orange-500/10',
  },
};

/**
 * Floating element configuration
 */
interface FloatingElement {
  id: string;
  size: number;
  initialX: number;
  initialY: number;
  duration: number;
  delay: number;
}

/**
 * Generate random floating elements
 */
const generateFloatingElements = (count: number = 6): FloatingElement[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `float-${i}`,
    size: Math.random() * 100 + 50, // 50-150px
    initialX: Math.random() * 100, // 0-100%
    initialY: Math.random() * 100, // 0-100%
    duration: Math.random() * 10 + 15, // 15-25s
    delay: Math.random() * 5, // 0-5s
  }));
};

/**
 * HeroSection3D Component
 */
export const HeroSection3D: React.FC<HeroSection3DProps> = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  backgroundImage,
  locale,
  className,
  onCtaClick,
  enableParallax = true,
  enableFloatingElements = true,
  gradientScheme = 'blue',
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [floatingElements] = useState(() => generateFloatingElements());
  const [isMobile, setIsMobile] = useState(false);
  const isRTL = locale === 'ug';
  
  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  
  // Smooth spring animation for parallax
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  
  // Transform values for parallax layers
  const y1 = useTransform(smoothProgress, [0, 1], [0, enableParallax ? 100 : 0]);
  const y2 = useTransform(smoothProgress, [0, 1], [0, enableParallax ? 200 : 0]);
  const y3 = useTransform(smoothProgress, [0, 1], [0, enableParallax ? 300 : 0]);
  const opacity = useTransform(smoothProgress, [0, 0.5, 1], [1, 0.8, 0.3]);
  
  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Get gradient colors
  const gradient = gradientSchemes[gradientScheme];
  
  // Handle CTA click
  const handleCtaClick = (e: React.MouseEvent) => {
    if (onCtaClick) {
      e.preventDefault();
      onCtaClick();
    }
  };
  
  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative min-h-screen flex items-center justify-center overflow-hidden',
        'bg-gradient-to-br from-gray-50 via-white to-gray-100',
        'dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Gradient Background Layer with Depth */}
      <motion.div
        className={cn(
          'absolute inset-0 bg-gradient-to-br',
          gradient.from,
          gradient.via,
          gradient.to
        )}
        style={{ y: y3, opacity }}
        aria-hidden="true"
      />
      
      {/* Optional Background Image with Parallax */}
      {backgroundImage && (
        <motion.div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            y: y2,
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Floating 3D Elements */}
      {enableFloatingElements && !isMobile && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {floatingElements.map((element) => (
            <motion.div
              key={element.id}
              className={cn(
                'absolute rounded-full blur-3xl',
                gradient.accent
              )}
              style={{
                width: element.size,
                height: element.size,
                left: `${element.initialX}%`,
                top: `${element.initialY}%`,
              }}
              animate={{
                x: [0, 30, -30, 0],
                y: [0, -40, 40, 0],
                scale: [1, 1.1, 0.9, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: element.duration,
                delay: element.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
      
      {/* Content Container with Parallax */}
      <motion.div
        className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8"
        style={{ y: y1 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Title with Animated Entrance */}
          <motion.h1
            className={cn(
              'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold',
              'bg-clip-text text-transparent',
              'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900',
              'dark:from-white dark:via-gray-100 dark:to-white',
              'mb-6 leading-tight'
            )}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {title}
          </motion.h1>
          
          {/* Subtitle with Animated Entrance */}
          <motion.p
            className={cn(
              'text-lg sm:text-xl md:text-2xl',
              'text-gray-600 dark:text-gray-300',
              'mb-8 sm:mb-10 md:mb-12',
              'max-w-2xl mx-auto'
            )}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {subtitle}
          </motion.p>
          
          {/* Glass CTA Button with 3D Hover Effect */}
          <motion.div
            variants={fadeInDown}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.a
              href={ctaLink}
              onClick={handleCtaClick}
              className={cn(
                'inline-flex items-center justify-center',
                'px-8 py-4 sm:px-10 sm:py-5',
                'text-base sm:text-lg font-semibold',
                'text-white',
                'rounded-xl sm:rounded-2xl',
                'relative overflow-hidden',
                'transition-all duration-300',
                'focus:outline-none focus:ring-4 focus:ring-blue-500/50',
                'min-w-[200px] sm:min-w-[240px]',
                // Glass effect
                'backdrop-blur-md',
                'bg-gradient-to-r from-blue-600/90 to-purple-600/90',
                'dark:from-blue-500/90 dark:to-purple-500/90',
                'border border-white/20',
                'shadow-lg shadow-blue-500/25'
              )}
              whileHover={{
                scale: 1.05,
                y: -5,
                rotateX: 5,
                transition: { duration: 0.2 },
              }}
              whileTap={{
                scale: 0.98,
                transition: { duration: 0.1 },
              }}
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
              role="button"
              aria-label={ctaText}
            >
              {/* Glass shine effect */}
              <span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{
                  transform: 'translateX(-100%)',
                }}
              />
              
              {/* Button text */}
              <span className="relative z-10">{ctaText}</span>
              
              {/* Arrow icon */}
              <svg
                className={cn(
                  'w-5 h-5 sm:w-6 sm:h-6',
                  isRTL ? 'mr-2 rotate-180' : 'ml-2'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Depth Shadow at Bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/50 to-transparent dark:from-gray-900/50 pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
};

export default HeroSection3D;
