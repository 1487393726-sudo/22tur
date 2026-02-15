'use client';

/**
 * ServiceComparison Component
 * 
 * A service comparison component that allows users to select and compare
 * multiple services side-by-side using 3D cards.
 * 
 * Features:
 * - Select/deselect services for comparison
 * - Side-by-side 3D card display
 * - Feature comparison table
 * - Multi-language support
 * - Responsive layout
 * - Accessibility compliant
 * 
 * Requirements: 9.4
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card3D } from '@/components/website/3d/Card3D';
import { FadeInView } from '@/components/website/animations/FadeInView';
import { cn } from '@/lib/utils';

/**
 * Service data interface
 */
export interface ServiceData {
  key: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  price?: string;
}

/**
 * ServiceComparison Props Interface
 */
export interface ServiceComparisonProps {
  /** Available services to compare */
  services: ServiceData[];
  
  /** Maximum number of services that can be compared */
  maxCompare?: number;
  
  /** Translation function */
  t: (key: string) => string;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Callback when comparison changes */
  onComparisonChange?: (selectedServices: ServiceData[]) => void;
}

/**
 * ServiceComparison Component
 */
export const ServiceComparison: React.FC<ServiceComparisonProps> = ({
  services,
  maxCompare = 3,
  t,
  className,
  onComparisonChange,
}) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  /**
   * Toggle service selection
   */
  const toggleService = useCallback(
    (serviceKey: string) => {
      setSelectedServices((prev) => {
        let newSelection: string[];
        
        if (prev.includes(serviceKey)) {
          // Deselect
          newSelection = prev.filter((key) => key !== serviceKey);
        } else {
          // Select (if not at max)
          if (prev.length >= maxCompare) {
            return prev; // Don't add if at max
          }
          newSelection = [...prev, serviceKey];
        }
        
        // Notify parent
        const selectedData = services.filter((s) =>
          newSelection.includes(s.key)
        );
        onComparisonChange?.(selectedData);
        
        return newSelection;
      });
    },
    [maxCompare, services, onComparisonChange]
  );
  
  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedServices([]);
    setShowComparison(false);
    onComparisonChange?.([]);
  }, [onComparisonChange]);
  
  /**
   * Show comparison view
   */
  const handleShowComparison = useCallback(() => {
    if (selectedServices.length >= 2) {
      setShowComparison(true);
    }
  }, [selectedServices.length]);
  
  /**
   * Hide comparison view
   */
  const handleHideComparison = useCallback(() => {
    setShowComparison(false);
  }, []);
  
  // Get selected service data
  const selectedServiceData = services.filter((s) =>
    selectedServices.includes(s.key)
  );
  
  // Check if service is selected
  const isSelected = (serviceKey: string) =>
    selectedServices.includes(serviceKey);
  
  // Check if can select more
  const canSelectMore = selectedServices.length < maxCompare;
  
  return (
    <div className={cn('w-full', className)}>
      {/* Selection Section */}
      {!showComparison && (
        <FadeInView>
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
                {t('comparison.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
                {t('comparison.subtitle')}
              </p>
              <p className="text-sm text-gray-500">
                {t('comparison.selectHint').replace(
                  '{count}',
                  `${selectedServices.length}/${maxCompare}`
                )}
              </p>
            </div>
            
            {/* Service Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const selected = isSelected(service.key);
                const disabled = !selected && !canSelectMore;
                
                return (
                  <Card3D
                    key={service.key}
                    intensity="light"
                    depth="shallow"
                    glassEffect="light"
                    className={cn(
                      'p-6 bg-white border-2 transition-all duration-300',
                      selected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200',
                      disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={() => !disabled && toggleService(service.key)}
                    ariaLabel={`${service.title} - ${
                      selected ? t('comparison.selected') : t('comparison.select')
                    }`}
                  >
                    {/* Selection Indicator */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md"
                        style={{ backgroundColor: service.color }}
                      >
                        <span className="text-white text-2xl">
                          {service.icon}
                        </span>
                      </div>
                      
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                          selected
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-gray-300'
                        )}
                      >
                        {selected && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    {/* Service Info */}
                    <h3 className="text-xl font-bold text-primary-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </Card3D>
                );
              })}
            </div>
            
            {/* Action Buttons */}
            {selectedServices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-4 justify-center"
              >
                <button
                  onClick={handleShowComparison}
                  disabled={selectedServices.length < 2}
                  className={cn(
                    'px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg',
                    selectedServices.length >= 2
                      ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  )}
                >
                  {t('comparison.compare')} ({selectedServices.length})
                </button>
                
                <button
                  onClick={clearSelection}
                  className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  {t('comparison.clear')}
                </button>
              </motion.div>
            )}
          </div>
        </FadeInView>
      )}
      
      {/* Comparison View */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-2">
                  {t('comparison.viewTitle')}
                </h2>
                <p className="text-gray-600">
                  {t('comparison.comparing')} {selectedServices.length}{' '}
                  {t('comparison.services')}
                </p>
              </div>
              
              <button
                onClick={handleHideComparison}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                ← {t('comparison.back')}
              </button>
            </div>
            
            {/* Side-by-Side Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedServiceData.map((service, index) => (
                <motion.div
                  key={service.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card3D
                    intensity="medium"
                    depth="medium"
                    glassEffect="light"
                    className="p-6 bg-white border border-gray-200 h-full"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md"
                        style={{ backgroundColor: service.color }}
                      >
                        <span className="text-white text-2xl">
                          {service.icon}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-primary-900">
                          {service.title}
                        </h3>
                        {service.price && (
                          <p className="text-sm text-gray-600">
                            {service.price}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        {t('comparison.features')}:
                      </p>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-gray-700"
                          >
                            <span className="text-green-500 mt-1">✓</span>
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => toggleService(service.key)}
                      className="mt-6 w-full py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {t('comparison.remove')}
                    </button>
                  </Card3D>
                </motion.div>
              ))}
            </div>
            
            {/* Feature Comparison Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        {t('comparison.feature')}
                      </th>
                      {selectedServiceData.map((service) => (
                        <th
                          key={service.key}
                          className="px-6 py-4 text-center text-sm font-semibold text-gray-700"
                        >
                          {service.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Get all unique features */}
                    {Array.from(
                      new Set(
                        selectedServiceData.flatMap((s) => s.features)
                      )
                    ).map((feature, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {feature}
                        </td>
                        {selectedServiceData.map((service) => (
                          <td
                            key={service.key}
                            className="px-6 py-4 text-center"
                          >
                            {service.features.includes(feature) ? (
                              <span className="text-green-500 text-xl">✓</span>
                            ) : (
                              <span className="text-gray-300 text-xl">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/contact"
                className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
              >
                {t('comparison.contact')} →
              </a>
              
              <button
                onClick={clearSelection}
                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                {t('comparison.startOver')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceComparison;
