'use client';

import React, { useState, useMemo } from 'react';
import type { Testimonial } from '@/types/website';

interface TestimonialSectionProps {
  testimonials: Testimonial[];
  className?: string;
  autoplay?: boolean;
  autoplayInterval?: number;
}

export const TestimonialSection: React.FC<TestimonialSectionProps> = ({
  testimonials,
  className = '',
  autoplay = true,
  autoplayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance carousel
  React.useEffect(() => {
    if (!autoplay || testimonials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [autoplay, autoplayInterval, testimonials.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (testimonials.length === 0) {
    return (
      <section
        className={`w-full py-12 md:py-16 lg:py-20 bg-neutral-100 ${className}`}
        data-testid="testimonial-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12" data-testid="empty-state">
            <p className="text-secondary text-lg">
              No testimonials available at this time.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section
      className={`w-full py-12 md:py-16 lg:py-20 bg-neutral-100 ${className}`}
      data-testid="testimonial-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Hear from our satisfied clients about their experience working with us.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative" data-testid="carousel-container">
          {/* Testimonial Card */}
          <div
            className="testimonial rounded-lg p-8 md:p-12 min-h-96"
            data-testid={`testimonial-card-${currentTestimonial.id}`}
          >
            {/* Rating Stars */}
            <div className="flex items-center gap-1 mb-6" data-testid={`rating-${currentTestimonial.id}`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-2xl ${
                    i < currentTestimonial.rating ? 'text-accent-500' : 'text-neutral-300'
                  }`}
                  data-testid={`star-${currentTestimonial.id}-${i}`}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Testimonial Content */}
            <p className="testimonial-text text-lg mb-8 italic line-clamp-4">
              "{currentTestimonial.content}"
            </p>

            {/* Author Info */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={currentTestimonial.avatar}
                  alt={currentTestimonial.author}
                  className="w-16 h-16 rounded-full object-cover"
                  data-testid={`avatar-${currentTestimonial.id}`}
                />
              </div>

              {/* Author Details */}
              <div>
                <h3 className="text-lg font-bold text-primary">
                  {currentTestimonial.author}
                </h3>
                <p className="testimonial-author text-sm">
                  {currentTestimonial.company}
                </p>
              </div>
            </div>

            {/* Video Link (if available) */}
            {currentTestimonial.videoUrl && (
              <div className="mt-6 pt-6 border-t border-border-light">
                <a
                  href={currentTestimonial.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-600 font-medium text-sm inline-flex items-center gap-2"
                  data-testid={`video-link-${currentTestimonial.id}`}
                >
                  <span>▶</span>
                  <span>Watch Video Testimonial</span>
                </a>
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 bg-light rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
                aria-label="Previous testimonial"
                data-testid="prev-button"
              >
                <span className="text-2xl text-primary">‹</span>
              </button>

              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 bg-light rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
                aria-label="Next testimonial"
                data-testid="next-button"
              >
                <span className="text-2xl text-primary">›</span>
              </button>
            </>
          )}
        </div>

        {/* Pagination Dots */}
        {testimonials.length > 1 && (
          <div
            className="flex justify-center gap-2 mt-8"
            data-testid="pagination-dots"
          >
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-primary-500'
                    : 'bg-neutral-300 hover:bg-neutral-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
                data-testid={`dot-${index}`}
              />
            ))}
          </div>
        )}

        {/* Testimonial Counter */}
        {testimonials.length > 1 && (
          <div className="text-center mt-6" data-testid="counter">
            <p className="text-secondary text-sm">
              {currentIndex + 1} of {testimonials.length}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialSection;
