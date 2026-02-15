'use client';

import React, { useState } from 'react';
import { Favorite, Product } from '@/lib/user-portal/favorites-types';

interface FavoritesListProps {
  favorites: Favorite[];
  onRemoveFavorite: (favoriteId: string) => void;
  onViewProduct: (productId: string) => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  favorites,
  onRemoveFavorite,
  onViewProduct,
}) => {
  const [sortBy, setSortBy] = useState<'recent' | 'price_low' | 'price_high' | 'rating'>('recent');

  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case 'price_low':
        return a.product.price - b.product.price;
      case 'price_high':
        return b.product.price - a.product.price;
      case 'rating':
        return b.product.rating - a.product.rating;
      default:
        return 0;
    }
  });

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">暂无收藏商品</p>
        <p className="text-gray-400 text-sm mt-2">收藏喜欢的商品，方便下次购买</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">我的收藏 ({favorites.length})</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="recent">最新收藏</option>
          <option value="price_low">价格低到高</option>
          <option value="price_high">价格高到低</option>
          <option value="rating">评分最高</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedFavorites.map((favorite) => (
          <div
            key={favorite.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <img
                src={favorite.product.image}
                alt={favorite.product.name}
                className="w-full h-48 object-cover cursor-pointer hover:opacity-90"
                onClick={() => onViewProduct(favorite.product.id)}
              />
              <button
                onClick={() => onRemoveFavorite(favorite.id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                title="移除收藏"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <h3
                className="font-semibold text-sm mb-2 cursor-pointer hover:text-teal-600"
                onClick={() => onViewProduct(favorite.product.id)}
              >
                {favorite.product.name}
              </h3>

              <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                {favorite.product.description}
              </p>

              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-teal-600">
                  ¥{favorite.product.price.toFixed(2)}
                </span>
                <span className="text-sm text-yellow-500">
                  ★ {favorite.product.rating.toFixed(1)}
                </span>
              </div>

              <div className="text-xs text-gray-400 mb-3">
                收藏于 {new Date(favorite.addedAt).toLocaleDateString('zh-CN')}
              </div>

              <button
                onClick={() => onViewProduct(favorite.product.id)}
                className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm"
              >
                查看商品
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
