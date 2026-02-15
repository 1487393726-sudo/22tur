/**
 * Timeline Component Examples
 * 
 * This file demonstrates various usage patterns for the Timeline component.
 */

import React from 'react';
import { Timeline, TimelineMilestone } from './Timeline';

/**
 * Example 1: Basic Timeline
 */
export const BasicTimeline = () => {
  const milestones: TimelineMilestone[] = [
    {
      year: '2019',
      title: 'Company Founded',
      description: 'Started as a small team with a dream to help businesses go digital.',
      icon: '🚀',
    },
    {
      year: '2020',
      title: 'First Major Client',
      description: 'Secured our first enterprise client and expanded the team to 10 members.',
      icon: '🎯',
    },
    {
      year: '2021',
      title: 'Product Launch',
      description: 'Launched our flagship product that revolutionized the industry.',
      icon: '✨',
    },
    {
      year: '2022',
      title: 'International Expansion',
      description: 'Opened offices in three new countries and reached 100+ clients.',
      icon: '🌍',
    },
    {
      year: '2023',
      title: 'Industry Recognition',
      description: 'Received multiple awards for innovation and customer satisfaction.',
      icon: '🏆',
    },
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Our Journey</h2>
        <Timeline milestones={milestones} />
      </div>
    </div>
  );
};

/**
 * Example 2: Timeline with Custom Colors
 */
export const ColorfulTimeline = () => {
  const milestones: TimelineMilestone[] = [
    {
      year: '2019',
      title: 'Foundation',
      description: 'The beginning of our journey.',
      icon: '🌱',
      color: '#10b981', // Green
    },
    {
      year: '2020',
      title: 'Growth',
      description: 'Rapid expansion and team building.',
      icon: '📈',
      color: '#3b82f6', // Blue
    },
    {
      year: '2021',
      title: 'Innovation',
      description: 'Breakthrough products and services.',
      icon: '💡',
      color: '#f59e0b', // Amber
    },
    {
      year: '2022',
      title: 'Excellence',
      description: 'Industry leadership and recognition.',
      icon: '⭐',
      color: '#8b5cf6', // Purple
    },
  ];

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Milestones</h2>
        <Timeline
          milestones={milestones}
          lineColor="#e5e7eb"
          markerColor="#6366f1"
        />
      </div>
    </div>
  );
};

/**
 * Example 3: RTL Timeline (for Arabic/Uyghur)
 */
export const RTLTimeline = () => {
  const milestones: TimelineMilestone[] = [
    {
      year: '2019',
      title: 'تأسيس الشركة',
      description: 'بدأنا كفريق صغير بحلم مساعدة الشركات على التحول الرقمي.',
      icon: '🚀',
    },
    {
      year: '2020',
      title: 'التوسع',
      description: 'توسعنا إلى 10 أعضاء في الفريق وحصلنا على عملاء رئيسيين.',
      icon: '📈',
    },
    {
      year: '2021',
      title: 'الابتكار',
      description: 'أطلقنا منتجات مبتكرة غيرت الصناعة.',
      icon: '✨',
    },
  ];

  return (
    <div className="py-16 bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">رحلتنا</h2>
        <Timeline milestones={milestones} isRTL={true} />
      </div>
    </div>
  );
};

/**
 * Example 4: Compact Timeline with Fast Animation
 */
export const CompactTimeline = () => {
  const milestones: TimelineMilestone[] = [
    {
      year: 'Q1 2023',
      title: 'Product Beta',
      description: 'Released beta version to select users.',
    },
    {
      year: 'Q2 2023',
      title: 'Public Launch',
      description: 'Officially launched to the public.',
    },
    {
      year: 'Q3 2023',
      title: 'Feature Update',
      description: 'Added major new features based on feedback.',
    },
    {
      year: 'Q4 2023',
      title: 'Enterprise Edition',
      description: 'Launched enterprise-grade features.',
    },
  ];

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-12">2023 Roadmap</h2>
        <Timeline
          milestones={milestones}
          staggerDelay={0.1}
          lineColor="#d1d5db"
          markerColor="#6366f1"
        />
      </div>
    </div>
  );
};

/**
 * Example 5: Timeline in Dark Mode
 */
export const DarkTimeline = () => {
  const milestones: TimelineMilestone[] = [
    {
      year: '2019',
      title: 'Genesis',
      description: 'The spark that started it all.',
      icon: '⚡',
      color: '#fbbf24',
    },
    {
      year: '2021',
      title: 'Evolution',
      description: 'Transforming the industry landscape.',
      icon: '🔮',
      color: '#a78bfa',
    },
    {
      year: '2023',
      title: 'Revolution',
      description: 'Leading the next generation of innovation.',
      icon: '🚀',
      color: '#60a5fa',
    },
  ];

  return (
    <div className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">
          Our Evolution
        </h2>
        <Timeline
          milestones={milestones}
          lineColor="#374151"
          markerColor="#4f46e5"
          className="text-white"
        />
      </div>
    </div>
  );
};

export default BasicTimeline;
