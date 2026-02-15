'use client';

import React, { useState } from 'react';
import { PendingReviewsList } from '@/components/user-portal/PendingReviewsList';
import { ReviewForm } from '@/components/user-portal/ReviewForm';
import { ReviewManagement } from '@/components/user-portal/ReviewManagement';
import { FeedbackForm } from '@/components/user-portal/FeedbackForm';
import { FeedbackHistory } from '@/components/user-portal/FeedbackHistory';
import { Review, PendingReview, Feedback } from '@/lib/user-portal/reviews-types';

type TabType = 'pending' | 'write-review' | 'my-reviews' | 'feedback' | 'feedback-history';

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);

  // Mock data
  const mockPendingReviews: PendingReview[] = [
    {
      id: '1',
      orderId: 'ORD001',
      orderNumber: 'ORD-2024-001',
      productId: 'PROD001',
      productName: '蓝牙耳机',
      productImage: 'https://via.placeholder.com/100',
      purchaseDate: new Date('2024-01-15'),
      daysUntilExpiry: 15,
    },
    {
      id: '2',
      orderId: 'ORD002',
      orderNumber: 'ORD-2024-002',
      productId: 'PROD002',
      productName: '无线充电器',
      productImage: 'https://via.placeholder.com/100',
      purchaseDate: new Date('2024-01-18'),
      daysUntilExpiry: 12,
    },
  ];

  const mockReviews: Review[] = [
    {
      id: '1',
      orderId: 'ORD001',
      orderNumber: 'ORD-2024-001',
      productId: 'PROD001',
      productName: '蓝牙耳机',
      productImage: 'https://via.placeholder.com/100',
      rating: 5,
      title: '非常好用的耳机',
      content: '音质清晰，佩戴舒适，续航能力强，非常满意这次购买。',
      images: [],
      videos: [],
      helpful: 12,
      unhelpful: 1,
      status: 'published',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      publishedAt: new Date('2024-01-20'),
    },
  ];

  const mockFeedbacks: Feedback[] = [
    {
      id: '1',
      userId: 'USER001',
      category: 'website',
      title: '网站加载速度慢',
      content: '最近网站加载速度比较慢，希望能够优化一下。',
      attachments: [],
      status: 'acknowledged',
      priority: 'medium',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16'),
      response: '感谢您的反馈，我们已经收到您的建议，正在进行优化。',
    },
  ];

  const handleReviewSubmit = (review: Partial<Review>) => {
    console.log('Review submitted:', review);
    setActiveTab('my-reviews');
  };

  const handleFeedbackSubmit = (feedback: Partial<Feedback>) => {
    console.log('Feedback submitted:', feedback);
    setActiveTab('feedback-history');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">评价和反馈</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'pending'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            待评价
          </button>
          <button
            onClick={() => setActiveTab('write-review')}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'write-review'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            写评价
          </button>
          <button
            onClick={() => setActiveTab('my-reviews')}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'my-reviews'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            我的评价
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'feedback'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            提交反馈
          </button>
          <button
            onClick={() => setActiveTab('feedback-history')}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'feedback-history'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            反馈历史
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'pending' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                待评价的订单
              </h2>
              <PendingReviewsList
                reviews={mockPendingReviews}
                onReviewClick={(review) => {
                  setSelectedReview(review);
                  setActiveTab('write-review');
                }}
              />
            </div>
          )}

          {activeTab === 'write-review' && selectedReview && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                评价商品
              </h2>
              <ReviewForm
                productId={selectedReview.productId}
                productName={selectedReview.productName}
                orderId={selectedReview.orderId}
                onSubmit={handleReviewSubmit}
              />
            </div>
          )}

          {activeTab === 'write-review' && !selectedReview && (
            <div className="bg-white dark:bg-slate-900 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                请先从待评价订单中选择一个商品
              </p>
            </div>
          )}

          {activeTab === 'my-reviews' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                我的评价
              </h2>
              <ReviewManagement
                reviews={mockReviews}
                onEditReview={(review) => console.log('Edit review:', review)}
                onDeleteReview={(reviewId) => console.log('Delete review:', reviewId)}
              />
            </div>
          )}

          {activeTab === 'feedback' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                提交反馈
              </h2>
              <FeedbackForm onSubmit={handleFeedbackSubmit} />
            </div>
          )}

          {activeTab === 'feedback-history' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                反馈历史
              </h2>
              <FeedbackHistory
                feedbacks={mockFeedbacks}
                onSelectFeedback={(feedback) => console.log('Select feedback:', feedback)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
