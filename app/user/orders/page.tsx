'use client';

import React, { useState } from 'react';
import { UserPortalLayout } from '@/components/user-portal/UserPortalLayout';
import { OrderList } from '@/components/user-portal/OrderList';
import { OrderDetail } from '@/components/user-portal/OrderDetail';
import { OrderTracking } from '@/components/user-portal/OrderTracking';
import { Order, OrderTrackingEvent } from '@/lib/user-portal/order-types';

// Mock data for demonstration
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    status: 'delivered',
    items: [
      {
        id: '1',
        productId: 'prod-1',
        productName: '无线蓝牙耳机',
        quantity: 1,
        price: 299.99,
        image: 'https://via.placeholder.com/100',
      },
    ],
    totalPrice: 299.99,
    discount: 30,
    finalPrice: 269.99,
    shippingAddress: {
      id: 'addr-1',
      type: 'home',
      recipient: '张三',
      phone: '13800138000',
      province: '北京市',
      city: '朝阳区',
      district: '建国路',
      detail: '1号楼2单元301室',
      isDefault: true,
    },
    paymentMethod: {
      id: 'pay-1',
      type: 'alipay',
      name: '支付宝',
      lastFour: '1234',
      isDefault: true,
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-18'),
    estimatedDelivery: new Date('2024-01-20'),
    trackingNumber: 'SF123456789',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    status: 'pending_payment',
    items: [
      {
        id: '2',
        productId: 'prod-2',
        productName: '机械键盘',
        quantity: 1,
        price: 599.99,
        image: 'https://via.placeholder.com/100',
      },
      {
        id: '3',
        productId: 'prod-3',
        productName: '鼠标垫',
        quantity: 2,
        price: 49.99,
        image: 'https://via.placeholder.com/100',
      },
    ],
    totalPrice: 699.97,
    discount: 0,
    finalPrice: 699.97,
    shippingAddress: {
      id: 'addr-1',
      type: 'home',
      recipient: '张三',
      phone: '13800138000',
      province: '北京市',
      city: '朝阳区',
      district: '建国路',
      detail: '1号楼2单元301室',
      isDefault: true,
    },
    paymentMethod: {
      id: 'pay-1',
      type: 'card',
      name: '招商银行',
      lastFour: '5678',
      isDefault: false,
    },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    status: 'shipped',
    items: [
      {
        id: '4',
        productId: 'prod-4',
        productName: '显示器支架',
        quantity: 1,
        price: 199.99,
        image: 'https://via.placeholder.com/100',
      },
    ],
    totalPrice: 199.99,
    discount: 20,
    finalPrice: 179.99,
    shippingAddress: {
      id: 'addr-1',
      type: 'home',
      recipient: '张三',
      phone: '13800138000',
      province: '北京市',
      city: '朝阳区',
      district: '建国路',
      detail: '1号楼2单元301室',
      isDefault: true,
    },
    paymentMethod: {
      id: 'pay-1',
      type: 'wechat',
      name: '微信支付',
      lastFour: '9012',
      isDefault: false,
    },
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-19'),
    estimatedDelivery: new Date('2024-01-22'),
    trackingNumber: 'YTO987654321',
  },
];

const MOCK_TRACKING_EVENTS: OrderTrackingEvent[] = [
  {
    id: '1',
    timestamp: new Date('2024-01-18 14:30'),
    status: 'shipped',
    description: '您的订单已发货',
    location: '北京分拣中心',
  },
  {
    id: '2',
    timestamp: new Date('2024-01-19 08:15'),
    status: 'shipped',
    description: '订单已到达中转站',
    location: '天津中转站',
  },
  {
    id: '3',
    timestamp: new Date('2024-01-19 20:45'),
    status: 'shipped',
    description: '订单已出库，准备送达',
    location: '朝阳区配送站',
  },
];

export default function OrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showTracking, setShowTracking] = useState(false);

  const selectedOrder = selectedOrderId
    ? MOCK_ORDERS.find((order) => order.id === selectedOrderId)
    : null;

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowTracking(false);
  };

  const handleCancel = (orderId: string) => {
    alert(`取消订单 ${orderId}`);
  };

  const handleReturn = (orderId: string) => {
    alert(`申请退货 ${orderId}`);
  };

  const handleConfirmDelivery = (orderId: string) => {
    alert(`确认收货 ${orderId}`);
  };

  return (
    <UserPortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">订单管理</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">查看和管理您的订单</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <OrderList orders={MOCK_ORDERS} onViewDetails={handleViewDetails} />
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            {selectedOrder ? (
              <>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                  <h2 className="font-semibold text-slate-900 dark:text-white mb-4">订单详情</h2>
                  <OrderDetail
                    order={selectedOrder}
                    onCancel={handleCancel}
                    onReturn={handleReturn}
                    onConfirmDelivery={handleConfirmDelivery}
                  />
                </div>

                {/* Tracking Toggle */}
                {selectedOrder.status !== 'pending_payment' && (
                  <button
                    onClick={() => setShowTracking(!showTracking)}
                    className="w-full px-4 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors font-medium"
                  >
                    {showTracking ? '隐藏追踪' : '查看追踪'}
                  </button>
                )}

                {/* Tracking */}
                {showTracking && (
                  <OrderTracking events={MOCK_TRACKING_EVENTS} />
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center">
                <p className="text-slate-600 dark:text-slate-400">选择一个订单查看详情</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserPortalLayout>
  );
}
