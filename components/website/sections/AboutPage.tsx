'use client';

import React, { useMemo } from 'react';
import { AboutPage as AboutPageType } from '@/types/website';
import type { Certificate } from '@/types/website';

interface AboutPageProps {
  data: AboutPageType;
  onCertificateClick?: (certificate: Certificate) => void;
}

/**
 * AboutPage Component
 * Displays company information, development timeline, certificates, and achievements
 * Supports responsive design across all breakpoints
 */
export const AboutPage: React.FC<AboutPageProps> = ({ data, onCertificateClick }) => {
  // Memoize sorted timeline for performance
  const sortedTimeline = useMemo(() => {
    return [...data.timeline].sort((a, b) => a.year - b.year);
  }, [data.timeline]);

  return (
    <div className="w-full bg-light dark:bg-primary-900">
      {/* Company Info Section */}
      <section className="py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Company Description */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary dark:text-light mb-4">
              {data.companyInfo.name}
            </h1>
            <p className="text-lg text-secondary dark:text-neutral-300 mb-6">
              {data.companyInfo.description}
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-primary dark:text-light mb-2">
                  Mission
                </h3>
                <p className="text-secondary dark:text-neutral-300">
                  {data.companyInfo.mission}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary dark:text-light mb-2">
                  Vision
                </h3>
                <p className="text-secondary dark:text-neutral-300">
                  {data.companyInfo.vision}
                </p>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary dark:text-light mb-6">
              Core Values
            </h2>
            <div className="space-y-3">
              {data.companyInfo.values.map((value, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-primary-100 dark:bg-primary-900/20"
                  data-testid={`core-value-${index}`}
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 dark:bg-primary-400 flex items-center justify-center mt-0.5">
                    <svg
                      className="w-4 h-4 text-light"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-primary dark:text-neutral-200">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8 bg-neutral-100 dark:bg-primary-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-light mb-12 text-center">
            Development Timeline
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary-500 to-primary-400 dark:from-primary-400 dark:to-primary-300" />

            {/* Timeline events */}
            <div className="space-y-8 md:space-y-12">
              {sortedTimeline.map((event, index) => (
                <div
                  key={event.year}
                  className={`flex flex-col md:flex-row gap-6 md:gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                  data-testid={`timeline-event-${event.year}`}
                >
                  {/* Content */}
                  <div className="flex-1 md:w-1/2">
                    <div className="bg-light dark:bg-primary-700 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        {event.icon && (
                          <span className="text-2xl" aria-hidden="true">
                            {event.icon}
                          </span>
                        )}
                        <h3 className="text-xl font-bold text-primary dark:text-primary-300">
                          {event.year}
                        </h3>
                      </div>
                      <h4 className="text-lg font-semibold text-primary dark:text-light mb-2">
                        {event.title}
                      </h4>
                      <p className="text-secondary dark:text-neutral-300">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="hidden md:flex md:w-1/2 items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-primary-500 dark:bg-primary-400 border-4 border-light dark:border-primary-800 shadow-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      {data.achievements.length > 0 && (
        <section className="py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-light mb-12 text-center">
            Key Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
                data-testid={`achievement-${achievement.id}`}
              >
                <div className="text-4xl mb-3" aria-hidden="true">
                  {achievement.icon}
                </div>
                <h3 className="text-2xl font-bold text-primary dark:text-primary-300 mb-2">
                  {achievement.metric}
                </h3>
                <p className="text-primary dark:text-neutral-300 font-semibold mb-2">
                  {achievement.title}
                </p>
                <p className="text-sm text-secondary dark:text-neutral-400">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certificates Section */}
      {data.certificates.length > 0 && (
        <section className="py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8 bg-neutral-100 dark:bg-primary-800">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-light mb-12 text-center">
              Certificates & Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="bg-light dark:bg-primary-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onCertificateClick?.(certificate)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onCertificateClick?.(certificate);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  data-testid={`certificate-${certificate.id}`}
                >
                  {/* Certificate Image */}
                  <div className="relative w-full h-48 bg-neutral-200 dark:bg-primary-600 overflow-hidden">
                    <img
                      src={certificate.image}
                      alt={`${certificate.name} certificate`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Certificate Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-primary dark:text-light mb-2">
                      {certificate.name}
                    </h3>
                    <p className="text-sm text-secondary dark:text-neutral-300 mb-3">
                      Issued by: {certificate.issuer}
                    </p>
                    <div className="flex justify-between text-xs text-secondary dark:text-neutral-400">
                      <span>
                        Issued: {new Date(certificate.issueDate).toLocaleDateString()}
                      </span>
                      {certificate.expiryDate && (
                        <span>
                          Expires: {new Date(certificate.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AboutPage;
