'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ServiceCard as ServiceCardType } from '@/types/website';

interface ServiceCardProps {
  service: ServiceCardType;
  onClick?: () => void;
  className?: string;
}

/**
 * Service Card Component
 * 
 * Displays a single service card with icon, name, description, and link.
 * Used in service listings and showcases.
 * 
 * Requirements: 2.1, 2.2, 2.4, 2.5, 6.1, 6.4
 * 
 * @param service - Service data to display
 * @param onClick - Optional click handler
 * @param className - Optional CSS class for styling
 * @returns Rendered service card component
 */
export function ServiceCard({
  service,
  onClick,
  className = '',
}: ServiceCardProps): React.ReactElement {
  return (
    <div
      className={`service-card group relative rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 active:scale-95 ${className}`}
      onClick={onClick}
      data-testid={`service-card-${service.id}`}
    >
      {/* Card Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-500)]/0 to-[var(--color-primary-500)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col">
        {/* Icon Section */}
        <div className="mb-4 sm:mb-6">
          {service.icon ? (
            <div className="service-card-icon w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center text-white text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)',
              }}
            >
              {service.icon.startsWith('/') ? (
                <Image
                  src={service.icon}
                  alt={service.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <span>{service.icon}</span>
              )}
            </div>
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)',
              }}
            />
          )}
        </div>

        {/* Service Name */}
        <h3
          className="service-card-title text-lg sm:text-xl font-bold mb-2 sm:mb-3 line-clamp-2 transition-colors duration-300"
          data-testid={`service-name-${service.id}`}
        >
          {service.name}
        </h3>

        {/* Category Badge */}
        {service.category && (
          <div className="mb-3 sm:mb-4">
            <span className="badge-primary inline-block px-3 py-1 text-xs sm:text-sm font-medium rounded-full">
              {service.category}
            </span>
          </div>
        )}

        {/* Service Description */}
        <p
          className="service-card-description text-sm sm:text-base mb-4 sm:mb-6 flex-grow line-clamp-3"
          data-testid={`service-description-${service.id}`}
        >
          {service.description}
        </p>

        {/* Learn More Link */}
        <Link
          href={service.link || '#'}
          className="inline-flex items-center font-semibold transition-colors duration-300 group/link"
          style={{
            color: 'var(--color-primary-500)',
          }}
          data-testid={`service-link-${service.id}`}
        >
          Learn More
          <svg
            className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300"
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
      </div>

      {/* Bottom Border Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
        style={{
          background: 'linear-gradient(90deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)',
        }}
      />
    </div>
  );
}

export default ServiceCard;
