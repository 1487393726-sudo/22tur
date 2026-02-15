'use client';

import React from 'react';
import { PendingReview } from '@/lib/user-portal/reviews-types';

interface PendingReviewsListProps {
  reviews: PendingReview[];
  onReviewClick?: (review: PendingReview) => void;
}

export function PendingReviewsList({ reviews, onReviewClick }: PendingReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">暂无待评价的订单</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          onClick={() => onReviewClick?.(review)}
          className="bg-white dark:bg-slate-900 rounded-lg p-4 hover:shadow-md transition cursor-pointer border border-gray-200 dark:border-slate-700"
        >
          <div className="flex gap-4">
            <img
              src={review.productImage}
              alt={review.productName}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{review.productName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                订单号: {review.orderNumber}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                购买于: {new Date(review.purchaseDate).toLocaleDateString('zh-CN')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {review.daysUntilExpiry > 0
                    ? `还有 ${review.daysUntilExpiry} 天可评价`
                    : '评价已过期'}
                </span>
                <button className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg transition">
                  立即评价
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
