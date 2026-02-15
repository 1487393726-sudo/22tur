'use client';

import React from 'react';
import { OrderTrackingEvent } from '@/lib/user-portal/order-types';

interface OrderTrackingProps {
  events: OrderTrackingEvent[];
  isLoading?: boolean;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ events, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400">暂无追踪信息</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">订单追踪</h3>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="flex gap-4">
            {/* Timeline dot and line */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-teal-600 dark:bg-teal-400 ring-2 ring-teal-100 dark:ring-teal-900"></div>
              {index < events.length - 1 && (
                <div className="w-0.5 h-12 bg-slate-200 dark:bg-slate-700 my-2"></div>
              )}
            </div>

            {/* Event content */}
            <div className="pb-4">
              <p className="font-medium text-slate-900 dark:text-white">{event.description}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {new Date(event.timestamp).toLocaleString('zh-CN')}
              </p>
              {event.location && (
                <p className="text-sm text-slate-600 dark:text-slate-400">{event.location}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
