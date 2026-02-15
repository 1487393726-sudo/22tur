'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { HeroBanner as HeroBannerType } from '@/types/website';

interface HeroBannerProps {
  data: HeroBannerType;
  className?: string;
}

/**
 * Hero Banner Component
 * 
 * Displays a prominent hero section with title, subtitle, and CTA buttons.
 * Supports responsive design and optional background image/video.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4
 * 
 * @param data - Hero banner data including title, subtitle, and buttons
 * @param className - Optional CSS class for styling
 * @returns Rendered hero banner component
 */
export function HeroBanner({ data, className = '' }: HeroBannerProps): React.ReactElement {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const {
    title,
    subtitle,
    backgroundImage,
    backgroundVideo,
    ctaButton,
    ctaButtonSecondary,
  } = data;

  return (
    <section
      className={`relative w-full min-h-screen flex items-center justify-center overflow-hidden hero ${className}`}
      style={{
        background: 'var(--gradient-dark)',
      }}
      data-testid="hero-banner"
    >
      {/* Background Image/Video Layer */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt="Hero background"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
      )}

      {backgroundVideo && (
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        </div>
      )}

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a2347]/30 to-[#1a2347]/50 z-1" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-32" data-testid="hero-content">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div
            className={`text-center transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Title */}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight mb-4 sm:mb-6 text-white"
              data-testid="hero-title"
            >
              {title}
            </h1>

            {/* Subtitle */}
            <p
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-100 max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed"
              data-testid="hero-subtitle"
            >
              {subtitle}
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center sm:items-start flex-wrap"
              data-testid="hero-buttons"
            >
              {/* Primary CTA Button */}
              <Link
                href={ctaButton.href || '#'}
                className="btn-primary inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 font-semibold rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg w-full sm:w-auto"
                data-testid="hero-cta-primary"
              >
                {ctaButton.text}
                <svg
                  className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>

              {/* Secondary CTA Button */}
              {ctaButtonSecondary && (
                <Link
                  href={ctaButtonSecondary.href || '#'}
                  className="btn-outline inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 w-full sm:w-auto"
                  data-testid="hero-cta-secondary"
                >
                  {ctaButtonSecondary.text}
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <svg
          className="w-6 h-6 text-white/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}

export default HeroBanner;
