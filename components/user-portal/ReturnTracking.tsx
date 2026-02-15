'use client';

import React from 'react';
import { ReturnRequest, ReturnTrackingEvent } from '@/lib/user-portal/aftersales-types';

interface ReturnTrackingProps {
  returnRequest: ReturnRequest;
  trackingEvents: ReturnTrackingEvent[];
}

const STATUS_LABELS: Record<string, string> = {
  pending_approval: '待审核',
  approved: '已批准',
  rejected: '已拒绝',
  in_transit: '退货中',
  received: '已收货',
  refunded: '已退款',
  cancelled: '已取消',
};

const STATUS_COLORS: Record<string, string> = {
  pending_approval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  in_transit: 'bg-purple-100 text-white dark:bg-purple-900 dark:text-white',
  received: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  refunded: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export function ReturnTracking({ returnRequest, trackingEvents }: ReturnTrackingProps) {
  const sortedEvents = [...trackingEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          退货追踪
        </h3>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">订单号</p>
            <p className="font-medium text-gray-900 dark:text-white">{returnRequest.orderNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">商品</p>
            <p className="font-medium text-gray-900 dark:text-white">{returnRequest.itemName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">退款金额</p>
            <p className="font-medium text-teal-600">¥{returnRequest.refundAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">当前状态：</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              STATUS_COLORS[returnRequest.status]
            }`}
          >
            {STATUS_LABELS[returnRequest.status]}
          </span>
        </div>
      </div>

      {returnRequest.trackingNumber && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">物流单号</p>
          <p className="font-mono text-gray-900 dark:text-white">{returnRequest.trackingNumber}</p>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white">处理进度</h4>

        {sortedEvents.length > 0 ? (
          <div className="relative">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-teal-600 rounded-full mt-2"></div>
                  {index < sortedEvents.length - 1 && (
                    <div className="w-0.5 h-12 bg-gray-300 dark:bg-slate-600 my-1"></div>
                  )}
                </div>
                <div className="pb-4">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {STATUS_LABELS[event.status]}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(event.timestamp).toLocaleString('zh-CN')}
                  </p>
                  {event.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {event.description}
                    </p>
                  )}
                  {event.location && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      📍 {event.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-sm">暂无处理记录</p>
        )}
      </div>
    </div>
  );
}
