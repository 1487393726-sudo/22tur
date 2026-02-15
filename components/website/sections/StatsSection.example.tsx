/**
 * StatsSection Component Examples
 * 
 * This file demonstrates various usage patterns for the StatsSection component
 * including different configurations, styles, and layouts.
 */

import React from 'react';
import { StatsSection } from './StatsSection';

/**
 * Example 1: Basic Stats Section
 * Simple stats with default styling
 */
export const BasicStatsExample = () => (
  <StatsSection
    title="Our Achievements"
    subtitle="Numbers that speak for themselves"
    stats={[
      { value: 100, label: 'Projects Completed', suffix: '+', icon: '🚀' },
      { value: 50, label: 'Happy Clients', suffix: '+', icon: '😊' },
      { value: 10, label: 'Years Experience', suffix: '+', icon: '⭐' },
      { value: 99.9, label: 'Client Satisfaction', suffix: '%', decimals: 1, icon: '💯' },
    ]}
  />
);

/**
 * Example 2: Custom Colors
 * Stats with custom accent colors for each card
 */
export const CustomColorsExample = () => (
  <StatsSection
    title="Company Metrics"
    subtitle="Real-time performance indicators"
    stats={[
      {
        value: 1000,
        label: 'Active Users',
        suffix: '+',
        icon: '👥',
        color: '#3b82f6', // Blue
      },
      {
        value: 500,
        label: 'Daily Transactions',
        suffix: '+',
        icon: '💳',
        color: '#8b5cf6', // Purple
      },
      {
        value: 98.5,
        label: 'Uptime',
        suffix: '%',
        decimals: 1,
        icon: '⚡',
        color: '#10b981', // Green
      },
      {
        value: 24,
        label: 'Support Hours',
        suffix: '/7',
        icon: '🕐',
        color: '#f59e0b', // Amber
      },
    ]}
    background="bg-white"
    glassIntensity="medium"
    depth="deep"
  />
);

/**
 * Example 3: Financial Stats
 * Stats with currency prefix and large numbers
 */
export const FinancialStatsExample = () => (
  <StatsSection
    title="Financial Performance"
    subtitle="Q4 2024 Results"
    stats={[
      {
        value: 5000000,
        label: 'Annual Revenue',
        prefix: '$',
        icon: '💰',
        color: '#059669',
      },
      {
        value: 250000,
        label: 'Monthly Growth',
        prefix: '$',
        suffix: '+',
        icon: '📈',
        color: '#0891b2',
      },
      {
        value: 35,
        label: 'Profit Margin',
        suffix: '%',
        icon: '💹',
        color: '#7c3aed',
      },
    ]}
    columns={{ mobile: 1, tablet: 2, desktop: 3 }}
    background="bg-gradient-to-br from-blue-50 to-purple-50"
  />
);

/**
 * Example 4: Minimal Stats (No Title)
 * Compact stats display without section header
 */
export const MinimalStatsExample = () => (
  <StatsSection
    stats={[
      { value: 500, label: 'Downloads', suffix: 'K+', icon: '⬇️' },
      { value: 4.8, label: 'Rating', suffix: '/5', decimals: 1, icon: '⭐' },
      { value: 1000, label: 'Reviews', suffix: '+', icon: '💬' },
    ]}
    columns={{ mobile: 1, tablet: 3, desktop: 3 }}
    background="bg-transparent"
    glassIntensity="light"
    depth="shallow"
  />
);

/**
 * Example 5: Two Column Layout
 * Stats arranged in two columns for tablet and desktop
 */
export const TwoColumnExample = () => (
  <StatsSection
    title="Platform Statistics"
    stats={[
      { value: 10000, label: 'Registered Users', suffix: '+', icon: '👤' },
      { value: 5000, label: 'Active Projects', suffix: '+', icon: '📁' },
      { value: 50000, label: 'Files Uploaded', suffix: '+', icon: '📄' },
      { value: 99.99, label: 'Availability', suffix: '%', decimals: 2, icon: '✅' },
    ]}
    columns={{ mobile: 1, tablet: 2, desktop: 2 }}
    background="bg-gray-100"
  />
);

/**
 * Example 6: Heavy Glass Effect
 * Stats with strong glass morphism effect
 */
export const HeavyGlassExample = () => (
  <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-8">
    <StatsSection
      title="Global Reach"
      subtitle="Serving customers worldwide"
      stats={[
        { value: 150, label: 'Countries', suffix: '+', icon: '🌍' },
        { value: 1000000, label: 'Users', suffix: '+', icon: '👥' },
        { value: 50, label: 'Languages', suffix: '+', icon: '🗣️' },
        { value: 24, label: 'Support', suffix: '/7', icon: '💬' },
      ]}
      background="bg-transparent"
      glassIntensity="heavy"
      depth="deep"
      className="text-white"
    />
  </div>
);

/**
 * Example 7: Single Row Layout
 * All stats in a single row on desktop
 */
export const SingleRowExample = () => (
  <StatsSection
    title="Quick Facts"
    stats={[
      { value: 2020, label: 'Founded', icon: '🏢' },
      { value: 100, label: 'Team Members', suffix: '+', icon: '👨‍💼' },
      { value: 15, label: 'Offices', icon: '🏙️' },
    ]}
    columns={{ mobile: 1, tablet: 3, desktop: 3 }}
    background="bg-white"
    depth="medium"
  />
);

/**
 * Example 8: Dark Background
 * Stats optimized for dark backgrounds
 */
export const DarkBackgroundExample = () => (
  <div className="bg-gray-900 p-8">
    <StatsSection
      title="Performance Metrics"
      subtitle="Real-time system statistics"
      stats={[
        { value: 99.9, label: 'Uptime', suffix: '%', decimals: 1, icon: '⚡', color: '#10b981' },
        { value: 50, label: 'Response Time', suffix: 'ms', icon: '⏱️', color: '#3b82f6' },
        { value: 1000, label: 'Requests/sec', suffix: '+', icon: '🚀', color: '#8b5cf6' },
        { value: 0, label: 'Downtime', suffix: 'hrs', icon: '✅', color: '#059669' },
      ]}
      background="bg-transparent"
      glassIntensity="medium"
      className="text-white"
    />
  </div>
);

/**
 * All Examples Component
 * Renders all examples for demonstration
 */
export const AllStatsExamples = () => (
  <div className="space-y-16 py-8">
    <div>
      <h3 className="text-2xl font-bold mb-4 px-4">Basic Stats</h3>
      <BasicStatsExample />
    </div>
    
    <div>
      <h3 className="text-2xl font-bold mb-4 px-4">Custom Colors</h3>
      <CustomColorsExample />
    </div>
    
    <div>
      <h3 className="text-2xl font-bold mb-4 px-4">Financial Stats</h3>
      <FinancialStatsExample />
    </div>
    
    <div>
      <h3 className="text-2xl font-bold mb-4 px-4">Minimal Stats</h3>
      <MinimalStatsExample />
    </div>
    
    <div>
      <h3 className="text-2xl font-bold mb-4 px-4">Two Column Layout</h3>
      <TwoColumnExample />
    </div>
    
    <div>
      <h3 className="text-2xl font-bold mb-4 px-4">Heavy Glass Effect</h3>
      <HeavyGlassExample />
    </div>
    
    <div>
      <h3 className="text-2xl font-bold mb-4 px-4">Single Row</h3>
      <SingleRowExample />
    </div>
    
    <div>
      <h3 className="text-2xl font-bold mb-4 px-4">Dark Background</h3>
      <DarkBackgroundExample />
    </div>
  </div>
);

export default AllStatsExamples;
