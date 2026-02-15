// Reviews and Feedback Types

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export type FeedbackCategory = 'product' | 'service' | 'website' | 'other';

export interface Review {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: ReviewRating;
  title: string;
  content: string;
  images: string[];
  videos: string[];
  helpful: number;
  unhelpful: number;
  status: 'pending' | 'published' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface PendingReview {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  productImage: string;
  purchaseDate: Date;
  daysUntilExpiry: number;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key in ReviewRating]: number;
  };
  helpfulCount: number;
}

export interface Feedback {
  id: string;
  userId: string;
  category: FeedbackCategory;
  title: string;
  content: string;
  attachments: string[];
  status: 'submitted' | 'acknowledged' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  response?: string;
}

export interface FeedbackCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ReviewFilter {
  rating?: ReviewRating;
  sortBy?: 'newest' | 'oldest' | 'helpful' | 'rating';
  status?: 'all' | 'published' | 'pending';
}
