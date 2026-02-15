'use client';

/**
 * Timeline Component
 * 
 * A vertical timeline component with 3D visual effects for displaying
 * company milestones and history. Features scroll-triggered animations
 * and 3D milestone cards.
 * 
 * Features:
 * - Vertical timeline with connecting line
 * - 3D milestone cards with hover effects
 * - Scroll-triggered stagger animations
 * - Responsive design (mobile/tablet/desktop)
 * - Multi-language support
 * - RTL layout support
 * 
 * Requirements: 8.2
 */

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Card3D } from '@/components/website/3d/Card3D';
import { cn } from '@/lib/utils';

/**
 * Timeline Milestone Interface
 */
export interface TimelineMilestone {
  /** Year or date of the milestone */
  year: string;
  
  /** Title of the milestone */
  title: string;
  
  /** Description of the milestone */
  description: string;
  
  /** Optional icon or emoji */
  icon?: string;
  
  /** Optional color for the milestone marker */
  color?: string;
}

/**
 * Timeline Props Interface
 */
export interface TimelineProps {
  /** Array of milestones to display */
  milestones: TimelineMilestone[];
  
  /** Additional CSS classes */
  className?: string;
  
  /** RTL layout mode */
  isRTL?: boolean;
  
  /** Animation delay between items (in seconds) */
  staggerDelay?: number;
  
  /** Line color */
  lineColor?: string;
  
  /** Default marker color */
  markerColor?: string;
}

/**
 * Timeline Component
 * 
 * Displays a vertical timeline with 3D milestone cards that animate
 * into view as the user scrolls.
 * 
 * @example
 * ```tsx
 * <Timeline
 *   milestones={[
 *     { year: '2019', title: 'Founded', description: 'Company established', icon: '🚀' },
 *     { year: '2020', title: 'First Product', description: 'Launched our first product' },
 *   ]}
 * />
 * ```
 */
export const Timeline: React.FC<TimelineProps> = ({
  milestones,
  className,
  isRTL = false,
  staggerDelay = 0.2,
  lineColor = 'var(--color-primary-300)',
  markerColor = 'var(--color-primary-500)',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, {
    once: true,
    amount: 0.1,
  });

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Timeline vertical line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 hidden md:block"
        style={{
          backgroundColor: lineColor,
          [isRTL ? 'right' : 'left']: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Mobile timeline line (left side) */}
      <div
        className="absolute top-0 bottom-0 w-0.5 md:hidden"
        style={{
          backgroundColor: lineColor,
          [isRTL ? 'right' : 'left']: '1rem',
        }}
      />

      {/* Milestones */}
      <div className="space-y-12 md:space-y-16">
        {milestones.map((milestone, index) => (
          <TimelineMilestone
            key={index}
            milestone={milestone}
            index={index}
            isRTL={isRTL}
            isInView={isInView}
            staggerDelay={staggerDelay}
            markerColor={markerColor}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Timeline Milestone Item Component
 */
interface TimelineMilestoneProps {
  milestone: TimelineMilestone;
  index: number;
  isRTL: boolean;
  isInView: boolean;
  staggerDelay: number;
  markerColor: string;
}

const TimelineMilestone: React.FC<TimelineMilestoneProps> = ({
  milestone,
  index,
  isRTL,
  isInView,
  staggerDelay,
  markerColor,
}) => {
  // Alternate sides on desktop (left/right)
  const isLeft = index % 2 === 0;
  const side = isRTL ? !isLeft : isLeft;

  // Animation variants
  const cardVariants = {
    hidden: {
      opacity: 0,
      x: side ? -50 : 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * staggerDelay,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const markerVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        delay: index * staggerDelay + 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className="relative">
      {/* Desktop layout: alternating sides */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-8 items-center">
        {/* Left side */}
        <div className={cn('flex', side ? 'justify-end' : 'justify-start')}>
          {side && (
            <motion.div
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={cardVariants}
              className="w-full max-w-md"
            >
              <MilestoneCard milestone={milestone} isRTL={isRTL} />
            </motion.div>
          )}
        </div>

        {/* Right side */}
        <div className={cn('flex', !side ? 'justify-start' : 'justify-end')}>
          {!side && (
            <motion.div
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={cardVariants}
              className="w-full max-w-md"
            >
              <MilestoneCard milestone={milestone} isRTL={isRTL} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile layout: single column */}
      <div className="md:hidden pl-12">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={cardVariants}
        >
          <MilestoneCard milestone={milestone} isRTL={isRTL} />
        </motion.div>
      </div>

      {/* Timeline marker (center on desktop, left on mobile) */}
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={markerVariants}
        className="absolute top-0 w-12 h-12 rounded-full flex items-center justify-center z-10"
        style={{
          backgroundColor: milestone.color || markerColor,
          [isRTL ? 'right' : 'left']: 'calc(50% - 1.5rem)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        {milestone.icon ? (
          <span className="text-2xl">{milestone.icon}</span>
        ) : (
          <span className="text-white font-bold text-lg">{milestone.year}</span>
        )}
      </motion.div>

      {/* Mobile marker */}
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={markerVariants}
        className="md:hidden absolute top-0 w-8 h-8 rounded-full flex items-center justify-center z-10"
        style={{
          backgroundColor: milestone.color || markerColor,
          [isRTL ? 'right' : 'left']: '0.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        {milestone.icon && (
          <span className="text-sm">{milestone.icon}</span>
        )}
      </motion.div>
    </div>
  );
};

/**
 * Milestone Card Component
 */
interface MilestoneCardProps {
  milestone: TimelineMilestone;
  isRTL: boolean;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, isRTL }) => {
  return (
    <Card3D
      intensity="medium"
      depth="medium"
      glassEffect="light"
      className="p-6 bg-white border border-gray-200"
      isRTL={isRTL}
    >
      {/* Year badge */}
      <div
        className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4"
        style={{
          backgroundColor: milestone.color || 'var(--color-primary-100)',
          color: milestone.color || 'var(--color-primary-700)',
        }}
      >
        {milestone.year}
      </div>

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-bold text-primary-900 mb-3">
        {milestone.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed">
        {milestone.description}
      </p>
    </Card3D>
  );
};

export default Timeline;
