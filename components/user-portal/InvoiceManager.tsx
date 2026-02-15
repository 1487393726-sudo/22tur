'use client';

import React, { useState } from 'react';
import { Invoice, INVOICE_STATUS_LABELS, INVOICE_TYPES } from '@/lib/user-portal/shopping-types';

interface InvoiceManagerProps {
  invoices: Invoice[];
  onDownload: (invoiceId: string) => void;
  onResend: (invoiceId: string) => void;
  isLoading?: boolean;
}

export const InvoiceManager: React.FC<InvoiceManagerProps> = ({
  invoices,
  onDownload,
  onResend,
  isLoading = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'issued' | 'sent'>('all');

  const displayInvoices =
    filter === 'all'
      ? invoices
      : invoices.filter((inv) => inv.status === filter);

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'all', label: `全部 (${invoices.length})` },
          {
            key: 'pending',
            label: `待开具 (${invoices.filter((i) => i.status === 'pending').length})`,
          },
          {
            key: 'issued',
            label: `已开具 (${invoices.filter((i) => i.status === 'issued').length})`,
          },
          {
            key: 'sent',
            label: `已发送 (${invoices.filter((i) => i.status === 'sent').length})`,
          },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              filter === key
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      {displayInvoices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            暂无发票记录
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onDownload={() => onDownload(invoice.id)}
              onResend={() => onResend(invoice.id)}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface InvoiceCardProps {
  invoice: Invoice;
  onDownload: () => void;
  onResend: () => void;
  isLoading?: boolean;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  onDownload,
  onResend,
  isLoading = false,
}) => {
  const statusColors = {
    pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    issued: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    sent: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-start justify-between gap-4">
        {/* Invoice Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {invoice.title}
            </h4>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                statusColors[invoice.status]
              }`}
            >
              {INVOICE_STATUS_LABELS[invoice.status]}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500">发票类型</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {INVOICE_TYPES[invoice.type]}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500">金额</p>
              <p className="font-medium text-teal-600 dark:text-teal-400">
                ¥{invoice.amount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500">开具日期</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {invoice.issueDate.toLocaleDateString()}
              </p>
            </div>
            {invoice.taxId && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-500">税号</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {invoice.taxId}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {invoice.status === 'issued' && invoice.downloadUrl && (
            <button
              onClick={onDownload}
              disabled={isLoading}
              className="px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下载
            </button>
          )}
          {invoice.status === 'issued' && (
            <button
              onClick={onResend}
              disabled={isLoading}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              重新发送
            </button>
          )}
          {invoice.status === 'pending' && (
            <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
              处理中...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
