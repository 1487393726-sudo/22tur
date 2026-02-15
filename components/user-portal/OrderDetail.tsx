'use client';

import React from 'react';
import { Order, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/user-portal/order-types';

interface OrderDetailProps {
  order: Order;
  onCancel?: (orderId: string) => void;
  onReturn?: (orderId: string) => void;
  onConfirmDelivery?: (orderId: string) => void;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({
  order,
  onCancel,
  onReturn,
  onConfirmDelivery,
}) => {
  const canCancel = order.status === 'pending_payment' || order.status === 'pending_shipment';
  const canReturn = order.status === 'delivered' || order.status === 'completed';
  const canConfirm = order.status === 'delivered';

  return (
    <div className="space-y-4">
      {/* Order Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">订单号</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{order.orderNumber}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-600 dark:text-slate-400">订单时间</p>
            <p className="font-medium text-slate-900 dark:text-white">
              {new Date(order.createdAt).toLocaleString('zh-CN')}
            </p>
          </div>
          {order.estimatedDelivery && (
            <div>
              <p className="text-slate-600 dark:text-slate-400">预计送达</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {new Date(order.estimatedDelivery).toLocaleDateString('zh-CN')}
              </p>
            </div>
          )}
          {order.trackingNumber && (
            <div>
              <p className="text-slate-600 dark:text-slate-400">追踪号</p>
              <p className="font-medium text-slate-900 dark:text-white">{order.trackingNumber}</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">订单商品</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3 pb-3 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-16 h-16 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">{item.productName}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  数量: {item.quantity} × ¥{item.price.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900 dark:text-white">
                  ¥{(item.quantity * item.price).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">收货地址</h3>
        <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-medium">{order.shippingAddress.recipient}</p>
          <p>{order.shippingAddress.phone}</p>
          <p>
            {order.shippingAddress.province} {order.shippingAddress.city}{' '}
            {order.shippingAddress.district}
          </p>
          <p>{order.shippingAddress.detail}</p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">支付方式</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {order.paymentMethod.name} (****{order.paymentMethod.lastFour})
        </p>
      </div>

      {/* Price Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>商品总价</span>
            <span>¥{order.totalPrice.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>优惠</span>
              <span className="text-teal-600 dark:text-teal-400">-¥{order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
            <span>应付金额</span>
            <span className="text-lg text-teal-600 dark:text-teal-400">¥{order.finalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {canCancel && onCancel && (
          <button
            onClick={() => onCancel(order.id)}
            className="flex-1 px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
          >
            取消订单
          </button>
        )}
        {canReturn && onReturn && (
          <button
            onClick={() => onReturn(order.id)}
            className="flex-1 px-4 py-2 border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors font-medium"
          >
            申请退货
          </button>
        )}
        {canConfirm && onConfirmDelivery && (
          <button
            onClick={() => onConfirmDelivery(order.id)}
            className="flex-1 px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors font-medium"
          >
            确认收货
          </button>
        )}
      </div>
    </div>
  );
};
