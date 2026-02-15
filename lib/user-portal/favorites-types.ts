/**
 * Favorites and Browse History Types
 * Defines data models for user favorites and browse history
 */

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  category: string;
  description: string;
}

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  addedAt: Date;
}

export interface BrowseHistoryItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  viewedAt: Date;
  viewCount: number;
}

export interface FavoritesCollection {
  id: string;
  userId: string;
  favorites: Favorite[];
  totalCount: number;
  updatedAt: Date;
}

export interface BrowseHistory {
  id: string;
  userId: string;
  items: BrowseHistoryItem[];
  totalCount: number;
  updatedAt: Date;
}

export interface RecommendedProduct extends Product {
  score: number;
  reason: 'frequently_viewed' | 'similar_to_favorites' | 'trending' | 'new';
}

export interface Recommendation {
  id: string;
  userId: string;
  products: RecommendedProduct[];
  generatedAt: Date;
}

export interface FavoritesState {
  favorites: Favorite[];
  isLoading: boolean;
  error: string | null;
}

export interface BrowseHistoryState {
  items: BrowseHistoryItem[];
  isLoading: boolean;
  error: string | null;
}

export interface RecommendationState {
  products: RecommendedProduct[];
  isLoading: boolean;
  error: string | null;
}
