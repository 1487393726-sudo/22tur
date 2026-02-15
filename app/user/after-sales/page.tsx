'use client';

import React, { useState } from 'react';
import { ReturnRequestForm } from '@/components/user-portal/ReturnRequestForm';
import { ReturnTracking } from '@/components/user-portal/ReturnTracking';
import { AfterSalesRecordsList } from '@/components/user-portal/AfterSalesRecordsList';
import { CustomerServiceContact } from '@/components/user-portal/CustomerServiceContact';
import {
  ReturnRequest,
  AfterSalesRecord,
  ReturnTrackingEvent,
  ContactInfo,
} from '@/lib/user-portal/aftersales-types';

type TabType = 'records' | 'new-return' | 'tracking' | 'contact';

export default function AfterSalesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('records');
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

  // Mock data
  const mockRecords: AfterSalesRecord[] = [
    {
      id: '1',
      orderId: 'ORD001',
      orderNumber: 'ORD-2024-001',
      type: 'return',
      status: 'refunded',
      description: '商品有缺陷，已申请退货',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      resolvedAt: new Date('2024-01-20'),
    },
    {
      id: '2',
      orderId: 'ORD002',
      orderNumber: 'ORD-2024-002',
      type: 'exchange',
      status: 'in_transit',
      description: '收到错误的商品，已申请换货',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-19'),
    },
  ];

  const mockReturnRequest: ReturnRequest = {
    id: '1',
    orderId: 'ORD001',
    orderNumber: 'ORD-2024-001',
    itemId: 'ITEM001',
    itemName: '蓝牙耳机',
    quantity: 1,
    reason: 'defective',
    description: '左耳无声音',
    images: [],
    status: 'refunded',
    refundAmount: 299.99,
    trackingNumber: 'SF123456789',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    approvedAt: new Date('2024-01-16'),
    refundedAt: new Date('2024-01-20'),
  };

  const mockTrackingEvents: ReturnTrackingEvent[] = [
    {
      id: '1',
      returnId: '1',
      status: 'pending_approval',
      timestamp: new Date('2024-01-15'),
      description: '退货申请已提交',
    },
    {
      id: '2',
      returnId: '1',
      status: 'approved',
      timestamp: new Date('2024-01-16'),
      description: '退货申请已批准',
    },
    {
      id: '3',
      returnId: '1',
      status: 'in_transit',
      timestamp: new Date('2024-01-17'),
      description: '商品已发出',
      location: '北京分拨中心',
    },
    {
      id: '4',
      returnId: '1',
      status: 'received',
      timestamp: new Date('2024-01-19'),
      description: '商品已收货',
      location: '上海仓库',
    },
    {
      id: '5',
      returnId: '1',
      status: 'refunded',
      timestamp: new Date('2024-01-20'),
      description: '退款已处理',
    },
  ];

  const mockContactMethods: ContactInfo[] = [
    {
      method: 'online_chat',
      value: '在线客服',
      label: '在线客服',
      available: true,
      hours: '09:00-21:00',
    },
    {
      method: 'phone',
      value: '400-123-4567',
      label: '电话客服',
      available: true,
      hours: '09:00-18:00',
    },
    {
      method: 'email',
      value: 'support@example.com',
      label: '邮件客服',
      available: true,
      hours: '24小时',
    },
  ];

  const handleReturnSubmit = (request: Partial<ReturnRequest>) => {
    console.log('Return request submitted:', request);
    setActiveTab('records');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">售后服务</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'records'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            售后记录
          </button>
          <button
            onClick={() => setActiveTab('new-return')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'new-return'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            申请退货
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'tracking'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            退货追踪
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'contact'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            联系客服
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'records' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                售后记录
              </h2>
              <AfterSalesRecordsList
                records={mockRecords}
                onSelectRecord={(record) => {
                  setSelectedReturn(mockReturnRequest);
                  setActiveTab('tracking');
                }}
              />
            </div>
          )}

          {activeTab === 'new-return' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                申请退货
              </h2>
              <ReturnRequestForm
                orderId="ORD001"
                itemId="ITEM001"
                itemName="蓝牙耳机"
                onSubmit={handleReturnSubmit}
              />
            </div>
          )}

          {activeTab === 'tracking' && selectedReturn && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                退货追踪
              </h2>
              <ReturnTracking
                returnRequest={selectedReturn}
                trackingEvents={mockTrackingEvents}
              />
            </div>
          )}

          {activeTab === 'tracking' && !selectedReturn && (
            <div className="bg-white dark:bg-slate-900 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                请先从售后记录中选择一个退货单
              </p>
            </div>
          )}

          {activeTab === 'contact' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                联系客服
              </h2>
              <CustomerServiceContact contactMethods={mockContactMethods} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
