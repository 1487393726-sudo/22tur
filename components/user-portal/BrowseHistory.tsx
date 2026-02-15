'use client';

import React, { useState } from 'react';
import { BrowseHistoryItem } from '@/lib/user-portal/favorites-types';

interface BrowseHistoryProps {
  items: BrowseHistoryItem[];
  onViewProduct: (productId: string) => void;
  onClearHistory: () => void;
  onAddToFavorites: (productId: string) => void;
}

export const BrowseHistory: React.FC<BrowseHistoryProps> = ({
  items,
  onViewProduct,
  onClearHistory,
  onAddToFavorites,
}) => {
  const [sortBy, setSortBy] = useState<'recent' | 'most_viewed'>('recent');

  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime();
      case 'most_viewed':
        return b.viewCount - a.viewCount;
      default:
        return 0;
    }
  });

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">暂无浏览历史</p>
        <p className="text-gray-400 text-sm mt-2">浏览商品后会显示在这里</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">浏览历史 ({items.length})</h2>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="recent">最近浏览</option>
            <option value="most_viewed">浏览最多</option>
          </select>
          <button
            onClick={onClearHistory}
            className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 text-sm"
          >
            清空历史
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedItems.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-full h-48 object-cover cursor-pointer hover:opacity-90"
                onClick={() => onViewProduct(item.product.id)}
              />
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                浏览 {item.viewCount} 次
              </div>
            </div>

            <div className="p-4">
              <h3
                className="font-semibold text-sm mb-2 cursor-pointer hover:text-teal-600"
                onClick={() => onViewProduct(item.product.id)}
              >
                {item.product.name}
              </h3>

              <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                {item.product.description}
              </p>

              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-teal-600">
                  ¥{item.product.price.toFixed(2)}
                </span>
                <span className="text-sm text-yellow-500">
                  ★ {item.product.rating.toFixed(1)}
                </span>
              </div>

              <div className="text-xs text-gray-400 mb-3">
                最后浏览 {new Date(item.viewedAt).toLocaleDateString('zh-CN')}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onViewProduct(item.product.id)}
                  className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm"
                >
                  查看商品
                </button>
                <button
                  onClick={() => onAddToFavorites(item.product.id)}
                  className="flex-1 border border-teal-600 text-teal-600 py-2 rounded-lg hover:bg-teal-50 transition-colors text-sm"
                >
                  收藏
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
