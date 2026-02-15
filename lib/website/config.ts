/**
 * Website System Configuration
 * Central configuration for the website system
 */

import type { WebsiteConfig, ThemeData } from '@/types/website';

// ============================================================================
// Website Configuration
// ============================================================================

export const websiteConfig: WebsiteConfig = {
  siteName: 'Professional Services',
  siteDescription: 'Professional services company providing expert solutions',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  logo: '/logo.svg',
  favicon: '/favicon.ico',
  brandColor: '#1E3A5F', // Deep blue brand color
  socialLinks: [
    {
      platform: 'facebook',
      url: 'https://facebook.com',
      icon: 'facebook',
      label: 'Facebook',
    },
    {
      platform: 'twitter',
      url: 'https://twitter.com',
      icon: 'twitter',
      label: 'Twitter',
    },
    {
      platform: 'linkedin',
      url: 'https://linkedin.com',
      icon: 'linkedin',
      label: 'LinkedIn',
    },
    {
      platform: 'instagram',
      url: 'https://instagram.com',
      icon: 'instagram',
      label: 'Instagram',
    },
  ],
  contactInfo: {
    email: 'contact@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Street, City, State 12345',
    businessHours: [
      {
        day: 'Monday',
        openTime: '09:00',
        closeTime: '18:00',
        isClosed: false,
      },
      {
        day: 'Tuesday',
        openTime: '09:00',
        closeTime: '18:00',
        isClosed: false,
      },
      {
        day: 'Wednesday',
        openTime: '09:00',
        closeTime: '18:00',
        isClosed: false,
      },
      {
        day: 'Thursday',
        openTime: '09:00',
        closeTime: '18:00',
        isClosed: false,
      },
      {
        day: 'Friday',
        openTime: '09:00',
        closeTime: '18:00',
        isClosed: false,
      },
      {
        day: 'Saturday',
        openTime: '10:00',
        closeTime: '16:00',
        isClosed: false,
      },
      {
        day: 'Sunday',
        openTime: '00:00',
        closeTime: '00:00',
        isClosed: true,
      },
    ],
    analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID,
    sitemapUrl: '/sitemap.xml',
  },
  businessHours: [
    {
      day: 'Monday',
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: false,
    },
    {
      day: 'Tuesday',
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: false,
    },
    {
      day: 'Wednesday',
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: false,
    },
    {
      day: 'Thursday',
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: false,
    },
    {
      day: 'Friday',
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: false,
    },
    {
      day: 'Saturday',
      openTime: '10:00',
      closeTime: '16:00',
      isClosed: false,
    },
    {
      day: 'Sunday',
      openTime: '00:00',
      closeTime: '00:00',
      isClosed: true,
    },
  ],
  sitemapUrl: '/sitemap.xml',
};

// ============================================================================
// Theme Configuration
// ============================================================================

export const themeConfig: ThemeData = {
  colors: {
    primary: '#1E3A5F', // Deep blue
    secondary: '#2D5A8C', // Medium blue
    accent: '#FF6B35', // Orange accent
    background: '#FFFFFF',
    text: '#1F2937',
    border: '#E5E7EB',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

// ============================================================================
// Navigation Configuration
// ============================================================================

export const navigationConfig = {
  mainMenu: [
    {
      label: 'Home',
      href: '/',
      icon: 'home',
    },
    {
      label: 'Services',
      href: '/services',
      icon: 'briefcase',
    },
    {
      label: 'Cases',
      href: '/cases',
      icon: 'folder',
    },
    {
      label: 'About',
      href: '/about',
      icon: 'info',
    },
    {
      label: 'Blog',
      href: '/blog',
      icon: 'newspaper',
    },
    {
      label: 'Contact',
      href: '/contact',
      icon: 'mail',
    },
  ],
  footerLinks: [
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Services', href: '/services' },
        { label: 'Cases', href: '/cases' },
        { label: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Help Center', href: '/help' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
      ],
    },
  ],
};

// ============================================================================
// SEO Configuration
// ============================================================================

export const seoConfig = {
  defaultTitle: 'Professional Services',
  defaultDescription: 'Professional services company providing expert solutions',
  defaultImage: '/og-image.jpg',
  twitterHandle: '@company',
  locale: 'en_US',
};

// ============================================================================
// Responsive Breakpoints
// ============================================================================

export const breakpoints = {
  mobile: 640, // < 640px
  tablet: 768, // 640px - 1024px
  desktop: 1024, // > 1024px
};

// ============================================================================
// Animation Configuration
// ============================================================================

export const animationConfig = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
