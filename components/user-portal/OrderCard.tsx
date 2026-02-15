'use client';

import React from 'react';
import Link from 'next/link';
import { Order, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/user-portal/order-types';

interface OrderCardProps {
  order: Order;
  onViewDetails?: (orderId: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onViewDetails }) => {
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(order.id);
    }
  };

  const firstItem = order.items[0];
  const itemCount = order.items.length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">订单号</p>
          <p className="font-semibold text-slate-900 dark:text-white">{order.orderNumber}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Items Preview */}
      <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          {firstItem?.image && (
            <img
              src={firstItem.image}
              alt={firstItem.productName}
              className="w-12 h-12 rounded object-cover"
            />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {firstItem?.productName}
            </p>
            {itemCount > 1 && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                及其他 {itemCount - 1} 件商品
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Price and Date */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400">订单金额</p>
          <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
            ¥{order.finalPrice.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {new Date(order.createdAt).toLocaleDateString('zh-CN')}
          </p>
          {order.estimatedDelivery && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              预计 {new Date(order.estimatedDelivery).toLocaleDateString('zh-CN')} 送达
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleViewDetails}
          className="flex-1 px-3 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors text-sm font-medium"
        >
          查看详情
        </button>
        {order.status === 'pending_payment' && (
          <button className="flex-1 px-3 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors text-sm font-medium">
            立即支付
          </button>
        )}
      </div>
    </div>
  );
};
