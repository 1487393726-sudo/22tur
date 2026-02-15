/**
 * Website System Type Definitions (Extended)
 * Additional types for website system implementation
 */

export interface PageMetadata {
  title: string;
  description: string;
  keywords: string[];
  image?: string;
  url?: string;
  canonical?: string;
}

export interface PageProps {
  params?: Record<string, string | string[]>;
  searchParams?: Record<string, string | string[]>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
