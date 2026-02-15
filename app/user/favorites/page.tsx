'use client';

import React, { useState } from 'react';
import { FavoritesList } from '@/components/user-portal/FavoritesList';
import { BrowseHistory } from '@/components/user-portal/BrowseHistory';
import { RecommendationSection } from '@/components/user-portal/RecommendationSection';
import {
  Favorite,
  BrowseHistoryItem,
  RecommendedProduct,
} from '@/lib/user-portal/favorites-types';

type TabType = 'favorites' | 'history' | 'recommendations';

// Mock data
const mockFavorites: Favorite[] = [
  {
    id: 'fav-1',
    userId: 'user-1',
    productId: 'prod-1',
    product: {
      id: 'prod-1',
      name: '高端无线耳机',
      image: 'https://via.placeholder.com/300x200?text=Wireless+Earbuds',
      price: 599,
      rating: 4.8,
      category: '电子产品',
      description: '降噪功能强大，续航时间长',
    },
    addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'fav-2',
    userId: 'user-1',
    productId: 'prod-2',
    product: {
      id: 'prod-2',
      name: '智能手表',
      image: 'https://via.placeholder.com/300x200?text=Smart+Watch',
      price: 1299,
      rating: 4.6,
      category: '电子产品',
      description: '健康监测，运动追踪',
    },
    addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'fav-3',
    userId: 'user-1',
    productId: 'prod-3',
    product: {
      id: 'prod-3',
      name: '便携式充电宝',
      image: 'https://via.placeholder.com/300x200?text=Power+Bank',
      price: 199,
      rating: 4.5,
      category: '配件',
      description: '大容量，快速充电',
    },
    addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

const mockBrowseHistory: BrowseHistoryItem[] = [
  {
    id: 'hist-1',
    userId: 'user-1',
    productId: 'prod-4',
    product: {
      id: 'prod-4',
      name: '蓝牙音箱',
      image: 'https://via.placeholder.com/300x200?text=Bluetooth+Speaker',
      price: 399,
      rating: 4.7,
      category: '音频',
      description: '360度环绕音效',
    },
    viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    viewCount: 3,
  },
  {
    id: 'hist-2',
    userId: 'user-1',
    productId: 'prod-5',
    product: {
      id: 'prod-5',
      name: '机械键盘',
      image: 'https://via.placeholder.com/300x200?text=Mechanical+Keyboard',
      price: 799,
      rating: 4.9,
      category: '配件',
      description: '青轴，RGB背光',
    },
    viewedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    viewCount: 2,
  },
  {
    id: 'hist-3',
    userId: 'user-1',
    productId: 'prod-6',
    product: {
      id: 'prod-6',
      name: '无线鼠标',
      image: 'https://via.placeholder.com/300x200?text=Wireless+Mouse',
      price: 299,
      rating: 4.4,
      category: '配件',
      description: '精准定位，长续航',
    },
    viewedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    viewCount: 1,
  },
];

const mockRecommendations: RecommendedProduct[] = [
  {
    id: 'prod-7',
    name: '显示器支架',
    image: 'https://via.placeholder.com/300x200?text=Monitor+Stand',
    price: 299,
    rating: 4.6,
    category: '配件',
    description: '可调节高度',
    score: 0.92,
    reason: 'similar_to_favorites',
  },
  {
    id: 'prod-8',
    name: '机械键盘垫',
    image: 'https://via.placeholder.com/300x200?text=Keyboard+Pad',
    price: 99,
    rating: 4.5,
    category: '配件',
    description: '防滑设计',
    score: 0.88,
    reason: 'frequently_viewed',
  },
  {
    id: 'prod-9',
    name: '无线充电板',
    image: 'https://via.placeholder.com/300x200?text=Wireless+Charger',
    price: 199,
    rating: 4.7,
    category: '配件',
    description: '快速充电',
    score: 0.85,
    reason: 'trending',
  },
  {
    id: 'prod-10',
    name: '降噪耳塞',
    image: 'https://via.placeholder.com/300x200?text=Noise+Cancelling+Earbuds',
    price: 899,
    rating: 4.8,
    category: '电子产品',
    description: '主动降噪',
    score: 0.82,
    reason: 'new',
  },
];

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('favorites');
  const [favorites, setFavorites] = useState<Favorite[]>(mockFavorites);
  const [browseHistory, setBrowseHistory] = useState<BrowseHistoryItem[]>(mockBrowseHistory);

  const handleRemoveFavorite = (favoriteId: string) => {
    setFavorites(favorites.filter((f) => f.id !== favoriteId));
  };

  const handleClearHistory = () => {
    if (confirm('确定要清空浏览历史吗？')) {
      setBrowseHistory([]);
    }
  };

  const handleViewProduct = (productId: string) => {
    console.log('View product:', productId);
    // In a real app, navigate to product detail page
  };

  const handleAddToFavorites = (productId: string) => {
    console.log('Add to favorites:', productId);
    // In a real app, add to favorites
  };

  const handleAddToCart = (productId: string) => {
    console.log('Add to cart:', productId);
    // In a real app, add to cart
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">我的收藏和浏览</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'favorites'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            我的收藏 ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            浏览历史 ({browseHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'recommendations'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            为你推荐
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg p-6">
          {activeTab === 'favorites' && (
            <FavoritesList
              favorites={favorites}
              onRemoveFavorite={handleRemoveFavorite}
              onViewProduct={handleViewProduct}
            />
          )}

          {activeTab === 'history' && (
            <BrowseHistory
              items={browseHistory}
              onViewProduct={handleViewProduct}
              onClearHistory={handleClearHistory}
              onAddToFavorites={handleAddToFavorites}
            />
          )}

          {activeTab === 'recommendations' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">基于你的浏览和收藏</h2>
              <RecommendationSection
                products={mockRecommendations}
                onViewProduct={handleViewProduct}
                onAddToFavorites={handleAddToFavorites}
                onAddToCart={handleAddToCart}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
