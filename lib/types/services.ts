/**
 * Core Services Showcase System - Type Definitions
 * Defines all data types for services, cases, packages, and related entities
 */

// Service Category Type
export type ServiceCategory = 'design' | 'development' | 'startup';

// Service Interface
export interface Service {
  id: string;
  category: ServiceCategory;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  features: string[];
  featuresEn: string[];
  priceRange: {
    min: number;
    max: number;
    unit: string;
  };
  deliveryTime: string;
  popular?: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Case Study Interface
export interface CaseStudy {
  id: string;
  category: ServiceCategory;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  coverImage: string;
  images: string[];
  client: string;
  industry: string;
  duration: string;
  technologies: string[];
  results: {
    metric: string;
    value: string;
  }[];
  testimonial?: {
    content: string;
    author: string;
    position: string;
  };
  featured: boolean;
  publishedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Service Package Interface
export interface ServicePackage {
  id: string;
  category: ServiceCategory;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  originalPrice?: number;
  validity: string;
  features: string[];
  featuresEn: string[];
  popular?: boolean;
  limited?: boolean;
  stock?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Milestone Interface
export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: Date;
  completedAt?: Date;
}

// Deliverable Interface
export interface Deliverable {
  id: string;
  name: string;
  type: 'file' | 'link' | 'document';
  url: string;
  uploadedAt: Date;
}

// Communication Interface
export interface Communication {
  id: string;
  type: 'message' | 'update' | 'notification';
  content: string;
  sender: string;
  timestamp: Date;
}

// Client Service Interface
export interface ClientService {
  id: string;
  userId: string;
  packageId: string;
  package: ServicePackage;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  milestones: Milestone[];
  deliverables: Deliverable[];
  communications: Communication[];
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Appointment Interface
export interface Appointment {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  serviceCategory: ServiceCategory;
  topic: string;
  scheduledAt: Date;
  duration: number; // minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// API Response Types
export interface ServiceResponse {
  success: boolean;
  data?: Service | Service[] | CaseStudy | CaseStudy[] | ServicePackage | ServicePackage[] | ClientService | Appointment;
  error?: string;
  message?: string;
}

// Filter Options
export interface ServiceFilterOptions {
  category?: ServiceCategory;
  popular?: boolean;
  limit?: number;
  offset?: number;
}

export interface CaseFilterOptions {
  category?: ServiceCategory;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export interface PackageFilterOptions {
  category?: ServiceCategory;
  popular?: boolean;
  limit?: number;
  offset?: number;
}
