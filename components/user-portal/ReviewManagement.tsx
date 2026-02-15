'use client';

import React, { useState } from 'react';
import { Review, ReviewFilter } from '@/lib/user-portal/reviews-types';

interface ReviewManagementProps {
  reviews: Review[];
  onEditReview?: (review: Review) => void;
  onDeleteReview?: (reviewId: string) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: '很差',
  2: '差',
  3: '一般',
  4: '好',
  5: '很好',
};

const STATUS_LABELS: Record<string, string> = {
  pending: '待审核',
  published: '已发布',
  rejected: '已拒绝',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function ReviewManagement({
  reviews,
  onEditReview,
  onDeleteReview,
}: ReviewManagementProps) {
  const [filter, setFilter] = useState<ReviewFilter>({ status: 'all' });

  const filteredReviews = reviews.filter((review) => {
    if (filter.status && filter.status !== 'all' && review.status !== filter.status) {
      return false;
    }
    if (filter.rating && review.rating !== filter.rating) {
      return false;
    }
    return true;
  });

  if (reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">暂无评价</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter({ ...filter, status: 'all' })}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter.status === 'all'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilter({ ...filter, status: 'published' })}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter.status === 'published'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          已发布
        </button>
        <button
          onClick={() => setFilter({ ...filter, status: 'pending' })}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter.status === 'pending'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          待审核
        </button>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">没有符合条件的评价</p>
        </div>
      ) : (
        filteredReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{review.productName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  订单号: {review.orderNumber}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  STATUS_COLORS[review.status]
                }`}
              >
                {STATUS_LABELS[review.status]}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {RATING_LABELS[review.rating]}
              </span>
            </div>

            <p className="font-medium text-gray-900 dark:text-white mb-2">{review.title}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
              {review.content}
            </p>

            {review.images.length > 0 && (
              <div className="flex gap-2 mb-3">
                {review.images.slice(0, 3).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`评价图片 ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ))}
                {review.images.length > 3 && (
                  <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                    +{review.images.length - 3}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
              <span>
                有用: {review.helpful} | 无用: {review.unhelpful}
              </span>
              <span>{new Date(review.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>

            {review.status === 'published' && (
              <div className="flex gap-2">
                <button
                  onClick={() => onEditReview?.(review)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                >
                  编辑
                </button>
                <button
                  onClick={() => onDeleteReview?.(review.id)}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition"
                >
                  删除
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
