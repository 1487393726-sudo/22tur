/**
 * TestimonialsSection Component
 * 
 * Displays customer testimonials with 3D card carousel effects
 * Features:
 * - 3D card carousel with smooth transitions
 * - Auto-play with configurable interval
 * - Manual navigation (prev/next buttons)
 * - Touch/swipe support for mobile
 * - Glass morphism card effects
 * - 3D depth shadows
 * - Responsive layout
 * - Multi-language support
 * 
 * Requirements: 7.4
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Card3D } from '@/components/website/3d/Card3D';
import { FadeInView } from '@/components/website/animations/FadeInView';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

export interface Testimonial {
  /**
   * Customer name
   */
  name: string;
  
  /**
   * Customer role/position
   */
  role: string;
  
  /**
   * Testimonial content
   */
  content: string;
  
  /**
   * Rating (1-5)
   */
  rating: number;
  
  /**
   * Optional avatar image URL
   */
  avatar?: string;
  
  /**
   * Optional company logo URL
   */
  companyLogo?: string;
}

export interface TestimonialsSectionProps {
  /**
   * Section title
   */
  title?: string;
  
  /**
   * Section subtitle/description
   */
  subtitle?: string;
  
  /**
   * Array of testimonials to display
   */
  testimonials: Testimonial[];
  
  /**
   * Auto-play interval in milliseconds
   * Set to 0 to disable auto-play
   * @default 5000
   */
  autoPlayInterval?: number;
  
  /**
   * Background color/style
   * @default 'bg-gradient-to-br from-gray-50 to-gray-100'
   */
  background?: string;
  
  /**
   * Glass effect intensity
   * @default 'medium'
   */
  glassIntensity?: 'light' | 'medium' | 'heavy';
  
  /**
   * 3D depth level
   * @default 'medium'
   */
  depth?: 'shallow' | 'medium' | 'deep';
  
  /**
   * Show navigation arrows
   * @default true
   */
  showNavigation?: boolean;
  
  /**
   * Show pagination dots
   * @default true
   */
  showPagination?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Carousel slide animation variants
 */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    rotateY: direction > 0 ? 45 : -45,
    scale: 0.8,
  }),
  center: {
    x: 0,
    opacity: 1,
    rotateY: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    rotateY: direction < 0 ? 45 : -45,
    scale: 0.8,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

/**
 * Swipe confidence threshold
 */
const swipeConfidenceThreshold = 10000;

/**
 * Calculate swipe power
 */
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

/**
 * TestimonialsSection Component
 */
export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  title,
  subtitle,
  testimonials,
  autoPlayInterval = 5000,
  background = 'bg-gradient-to-br from-gray-50 to-gray-100',
  glassIntensity = 'medium',
  depth = 'medium',
  showNavigation = true,
  showPagination = true,
  className = '',
}) => {
  const [[currentIndex, direction], setPage] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Wrap index to stay within bounds
  const testimonialIndex = testimonials.length > 0 
    ? ((currentIndex % testimonials.length) + testimonials.length) % testimonials.length 
    : 0;
  const currentTestimonial = testimonials[testimonialIndex];

  /**
   * Navigate to next testimonial
   */
  const paginate = useCallback((newDirection: number) => {
    setPage([currentIndex + newDirection, newDirection]);
  }, [currentIndex]);

  /**
   * Go to specific testimonial
   */
  const goToTestimonial = useCallback((index: number) => {
    const newDirection = index > testimonialIndex ? 1 : -1;
    setPage([index, newDirection]);
  }, [testimonialIndex]);

  /**
   * Auto-play effect
   */
  useEffect(() => {
    if (autoPlayInterval > 0 && !isPaused && testimonials.length > 1) {
      autoPlayRef.current = setInterval(() => {
        paginate(1);
      }, autoPlayInterval);

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
        }
      };
    }
  }, [autoPlayInterval, isPaused, paginate, testimonials.length]);

  /**
   * Handle drag end for swipe navigation
   */
  const handleDragEnd = useCallback(
    (e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
      const swipe = swipePower(offset.x, velocity.x);

      if (swipe < -swipeConfidenceThreshold) {
        paginate(1);
      } else if (swipe > swipeConfidenceThreshold) {
        paginate(-1);
      }
    },
    [paginate]
  );

  /**
   * Render star rating
   */
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-300 text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className={`py-16 md:py-24 ${background} ${className} overflow-hidden`}>
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

        {/* Carousel Container */}
        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Empty State */}
          {testimonials.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No testimonials available
            </div>
          )}

          {/* Testimonial Cards */}
          {testimonials.length > 0 && (
            <div className="relative h-[400px] md:h-[350px] flex items-center justify-center perspective-1000">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={handleDragEnd}
                className="absolute w-full"
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                <Card3D
                  intensity="light"
                  depth={depth}
                  glassEffect={glassIntensity}
                  className="bg-white p-8 md:p-10 cursor-grab active:cursor-grabbing"
                  enableHover={false}
                >
                  {/* Quote Icon */}
                  <div className="absolute top-6 left-6 opacity-10">
                    <Quote className="w-16 h-16 text-primary-600" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Rating */}
                    <div className="mb-4">
                      {renderStars(currentTestimonial.rating)}
                    </div>

                    {/* Testimonial Text */}
                    <blockquote className="text-gray-700 text-lg md:text-xl leading-relaxed mb-6 italic">
                      "{currentTestimonial.content}"
                    </blockquote>

                    {/* Author Info */}
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      {currentTestimonial.avatar ? (
                        <img
                          src={currentTestimonial.avatar}
                          alt={currentTestimonial.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-primary-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl">
                          {currentTestimonial.name.charAt(0)}
                        </div>
                      )}

                      {/* Name and Role */}
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg">
                          {currentTestimonial.name}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {currentTestimonial.role}
                        </div>
                      </div>

                      {/* Company Logo */}
                      {currentTestimonial.companyLogo && (
                        <img
                          src={currentTestimonial.companyLogo}
                          alt="Company"
                          className="h-8 object-contain opacity-60"
                        />
                      )}
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            </AnimatePresence>
            </div>
          )}

          {/* Navigation Arrows */}
          {showNavigation && testimonials.length > 1 && (
            <>
              <button
                onClick={() => paginate(-1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-primary-600 hover:text-primary-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={() => paginate(1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-primary-600 hover:text-primary-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Pagination Dots */}
          {showPagination && testimonials.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    index === testimonialIndex
                      ? 'bg-primary-600 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={index === testimonialIndex ? 'true' : 'false'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
