'use client';

import React, { useState } from 'react';
import { CheckoutData, InvoiceRequest, INVOICE_TYPES } from '@/lib/user-portal/shopping-types';
import { Address } from '@/lib/user-portal/order-types';

interface PaymentMethod {
  id: string;
  type: 'card' | 'alipay' | 'wechat';
  name: string;
  lastFour: string;
  isDefault: boolean;
}

interface CheckoutFormProps {
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  totalAmount: number;
  onSubmit: (data: CheckoutData) => void;
  isLoading?: boolean;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  addresses,
  paymentMethods,
  totalAmount,
  onSubmit,
  isLoading = false,
}) => {
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || '');
  const [selectedPaymentId, setSelectedPaymentId] = useState(paymentMethods[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [requestInvoice, setRequestInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceRequest>({
    type: 'personal',
    title: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedAddressId) {
      newErrors.address = '请选择收货地址';
    }
    if (!selectedPaymentId) {
      newErrors.payment = '请选择支付方式';
    }
    if (requestInvoice) {
      if (!invoiceData.title) {
        newErrors.invoiceTitle = '请输入发票抬头';
      }
      if (!invoiceData.email) {
        newErrors.invoiceEmail = '请输入邮箱地址';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const checkoutData: CheckoutData = {
      cartItems: [],
      shippingAddressId: selectedAddressId,
      paymentMethodId: selectedPaymentId,
      notes: notes || undefined,
      invoiceRequest: requestInvoice ? invoiceData : undefined,
    };

    onSubmit(checkoutData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Address */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          收货地址
        </h3>
        {addresses.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            请先添加收货地址
          </p>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <label
                key={address.id}
                className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <input
                  type="radio"
                  name="address"
                  value={address.id}
                  checked={selectedAddressId === address.id}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {address.recipient} {address.phone}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {address.province} {address.city} {address.district}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {address.detail}
                  </p>
                  {address.isDefault && (
                    <span className="inline-block mt-2 px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs rounded">
                      默认地址
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
        {errors.address && (
          <p className="text-red-500 text-sm mt-2">{errors.address}</p>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          支付方式
        </h3>
        {paymentMethods.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            请先添加支付方式
          </p>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={selectedPaymentId === method.id}
                  onChange={(e) => setSelectedPaymentId(e.target.value)}
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {method.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {method.type === 'card' && `****${method.lastFour}`}
                    {method.type === 'alipay' && '支付宝'}
                    {method.type === 'wechat' && '微信支付'}
                  </p>
                </div>
                {method.isDefault && (
                  <span className="text-xs text-teal-600 dark:text-teal-400">
                    默认
                  </span>
                )}
              </label>
            ))}
          </div>
        )}
        {errors.payment && (
          <p className="text-red-500 text-sm mt-2">{errors.payment}</p>
        )}
      </div>

      {/* Order Notes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          订单备注
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="请输入订单备注（可选）"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Invoice Request */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={requestInvoice}
            onChange={(e) => setRequestInvoice(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="font-semibold text-gray-900 dark:text-white">
            需要发票
          </span>
        </label>

        {requestInvoice && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                发票类型
              </label>
              <select
                value={invoiceData.type}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    type: e.target.value as 'personal' | 'company',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {Object.entries(INVOICE_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                发票抬头 *
              </label>
              <input
                type="text"
                value={invoiceData.title}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, title: e.target.value })
                }
                placeholder="请输入发票抬头"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.invoiceTitle && (
                <p className="text-red-500 text-sm mt-1">{errors.invoiceTitle}</p>
              )}
            </div>

            {invoiceData.type === 'company' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  税号
                </label>
                <input
                  type="text"
                  value={invoiceData.taxId || ''}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, taxId: e.target.value })
                  }
                  placeholder="请输入税号"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                邮箱地址 *
              </label>
              <input
                type="email"
                value={invoiceData.email}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, email: e.target.value })
                }
                placeholder="请输入邮箱地址"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.invoiceEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.invoiceEmail}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Price Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span className="text-gray-900 dark:text-white">应付金额:</span>
          <span className="text-teal-600 dark:text-teal-400">¥{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '处理中...' : '确认订单'}
      </button>
    </form>
  );
};
