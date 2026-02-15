'use client';

import React from 'react';
import { RecommendedProduct } from '@/lib/user-portal/favorites-types';

interface RecommendationSectionProps {
  products: RecommendedProduct[];
  onViewProduct: (productId: string) => void;
  onAddToFavorites: (productId: string) => void;
  onAddToCart: (productId: string) => void;
}

const reasonLabels: Record<string, string> = {
  frequently_viewed: '热门浏览',
  similar_to_favorites: '与收藏相似',
  trending: '热销商品',
  new: '新品上市',
};

const reasonColors: Record<string, string> = {
  frequently_viewed: 'bg-blue-100 text-blue-800',
  similar_to_favorites: 'bg-purple-100 text-white',
  trending: 'bg-red-100 text-red-800',
  new: 'bg-green-100 text-green-800',
};

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  products,
  onViewProduct,
  onAddToFavorites,
  onAddToCart,
}) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <h2 className="text-xl font-semibold mb-6">为你推荐</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover cursor-pointer hover:opacity-90"
                onClick={() => onViewProduct(product.id)}
              />
              <div
                className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                  reasonColors[product.reason]
                }`}
              >
                {reasonLabels[product.reason]}
              </div>
            </div>

            <div className="p-3">
              <h3
                className="font-semibold text-sm mb-2 cursor-pointer hover:text-teal-600 line-clamp-2"
                onClick={() => onViewProduct(product.id)}
              >
                {product.name}
              </h3>

              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-teal-600">
                  ¥{product.price.toFixed(2)}
                </span>
                <span className="text-sm text-yellow-500">
                  ★ {product.rating.toFixed(1)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onAddToCart(product.id)}
                  className="flex-1 bg-teal-600 text-white py-2 rounded text-xs hover:bg-teal-700 transition-colors"
                >
                  加入购物车
                </button>
                <button
                  onClick={() => onAddToFavorites(product.id)}
                  className="px-3 py-2 border border-teal-600 text-teal-600 rounded text-xs hover:bg-teal-50 transition-colors"
                  title="收藏"
                >
                  ♡
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
