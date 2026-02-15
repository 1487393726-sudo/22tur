/**
 * Website System Constants
 * Centralized constants for the website system
 */

// ============================================================================
// Brand Colors
// ============================================================================

export const BRAND_COLORS = {
  primary: '#1E3A5F', // Deep blue
  secondary: '#2D5A8C', // Medium blue
  accent: '#FF6B35', // Orange accent
  light: '#F0F5FB',
  dark: '#1F2937',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

// ============================================================================
// Responsive Breakpoints
// ============================================================================

export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const BREAKPOINT_NAMES = {
  mobile: 'mobile', // < 768px
  tablet: 'tablet', // 768px - 1024px
  desktop: 'desktop', // > 1024px
} as const;

// ============================================================================
// Animation Durations
// ============================================================================

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
} as const;

// ============================================================================
// Z-Index Scale
// ============================================================================

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// ============================================================================
// Page Routes
// ============================================================================

export const ROUTES = {
  home: '/',
  services: '/services',
  serviceDetail: (id: string) => `/services/${id}`,
  cases: '/cases',
  caseDetail: (id: string) => `/cases/${id}`,
  about: '/about',
  blog: '/blog',
  blogDetail: (slug: string) => `/blog/${slug}`,
  contact: '/contact',
  consultation: '/consultation',
  privacy: '/privacy',
  terms: '/terms',
  cookies: '/cookies',
  faq: '/faq',
} as const;

// ============================================================================
// Service Categories
// ============================================================================

export const SERVICE_CATEGORIES = [
  { id: 'web', name: 'Web Development', icon: 'globe' },
  { id: 'mobile', name: 'Mobile Apps', icon: 'smartphone' },
  { id: 'design', name: 'UI/UX Design', icon: 'palette' },
  { id: 'consulting', name: 'Consulting', icon: 'briefcase' },
  { id: 'marketing', name: 'Digital Marketing', icon: 'trending-up' },
] as const;

// ============================================================================
// Blog Categories
// ============================================================================

export const BLOG_CATEGORIES = [
  { id: 'technology', name: 'Technology', icon: 'code' },
  { id: 'design', name: 'Design', icon: 'palette' },
  { id: 'business', name: 'Business', icon: 'briefcase' },
  { id: 'tips', name: 'Tips & Tricks', icon: 'lightbulb' },
  { id: 'news', name: 'News', icon: 'newspaper' },
] as const;

// ============================================================================
// Form Validation Rules
// ============================================================================

export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    pattern: /^[\d\s\-\+\(\)]+$/,
    message: 'Please enter a valid phone number',
  },
  url: {
    pattern: /^https?:\/\/.+/,
    message: 'Please enter a valid URL',
  },
  minLength: (length: number) => ({
    pattern: new RegExp(`.{${length},}`),
    message: `Minimum ${length} characters required`,
  }),
  maxLength: (length: number) => ({
    pattern: new RegExp(`.{0,${length}}`),
    message: `Maximum ${length} characters allowed`,
  }),
} as const;

// ============================================================================
// Pagination
// ============================================================================

export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 100,
  defaultPage: 1,
} as const;

// ============================================================================
// Cache Duration (in seconds)
// ============================================================================

export const CACHE_DURATION = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  veryLong: 86400, // 1 day
} as const;

// ============================================================================
// SEO
// ============================================================================

export const SEO = {
  defaultTitle: 'Professional Services',
  defaultDescription: 'Professional services company providing expert solutions',
  defaultImage: '/og-image.jpg',
  twitterHandle: '@company',
  locale: 'en_US',
  maxTitleLength: 60,
  maxDescriptionLength: 160,
} as const;

// ============================================================================
// Accessibility
// ============================================================================

export const ACCESSIBILITY = {
  wcagAAContrastRatio: 4.5,
  wcagAAAContrastRatio: 7,
  focusOutlineWidth: 2,
  focusOutlineColor: '#1E3A5F',
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid phone number',
  invalidUrl: 'Please enter a valid URL',
  minLength: 'This field is too short',
  maxLength: 'This field is too long',
  serverError: 'An error occurred. Please try again later.',
  notFound: 'The requested resource was not found.',
  unauthorized: 'You are not authorized to access this resource.',
  forbidden: 'You do not have permission to access this resource.',
} as const;

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  formSubmitted: 'Your form has been submitted successfully.',
  emailSent: 'Email sent successfully.',
  saved: 'Changes saved successfully.',
  deleted: 'Item deleted successfully.',
  created: 'Item created successfully.',
  updated: 'Item updated successfully.',
} as const;

// ============================================================================
// Social Media
// ============================================================================

export const SOCIAL_MEDIA = {
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    url: 'https://facebook.com',
  },
  twitter: {
    name: 'Twitter',
    icon: 'twitter',
    url: 'https://twitter.com',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'linkedin',
    url: 'https://linkedin.com',
  },
  instagram: {
    name: 'Instagram',
    icon: 'instagram',
    url: 'https://instagram.com',
  },
  wechat: {
    name: 'WeChat',
    icon: 'wechat',
    url: 'https://wechat.com',
  },
} as const;

// ============================================================================
// Image Sizes
// ============================================================================

export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 400 },
  large: { width: 1200, height: 800 },
  hero: { width: 1920, height: 1080 },
} as const;

// ============================================================================
// File Upload
// ============================================================================

export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedDocumentTypes: ['application/pdf', 'application/msword'],
} as const;
