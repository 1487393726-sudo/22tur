'use client';

import React from 'react';
import { AfterSalesRecord } from '@/lib/user-portal/aftersales-types';

interface AfterSalesRecordsListProps {
  records: AfterSalesRecord[];
  onSelectRecord?: (record: AfterSalesRecord) => void;
}

const TYPE_LABELS: Record<string, string> = {
  return: '退货',
  exchange: '换货',
  repair: '维修',
  complaint: '投诉',
};

const STATUS_LABELS: Record<string, string> = {
  pending_approval: '待审核',
  approved: '已批准',
  rejected: '已拒绝',
  in_transit: '处理中',
  received: '已收货',
  refunded: '已完成',
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

export function AfterSalesRecordsList({
  records,
  onSelectRecord,
}: AfterSalesRecordsListProps) {
  if (records.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">暂无售后记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div
          key={record.id}
          onClick={() => onSelectRecord?.(record)}
          className="bg-white dark:bg-slate-900 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {TYPE_LABELS[record.type]}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                订单号: {record.orderNumber}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                STATUS_COLORS[record.status]
              }`}
            >
              {STATUS_LABELS[record.status]}
            </span>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
            {record.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>创建于: {new Date(record.createdAt).toLocaleDateString('zh-CN')}</span>
            {record.resolvedAt && (
              <span>解决于: {new Date(record.resolvedAt).toLocaleDateString('zh-CN')}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
