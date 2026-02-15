'use client';

import React, { useState, useMemo } from 'react';
import { ServiceCard } from './ServiceCard';
import type { Service, ServiceCategory, ServiceFilter } from '@/types/website';

interface ServiceListProps {
  services: Service[];
  categories?: ServiceCategory[];
  onServiceClick?: (service: Service) => void;
  className?: string;
}

type SortOption = 'popularity' | 'price-low' | 'price-high' | 'newest' | 'rating';

/**
 * Service List Component
 * 
 * Displays a grid of service cards with filtering and search capabilities.
 * Supports category filtering, price range filtering, search, and sorting.
 * 
 * Requirements: 2.1, 2.2, 2.4, 2.5, 6.1, 6.4, 6.2, 6.3, 6.5
 * 
 * @param services - Array of services to display
 * @param categories - Optional array of service categories
 * @param onServiceClick - Optional callback when service is clicked
 * @param className - Optional CSS class for styling
 * @returns Rendered service list component
 */
export function ServiceList({
  services,
  categories = [],
  onServiceClick,
  className = '',
}: ServiceListProps): React.ReactElement {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');

  // Calculate min and max prices from services
  const priceStats = useMemo(() => {
    if (services.length === 0) return { min: 0, max: 10000 };
    const prices = services.map(s => s.price || 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [services]);

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let result = services.filter((service) => {
      const matchesCategory =
        !selectedCategory || service.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice =
        (service.price || 0) >= priceRange[0] &&
        (service.price || 0) <= priceRange[1];

      return matchesCategory && matchesSearch && matchesPrice;
    });

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        // Assuming services have a createdAt field, sort by that
        result.sort((a, b) => {
          const aDate = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
          const bDate = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
          return bDate - aDate;
        });
        break;
      case 'popularity':
      default:
        // Sort by review count (popularity indicator)
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
    }

    return result;
  }, [services, selectedCategory, searchQuery, priceRange, sortBy]);

  const handleServiceClick = (service: Service) => {
    onServiceClick?.(service);
  };

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setPriceRange([priceStats.min, priceStats.max]);
    setSortBy('popularity');
  };

  return (
    <section className={`w-full py-12 sm:py-16 md:py-20 lg:py-24 ${className}`} data-testid="service-list">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 sm:mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
            Our Services
          </h2>
          <p className="text-base sm:text-lg text-secondary max-w-2xl mx-auto">
            Explore our comprehensive range of professional services designed to meet your business needs
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12 sm:mb-16 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 input rounded-lg focus:outline-none transition-colors duration-300"
              data-testid="service-search-input"
            />
            <svg
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 ${
                  selectedCategory === null
                    ? 'btn-primary'
                    : 'bg-neutral-100 text-primary hover:bg-neutral-200'
                }`}
                data-testid="category-filter-all"
              >
                All Services
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'btn-primary'
                      : 'bg-neutral-100 text-primary hover:bg-neutral-200'
                  }`}
                  data-testid={`category-filter-${category.id}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* Price Range Filter */}
          <div className="bg-neutral-100 p-4 sm:p-6 rounded-lg">
            <label className="block text-sm font-semibold text-primary mb-4">
              Price Range: ${priceRange[0]} - ${priceRange[1]}
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="range"
                min={priceStats.min}
                max={priceStats.max}
                value={priceRange[0]}
                onChange={(e) => {
                  const newMin = Math.min(Number(e.target.value), priceRange[1]);
                  setPriceRange([newMin, priceRange[1]]);
                }}
                className="flex-1"
                data-testid="price-range-min"
              />
              <span className="text-secondary">to</span>
              <input
                type="range"
                min={priceStats.min}
                max={priceStats.max}
                value={priceRange[1]}
                onChange={(e) => {
                  const newMax = Math.max(Number(e.target.value), priceRange[0]);
                  setPriceRange([priceRange[0], newMax]);
                }}
                className="flex-1"
                data-testid="price-range-max"
              />
            </div>
          </div>

          {/* Sort and Reset Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-semibold text-primary mb-2">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full sm:w-48 px-4 py-2 input rounded-lg focus:outline-none transition-colors duration-300"
                data-testid="sort-select"
              >
                <option value="popularity">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
            <button
              onClick={handleResetFilters}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-primary bg-neutral-200 hover:bg-neutral-300 rounded-lg transition-colors duration-300"
              data-testid="reset-filters-button"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8 text-sm sm:text-base text-secondary">
          Showing <span className="font-semibold text-primary">{filteredServices.length}</span> of{' '}
          <span className="font-semibold text-primary">{services.length}</span> services
        </div>

        {/* Service Grid */}
        {filteredServices.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            data-testid="service-grid"
          >
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={() => handleServiceClick(service)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <svg
              className="mx-auto w-16 h-16 sm:w-20 sm:h-20 text-neutral-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">
              No services found
            </h3>
            <p className="text-sm sm:text-base text-secondary">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ServiceList;
