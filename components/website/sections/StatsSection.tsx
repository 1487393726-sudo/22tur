/**
 * StatsSection Component
 * 
 * Displays company statistics with animated counting numbers
 * Features:
 * - CountUpAnimation for number counting effect
 * - Glass morphism card effects
 * - 3D depth shadows
 * - Responsive grid layout
 * - Multi-language support
 * 
 * Requirements: 7.3
 */

'use client';

import React from 'react';
import { CountUpAnimation } from '@/components/website/animations/CountUpAnimation';
import { FadeInView } from '@/components/website/animations/FadeInView';

export interface StatItem {
  /**
   * The numeric value to count up to
   */
  value: number;
  
  /**
   * Label describing the statistic
   */
  label: string;
  
  /**
   * Optional suffix (e.g., "+", "%", "K")
   */
  suffix?: string;
  
  /**
   * Optional prefix (e.g., "$", "€")
   */
  prefix?: string;
  
  /**
   * Number of decimal places
   * @default 0
   */
  decimals?: number;
  
  /**
   * Icon or emoji to display
   */
  icon?: string;
  
  /**
   * Accent color for the stat card
   */
  color?: string;
}

export interface StatsSectionProps {
  /**
   * Section title
   */
  title?: string;
  
  /**
   * Section subtitle/description
   */
  subtitle?: string;
  
  /**
   * Array of statistics to display
   */
  stats: StatItem[];
  
  /**
   * Background color/style
   * @default 'bg-gray-50'
   */
  background?: string;
  
  /**
   * Glass effect intensity
   * @default 'light'
   */
  glassIntensity?: 'light' | 'medium' | 'heavy';
  
  /**
   * 3D depth level
   * @default 'medium'
   */
  depth?: 'shallow' | 'medium' | 'deep';
  
  /**
   * Grid columns configuration
   */
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Get glass effect CSS class based on intensity
 */
const getGlassClass = (intensity: 'light' | 'medium' | 'heavy'): string => {
  const glassClasses = {
    light: 'bg-white/10 backdrop-blur-[var(--glass-blur-light)] border border-white/10',
    medium: 'bg-white/15 backdrop-blur-[var(--glass-blur-medium)] border border-white/18',
    heavy: 'bg-white/25 backdrop-blur-[var(--glass-blur-heavy)] border border-white/20',
  };
  return glassClasses[intensity];
};

/**
 * Get depth shadow CSS class based on depth level
 */
const getDepthClass = (depth: 'shallow' | 'medium' | 'deep'): string => {
  const depthClasses = {
    shallow: 'shadow-depth-shallow hover:shadow-depth-shallow-hover',
    medium: 'shadow-depth-medium hover:shadow-depth-medium-hover',
    deep: 'shadow-depth-deep hover:shadow-depth-deep-hover',
  };
  return depthClasses[depth];
};

/**
 * Get grid columns CSS class based on configuration
 */
const getGridClass = (columns?: { mobile?: number; tablet?: number; desktop?: number }): string => {
  const mobile = columns?.mobile || 1;
  const tablet = columns?.tablet || 2;
  const desktop = columns?.desktop || 4;
  
  return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`;
};

/**
 * StatsSection Component
 * 
 * Displays a grid of statistics with animated counting numbers,
 * glass morphism effects, and 3D depth shadows.
 * 
 * @example
 * ```tsx
 * <StatsSection
 *   title="Our Achievements"
 *   subtitle="Numbers that speak for themselves"
 *   stats={[
 *     { value: 100, label: "Projects Completed", suffix: "+", icon: "🚀" },
 *     { value: 50, label: "Happy Clients", suffix: "+", icon: "😊" },
 *     { value: 10, label: "Years Experience", suffix: "+", icon: "⭐" },
 *     { value: 99.9, label: "Client Satisfaction", suffix: "%", decimals: 1, icon: "💯" }
 *   ]}
 * />
 * ```
 */
export const StatsSection: React.FC<StatsSectionProps> = ({
  title,
  subtitle,
  stats,
  background = 'bg-gray-50',
  glassIntensity = 'light',
  depth = 'medium',
  columns,
  className = '',
}) => {
  const glassClass = getGlassClass(glassIntensity);
  const depthClass = getDepthClass(depth);
  const gridClass = getGridClass(columns);

  return (
    <section className={`py-16 md:py-24 ${background} ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        {(title || subtitle) && (
          <FadeInView delay={0} threshold={0.2}>
            <div className="text-center mb-12">
              {title && (
                <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {subtitle}
                </p>
              )}
            </div>
          </FadeInView>
        )}

        {/* Stats Grid */}
        <div className={`grid ${gridClass} gap-6 md:gap-8`}>
          {stats.map((stat, index) => (
            <FadeInView key={index} delay={index * 0.1} threshold={0.2}>
              <div
                className={`
                  ${glassClass}
                  ${depthClass}
                  rounded-lg p-6 md:p-8
                  transition-all duration-300
                  hover:scale-105
                  gpu-accelerated
                  bg-white
                `}
                style={{
                  borderColor: stat.color ? `${stat.color}20` : undefined,
                }}
              >
                {/* Icon */}
                {stat.icon && (
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-lg mb-4 flex items-center justify-center text-2xl md:text-3xl"
                    style={{
                      backgroundColor: stat.color ? `${stat.color}15` : 'var(--color-primary-50)',
                    }}
                  >
                    {stat.icon}
                  </div>
                )}

                {/* Animated Number */}
                <div
                  className="text-4xl md:text-5xl font-bold mb-2"
                  style={{
                    color: stat.color || 'var(--color-primary-600)',
                  }}
                >
                  <CountUpAnimation
                    end={stat.value}
                    duration={2.5}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals || 0}
                    separator={true}
                    easing="easeOut"
                    threshold={0.3}
                  />
                </div>

                {/* Label */}
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
