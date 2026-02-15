'use client';

import React, { useState, useMemo } from 'react';
import { Order, OrderFilter, OrderStatus, ORDER_STATUS_LABELS } from '@/lib/user-portal/order-types';
import { OrderCard } from './OrderCard';

interface OrderListProps {
  orders: Order[];
  onViewDetails?: (orderId: string) => void;
  isLoading?: boolean;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onViewDetails, isLoading = false }) => {
  const [filter, setFilter] = useState<OrderFilter>({ status: 'all' });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Filter by status
      if (filter.status && filter.status !== 'all' && order.status !== filter.status) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesOrderNumber = order.orderNumber.toLowerCase().includes(query);
        const matchesProductName = order.items.some((item) =>
          item.productName.toLowerCase().includes(query)
        );
        if (!matchesOrderNumber && !matchesProductName) {
          return false;
        }
      }

      return true;
    });
  }, [orders, filter, searchQuery]);

  const statusOptions: Array<{ value: OrderStatus | 'all'; label: string }> = [
    { value: 'all', label: '全部订单' },
    { value: 'pending_payment', label: ORDER_STATUS_LABELS.pending_payment },
    { value: 'pending_shipment', label: ORDER_STATUS_LABELS.pending_shipment },
    { value: 'shipped', label: ORDER_STATUS_LABELS.shipped },
    { value: 'delivered', label: ORDER_STATUS_LABELS.delivered },
    { value: 'completed', label: ORDER_STATUS_LABELS.completed },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="搜索订单号或商品名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter({ ...filter, status: option.value })}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter.status === option.value
                  ? 'bg-teal-600 dark:bg-teal-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            {orders.length === 0 ? '暂无订单' : '没有找到匹配的订单'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onViewDetails={onViewDetails} />
          ))}
        </div>
      )}

      {/* Results Count */}
      {filteredOrders.length > 0 && (
        <div className="text-sm text-slate-600 dark:text-slate-400 text-center">
          显示 {filteredOrders.length} 个订单
        </div>
      )}
    </div>
  );
};
