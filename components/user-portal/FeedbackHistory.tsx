'use client';

import React from 'react';
import { Feedback } from '@/lib/user-portal/reviews-types';

interface FeedbackHistoryProps {
  feedbacks: Feedback[];
  onSelectFeedback?: (feedback: Feedback) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  product: '商品问题',
  service: '服务问题',
  website: '网站问题',
  other: '其他',
};

const STATUS_LABELS: Record<string, string> = {
  submitted: '已提交',
  acknowledged: '已确认',
  resolved: '已解决',
  closed: '已关闭',
};

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  acknowledged: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-red-600',
};

export function FeedbackHistory({ feedbacks, onSelectFeedback }: FeedbackHistoryProps) {
  if (feedbacks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">暂无反馈记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback) => (
        <div
          key={feedback.id}
          onClick={() => onSelectFeedback?.(feedback)}
          className="bg-white dark:bg-slate-900 rounded-lg p-4 hover:shadow-md transition cursor-pointer border border-gray-200 dark:border-slate-700"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{feedback.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {CATEGORY_LABELS[feedback.category]}
              </p>
            </div>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  STATUS_COLORS[feedback.status]
                }`}
              >
                {STATUS_LABELS[feedback.status]}
              </span>
              <span className={`text-sm font-medium ${PRIORITY_COLORS[feedback.priority]}`}>
                优先级: {PRIORITY_LABELS[feedback.priority]}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
            {feedback.content}
          </p>

          {feedback.response && (
            <div className="mb-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                客服回复:
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {feedback.response}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>提交于: {new Date(feedback.createdAt).toLocaleDateString('zh-CN')}</span>
            {feedback.resolvedAt && (
              <span>解决于: {new Date(feedback.resolvedAt).toLocaleDateString('zh-CN')}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
