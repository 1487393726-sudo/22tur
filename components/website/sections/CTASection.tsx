/**
 * CTASection Component
 * 
 * Call-to-action section with glass morphism and 3D effects
 * Features:
 * - Glass morphism background with blur effect
 * - 3D hover effects on buttons
 * - Gradient background with depth
 * - Responsive layout
 * - Multi-language support
 * - Smooth animations
 * 
 * Requirements: 7.5
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FadeInView } from '@/components/website/animations/FadeInView';
import { ArrowRight, Sparkles } from 'lucide-react';

export interface CTAButton {
  /**
   * Button text
   */
  text: string;
  
  /**
   * Button link/href
   */
  href: string;
  
  /**
   * Button style variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline';
  
  /**
   * Show arrow icon
   * @default false
   */
  showArrow?: boolean;
  
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

export interface CTASectionProps {
  /**
   * Section title
   */
  title: string;
  
  /**
   * Section description/subtitle
   */
  description: string;
  
  /**
   * Array of CTA buttons (1-2 buttons recommended)
   */
  buttons: CTAButton[];
  
  /**
   * Background gradient scheme
   * @default 'primary'
   */
  gradientScheme?: 'primary' | 'secondary' | 'accent' | 'sunset' | 'ocean';
  
  /**
   * Glass effect intensity
   * @default 'medium'
   */
  glassIntensity?: 'light' | 'medium' | 'heavy';
  
  /**
   * Show decorative sparkles
   * @default true
   */
  showSparkles?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Get gradient background CSS based on scheme
 */
const getGradientBackground = (scheme: string): string => {
  const gradients = {
    primary: 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700',
    secondary: 'bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700',
    accent: 'bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700',
    sunset: 'bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600',
    ocean: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-600',
  };
  return gradients[scheme as keyof typeof gradients] || gradients.primary;
};

/**
 * Get glass effect CSS class based on intensity
 */
const getGlassClass = (intensity: 'light' | 'medium' | 'heavy'): string => {
  const glassClasses = {
    light: 'bg-white/5 backdrop-blur-sm border border-white/10',
    medium: 'bg-white/10 backdrop-blur-md border border-white/20',
    heavy: 'bg-white/20 backdrop-blur-lg border border-white/30',
  };
  return glassClasses[intensity];
};

/**
 * Button 3D hover animation variants
 */
const buttonVariants = {
  initial: {
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    z: 0,
  },
  hover: {
    scale: 1.05,
    rotateX: -5,
    rotateY: 5,
    z: 20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  tap: {
    scale: 0.98,
    z: 10,
    transition: {
      duration: 0.1,
    },
  },
};

/**
 * Sparkle animation variants
 */
const sparkleVariants = {
  initial: { scale: 0, opacity: 0, rotate: 0 },
  animate: (i: number) => ({
    scale: [0, 1, 0],
    opacity: [0, 1, 0],
    rotate: [0, 180, 360],
    transition: {
      duration: 2,
      repeat: Infinity,
      delay: i * 0.3,
      ease: 'easeInOut',
    },
  }),
};

/**
 * CTASection Component
 * 
 * Displays a call-to-action section with glass morphism background,
 * gradient styling, and 3D hover effects on buttons.
 * 
 * @example
 * ```tsx
 * <CTASection
 *   title="Ready to Get Started?"
 *   description="Contact us and let us help you bring your ideas to life"
 *   buttons={[
 *     { text: "Contact Us", href: "/contact", variant: "primary", showArrow: true },
 *     { text: "View Services", href: "/services", variant: "outline" }
 *   ]}
 *   gradientScheme="primary"
 * />
 * ```
 */
export const CTASection: React.FC<CTASectionProps> = ({
  title,
  description,
  buttons,
  gradientScheme = 'primary',
  glassIntensity = 'medium',
  showSparkles = true,
  className = '',
}) => {
  const gradientBg = getGradientBackground(gradientScheme);
  const glassClass = getGlassClass(glassIntensity);

  /**
   * Render button based on variant
   */
  const renderButton = (button: CTAButton, index: number) => {
    const baseClasses = 'px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 justify-center shadow-lg hover:shadow-xl';
    
    const variantClasses = {
      primary: 'bg-white text-primary-900 hover:bg-gray-100',
      secondary: 'bg-primary-900 text-white hover:bg-primary-800',
      outline: 'border-2 border-white text-white hover:bg-white/10',
    };

    const buttonClass = `${baseClasses} ${variantClasses[button.variant || 'primary']}`;

    return (
      <motion.a
        key={index}
        href={button.href}
        onClick={button.onClick}
        className={buttonClass}
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        <span>{button.text}</span>
        {button.showArrow && <ArrowRight className="w-5 h-5" />}
      </motion.a>
    );
  };

  return (
    <section className={`py-16 md:py-24 relative overflow-hidden ${className}`}>
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${gradientBg}`} />
      
      {/* Decorative Sparkles */}
      {showSparkles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
              }}
              custom={i}
              variants={sparkleVariants}
              initial="initial"
              animate="animate"
            >
              <Sparkles className="w-6 h-6 text-white/30" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Content Container */}
      <div className="container mx-auto px-4 relative z-10">
        <FadeInView delay={0} threshold={0.2}>
          <div
            className={`
              ${glassClass}
              rounded-2xl p-8 md:p-12 lg:p-16
              text-center
              shadow-depth-deep
              max-w-4xl mx-auto
            `}
          >
            {/* Title */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
              {title}
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center perspective-1000"
              style={{
                perspective: '1000px',
              }}
            >
              {buttons.map((button, index) => renderButton(button, index))}
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
};

export default CTASection;
