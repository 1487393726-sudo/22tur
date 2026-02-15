/**
 * ServiceComparison Component Examples
 * 
 * This file demonstrates various usage patterns for the ServiceComparison component.
 */

import React from 'react';
import { ServiceComparison, ServiceData } from './ServiceComparison';

// Mock translation function
const mockT = (key: string) => {
  const translations: Record<string, string> = {
    'comparison.title': 'Compare Services',
    'comparison.subtitle': 'Select services to compare features and find the best fit',
    'comparison.selectHint': 'Selected {count} services',
    'comparison.select': 'Select',
    'comparison.selected': 'Selected',
    'comparison.compare': 'Compare Services',
    'comparison.clear': 'Clear Selection',
    'comparison.viewTitle': 'Service Comparison',
    'comparison.comparing': 'Comparing',
    'comparison.services': 'services',
    'comparison.back': 'Back',
    'comparison.features': 'Features',
    'comparison.remove': 'Remove',
    'comparison.feature': 'Feature',
    'comparison.contact': 'Contact Us',
    'comparison.startOver': 'Start Over',
  };
  return translations[key] || key;
};

// Sample service data
const sampleServices: ServiceData[] = [
  {
    key: 'webDev',
    title: 'Web Development',
    description: 'Build high-performance websites',
    icon: '💻',
    color: '#3b82f6',
    features: ['Responsive Design', 'SEO Optimization', 'High Performance', 'Secure & Reliable'],
    price: '$9,999+',
  },
  {
    key: 'mobile',
    title: 'Mobile App Development',
    description: 'Native and cross-platform apps',
    icon: '📱',
    color: '#10b981',
    features: ['Native Development', 'Cross-Platform', 'App Store Publishing', 'Ongoing Maintenance'],
    price: '$19,999+',
  },
  {
    key: 'uiux',
    title: 'UI/UX Design',
    description: 'Beautiful, intuitive interfaces',
    icon: '🎨',
    color: '#f59e0b',
    features: ['User Research', 'Interaction Design', 'Visual Design', 'Prototyping'],
    price: '$4,999+',
  },
  {
    key: 'branding',
    title: 'Brand Building',
    description: 'Unique brand identities',
    icon: '🏆',
    color: '#ef4444',
    features: ['Brand Strategy', 'Logo Design', 'Visual Identity', 'Brand Guidelines'],
    price: '$7,999+',
  },
  {
    key: 'marketing',
    title: 'Digital Marketing',
    description: 'Promote through digital channels',
    icon: '📈',
    color: '#8b5cf6',
    features: ['SEO/SEM', 'Social Media', 'Content Marketing', 'Data Analytics'],
    price: '$2,999+/mo',
  },
  {
    key: 'consulting',
    title: 'Technical Consulting',
    description: 'Professional technical advice',
    icon: '🔧',
    color: '#06b6d4',
    features: ['Technology Selection', 'Architecture Design', 'Performance Optimization', 'Security Audit'],
    price: '$199+/hr',
  },
];

/**
 * Example 1: Basic Usage
 * Standard service comparison with default settings
 */
export const BasicExample = () => {
  return (
    <div className="p-8 bg-gray-50">
      <ServiceComparison
        services={sampleServices}
        t={mockT}
      />
    </div>
  );
};

/**
 * Example 2: Limited Comparison
 * Allow comparing only 2 services at a time
 */
export const LimitedComparisonExample = () => {
  return (
    <div className="p-8 bg-gray-50">
      <ServiceComparison
        services={sampleServices}
        maxCompare={2}
        t={mockT}
      />
    </div>
  );
};

/**
 * Example 3: With Callback
 * Track comparison changes with callback
 */
export const WithCallbackExample = () => {
  const handleComparisonChange = (selectedServices: ServiceData[]) => {
    console.log('Selected services:', selectedServices.map(s => s.title));
  };

  return (
    <div className="p-8 bg-gray-50">
      <ServiceComparison
        services={sampleServices}
        maxCompare={3}
        t={mockT}
        onComparisonChange={handleComparisonChange}
      />
    </div>
  );
};

/**
 * Example 4: Subset of Services
 * Compare only specific services
 */
export const SubsetExample = () => {
  const techServices = sampleServices.filter(s => 
    ['webDev', 'mobile', 'uiux'].includes(s.key)
  );

  return (
    <div className="p-8 bg-gray-50">
      <ServiceComparison
        services={techServices}
        maxCompare={3}
        t={mockT}
      />
    </div>
  );
};

/**
 * Example 5: Custom Styling
 * Apply custom classes for different appearance
 */
export const CustomStyledExample = () => {
  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <ServiceComparison
        services={sampleServices}
        maxCompare={3}
        t={mockT}
        className="max-w-7xl mx-auto"
      />
    </div>
  );
};

/**
 * Example 6: Minimal Services
 * Test with only 2 services
 */
export const MinimalExample = () => {
  const minimalServices = sampleServices.slice(0, 2);

  return (
    <div className="p-8 bg-gray-50">
      <ServiceComparison
        services={minimalServices}
        maxCompare={2}
        t={mockT}
      />
    </div>
  );
};

/**
 * Example 7: Many Services
 * Test with extended service list
 */
export const ManyServicesExample = () => {
  const extendedServices: ServiceData[] = [
    ...sampleServices,
    {
      key: 'ecommerce',
      title: 'E-commerce Solutions',
      description: 'Complete online store setup',
      icon: '🛒',
      color: '#ec4899',
      features: ['Shopping Cart', 'Payment Integration', 'Inventory Management', 'Order Tracking'],
      price: '$14,999+',
    },
    {
      key: 'cloud',
      title: 'Cloud Services',
      description: 'Scalable cloud infrastructure',
      icon: '☁️',
      color: '#14b8a6',
      features: ['AWS/Azure Setup', 'Auto Scaling', 'Load Balancing', 'Monitoring'],
      price: '$999+/mo',
    },
  ];

  return (
    <div className="p-8 bg-gray-50">
      <ServiceComparison
        services={extendedServices}
        maxCompare={4}
        t={mockT}
      />
    </div>
  );
};

// Export all examples
export default {
  BasicExample,
  LimitedComparisonExample,
  WithCallbackExample,
  SubsetExample,
  CustomStyledExample,
  MinimalExample,
  ManyServicesExample,
};
