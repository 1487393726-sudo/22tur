/**
 * Website System Type Definitions
 * Core interfaces and models for the website system
 */

// ============================================================================
// Common Types
// ============================================================================

export interface Button {
  text: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  href?: string;
}

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'wechat';
  url: string;
  icon: string;
  label: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  ogUrl: string;
  canonicalUrl?: string;
  structuredData?: Record<string, unknown>;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
}

// ============================================================================
// Hero Banner Types
// ============================================================================

export interface HeroBanner {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  ctaButton: Button;
  ctaButtonSecondary?: Button;
}

// ============================================================================
// Service Types
// ============================================================================

export interface ServiceCard {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  link: string;
}

export interface Service extends ServiceCard {
  shortDescription: string;
  price: number;
  rating: number;
  reviewCount: number;
}

export interface ServiceDetail extends Service {
  fullDescription: string;
  process: ProcessStep[];
  deliverables: string[];
  timeline: string;
  includes: string[];
  excludes: string[];
  faqs: FAQ[];
}

export interface ProcessStep {
  order: number;
  title: string;
  description: string;
  duration: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ServiceFilter {
  category?: string;
  priceRange?: [number, number];
  sortBy?: 'popularity' | 'price' | 'newest' | 'rating';
}

// ============================================================================
// Case Types
// ============================================================================

export interface Case {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  industry: string;
  results: string[];
  link: string;
}

export interface CaseDetail extends Case {
  images: string[];
  client: string;
  challenge: string;
  solution: string;
  technologies: string[];
}

// ============================================================================
// Team Types
// ============================================================================

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  avatar: string;
  bio: string;
  socialLinks?: SocialLink[];
}

// ============================================================================
// Testimonial Types
// ============================================================================

export interface Testimonial {
  id: string;
  content: string;
  author: string;
  company: string;
  rating: number;
  avatar: string;
  videoUrl?: string;
}

// ============================================================================
// Blog Types
// ============================================================================

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: Date;
  updateDate?: Date;
  category: string;
  tags: string[];
  thumbnail: string;
  readingTime: number;
  commentCount: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  description: string;
}

export interface BlogFilter {
  category?: string;
  tags?: string[];
  sortBy?: 'newest' | 'oldest' | 'popular';
}

export interface Comment {
  id: string;
  author: string;
  email: string;
  content: string;
  publishDate: Date;
  likes: number;
  replies: Comment[];
  isApproved: boolean;
}

// ============================================================================
// Form Types
// ============================================================================

export interface ConsultationForm {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  message: string;
  preferredTime?: Date;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface CommentForm {
  authorName: string;
  authorEmail: string;
  content: string;
}

// ============================================================================
// Contact Types
// ============================================================================

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  businessHours: BusinessHours[];
}

export interface BusinessHours {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface MapLocation {
  latitude: number;
  longitude: number;
  address: string;
  businessHours: BusinessHours[];
}

// ============================================================================
// About Page Types
// ============================================================================

export interface CompanyInfo {
  name: string;
  mission: string;
  vision: string;
  values: string[];
  description: string;
  foundedYear: number;
}

export interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  icon?: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  image: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  metric: string;
  icon: string;
}

// ============================================================================
// Page Types
// ============================================================================

export interface HomePage {
  heroBanner: HeroBanner;
  serviceCards: ServiceCard[];
  caseShowcase: Case[];
  teamSection: TeamMember[];
  testimonialSection: Testimonial[];
  ctaSection: Button;
}

export interface ServicesPage {
  services: Service[];
  categories: ServiceCategory[];
  filters: ServiceFilter;
  searchQuery?: string;
}

export interface BlogPage {
  articles: Article[];
  categories: BlogCategory[];
  filters: BlogFilter;
  searchQuery?: string;
}

export interface AboutPage {
  companyInfo: CompanyInfo;
  timeline: TimelineEvent[];
  certificates: Certificate[];
  achievements: Achievement[];
}

export interface ContactPage {
  contactForm: ContactForm;
  mapLocation: MapLocation;
  contactInfo: ContactInfo;
  socialLinks: SocialLink[];
}

// ============================================================================
// Footer Types
// ============================================================================

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface Footer {
  companyInfo: {
    name: string;
    description: string;
    logo?: string;
  };
  sections: FooterSection[];
  contactInfo: ContactInfo;
  socialLinks: SocialLink[];
  legalLinks: FooterLink[];
  newsletter?: {
    title: string;
    description: string;
    placeholder: string;
  };
  copyright: string;
}

// ============================================================================
// Website Configuration Types
// ============================================================================

export interface WebsiteConfig {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  brandColor: string;
  socialLinks: SocialLink[];
  contactInfo: ContactInfo;
  businessHours: BusinessHours[];
  analyticsId?: string;
  sitemapUrl: string;
}

export interface ThemeData {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}
