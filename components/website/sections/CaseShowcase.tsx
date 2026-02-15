'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Case } from '@/types/website';

interface CaseShowcaseProps {
  cases: Case[];
  onCaseClick?: (caseId: string) => void;
  className?: string;
}

export const CaseShowcase: React.FC<CaseShowcaseProps> = ({
  cases,
  onCaseClick,
  className = '',
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  // Extract unique industries from cases
  const industries = useMemo(() => {
    const uniqueIndustries = Array.from(new Set(cases.map((c) => c.industry)));
    return uniqueIndustries.sort();
  }, [cases]);

  // Filter cases by selected industry
  const filteredCases = useMemo(() => {
    if (!selectedIndustry) {
      return cases;
    }
    return cases.filter((c) => c.industry === selectedIndustry);
  }, [cases, selectedIndustry]);

  const handleCaseClick = (caseId: string) => {
    onCaseClick?.(caseId);
  };

  const handleIndustryFilter = (industry: string | null) => {
    setSelectedIndustry(industry);
  };

  return (
    <section
      className={`w-full py-12 md:py-16 lg:py-20 bg-neutral-100 ${className}`}
      data-testid="case-showcase"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Success Cases
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Explore our portfolio of successful projects and see how we've helped businesses
            achieve their goals.
          </p>
        </div>

        {/* Industry Filter */}
        {industries.length > 0 && (
          <div className="mb-12" data-testid="industry-filter">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => handleIndustryFilter(null)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedIndustry === null
                    ? 'btn-primary'
                    : 'bg-light text-primary border border-border-light hover:border-primary'
                }`}
                data-testid="filter-all"
              >
                All Industries
              </button>
              {industries.map((industry) => (
                <button
                  key={industry}
                  onClick={() => handleIndustryFilter(industry)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    selectedIndustry === industry
                      ? 'btn-primary'
                      : 'bg-light text-primary border border-border-light hover:border-primary'
                  }`}
                  data-testid={`filter-${industry}`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cases Grid */}
        {filteredCases.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            data-testid="cases-grid"
          >
            {filteredCases.map((caseItem) => (
              <CaseCard
                key={caseItem.id}
                caseItem={caseItem}
                onCaseClick={handleCaseClick}
              />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12"
            data-testid="empty-state"
          >
            <p className="text-secondary text-lg">
              No cases found for the selected industry.
            </p>
          </div>
        )}

        {/* Results Count */}
        {filteredCases.length > 0 && (
          <div className="text-center mt-8" data-testid="results-count">
            <p className="text-secondary">
              Showing {filteredCases.length} of {cases.length} cases
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

interface CaseCardProps {
  caseItem: Case;
  onCaseClick: (caseId: string) => void;
}

const CaseCard: React.FC<CaseCardProps> = ({ caseItem, onCaseClick }) => {
  const handleClick = () => {
    onCaseClick(caseItem.id);
  };

  return (
    <Link href={caseItem.link}>
      <div
        className="card rounded-lg overflow-hidden cursor-pointer h-full"
        onClick={handleClick}
        data-testid={`case-card-${caseItem.id}`}
      >
        {/* Thumbnail */}
        <div className="relative w-full h-48 bg-neutral-200 overflow-hidden">
          <img
            src={caseItem.thumbnail}
            alt={caseItem.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Industry Badge */}
          <div className="mb-3">
            <span
              className="badge-primary"
              data-testid={`industry-badge-${caseItem.id}`}
            >
              {caseItem.industry}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-primary mb-2 line-clamp-2">
            {caseItem.title}
          </h3>

          {/* Description */}
          <p className="text-secondary text-sm mb-4 line-clamp-3">
            {caseItem.description}
          </p>

          {/* Results */}
          {caseItem.results.length > 0 && (
            <div className="mb-4" data-testid={`results-${caseItem.id}`}>
              <p className="text-sm font-semibold text-primary mb-2">Key Results:</p>
              <ul className="space-y-1">
                {caseItem.results.slice(0, 2).map((result, index) => (
                  <li
                    key={index}
                    className="text-sm text-secondary flex items-start"
                    data-testid={`result-${caseItem.id}-${index}`}
                  >
                    <span className="text-secondary-500 mr-2">✓</span>
                    <span className="line-clamp-1">{result}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Learn More Link */}
          <div className="pt-4 border-t border-border-light">
            <span className="text-primary font-medium text-sm hover:text-primary-600 inline-flex items-center">
              View Case Study
              <span className="ml-2">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CaseShowcase;
