'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: any;
}

export interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number';
  options?: FilterOption[];
  placeholder?: string;
}

export interface SearchFilterProps {
  fields: FilterField[];
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, any>) => void;
  onClear?: () => void;
  searchPlaceholder?: string;
  showAdvanced?: boolean;
  recentSearches?: string[];
  className?: string;
}

export function SearchFilter({
  fields,
  onSearch,
  onFilter,
  onClear,
  searchPlaceholder = 'Search...',
  showAdvanced = true,
  recentSearches = [],
  className = '',
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      onSearch(query);
    },
    [onSearch]
  );

  const handleFilterChange = useCallback(
    (fieldName: string, value: any) => {
      const newFilters = { ...filters, [fieldName]: value };
      setFilters(newFilters);
      onFilter(newFilters);
    },
    [filters, onFilter]
  );

  const handleMultiselectChange = useCallback(
    (fieldName: string, value: any) => {
      const current = filters[fieldName] || [];
      const newValue = current.includes(value)
        ? current.filter((v: any) => v !== value)
        : [...current, value];
      const newFilters = { ...filters, [fieldName]: newValue };
      setFilters(newFilters);
      onFilter(newFilters);
    },
    [filters, onFilter]
  );

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setFilters({});
    setSelectedFilters(new Set());
    onClear?.();
  }, [onClear]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(v => v && (Array.isArray(v) ? v.length > 0 : true))
      .length;
  }, [filters]);

  const renderFilterField = (field: FilterField) => {
    const value = filters[field.name];

    switch (field.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={e => handleFilterChange(field.name, e.target.value)}
            className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-gray-500 focus:outline-none text-sm"
          >
            <option value="">All {field.label}</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2 p-2 bg-gray-700 rounded border border-gray-600">
            {field.options?.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(value || []).includes(opt.value)}
                  onChange={() => handleMultiselectChange(field.name, opt.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-300">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={e => handleFilterChange(field.name, e.target.value)}
            className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-gray-500 focus:outline-none text-sm"
          />
        );

      case 'daterange':
        return (
          <div className="flex gap-2">
            <input
              type="date"
              value={value?.from || ''}
              onChange={e =>
                handleFilterChange(field.name, {
                  ...value,
                  from: e.target.value,
                })
              }
              placeholder="From"
              className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-gray-500 focus:outline-none text-sm flex-1"
            />
            <input
              type="date"
              value={value?.to || ''}
              onChange={e =>
                handleFilterChange(field.name, {
                  ...value,
                  to: e.target.value,
                })
              }
              placeholder="To"
              className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-gray-500 focus:outline-none text-sm flex-1"
            />
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={e => handleFilterChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-gray-500 focus:outline-none text-sm"
          />
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={e => handleFilterChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-gray-500 focus:outline-none text-sm"
          />
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => setShowRecentSearches(true)}
            onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-10 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-gray-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Recent Searches Dropdown */}
        {showRecentSearches && recentSearches.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
            <div className="p-2 text-xs text-gray-400 font-semibold">Recent Searches</div>
            {recentSearches.map((search, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(search)}
                className="w-full text-left px-3 py-2 hover:bg-gray-700 text-gray-300 text-sm transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters Toggle */}
      {showAdvanced && fields.length > 0 && (
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          <Filter size={16} />
          Advanced Filters
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {/* Advanced Filters Panel */}
      {showAdvanced && showAdvancedFilters && fields.length > 0 && (
        <div className="p-4 bg-gray-800 rounded border border-gray-700 space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {field.label}
              </label>
              {renderFilterField(field)}
            </div>
          ))}

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <button
              onClick={handleClear}
              className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null;

            const field = fields.find(f => f.name === key);
            const displayValue = Array.isArray(value)
              ? value.length > 1
                ? `${value.length} selected`
                : field?.options?.find(o => o.value === value[0])?.label || value[0]
              : field?.options?.find(o => o.value === value)?.label || value;

            return (
              <div
                key={key}
                className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm flex items-center gap-2"
              >
                <span>{displayValue}</span>
                <button
                  onClick={() => handleFilterChange(key, Array.isArray(value) ? [] : '')}
                  className="hover:text-blue-100"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
