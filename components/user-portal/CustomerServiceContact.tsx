'use client';

import React, { useState } from 'react';
import { ContactInfo, ContactMethod } from '@/lib/user-portal/aftersales-types';

interface CustomerServiceContactProps {
  contactMethods: ContactInfo[];
  onContactMethodSelect?: (method: ContactMethod) => void;
}

const CONTACT_ICONS: Record<ContactMethod, string> = {
  online_chat: '💬',
  phone: '📞',
  email: '📧',
};

export function CustomerServiceContact({
  contactMethods,
  onContactMethodSelect,
}: CustomerServiceContactProps) {
  const [selectedMethod, setSelectedMethod] = useState<ContactMethod | null>(null);

  const handleSelectMethod = (method: ContactMethod) => {
    setSelectedMethod(method);
    onContactMethodSelect?.(method);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        联系客服
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contactMethods.map((method) => (
          <button
            key={method.method}
            onClick={() => handleSelectMethod(method.method)}
            disabled={!method.available}
            className={`p-4 rounded-lg border-2 transition ${
              selectedMethod === method.method
                ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
                : 'border-gray-200 dark:border-slate-700 hover:border-teal-300'
            } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-3xl mb-2">{CONTACT_ICONS[method.method]}</div>
            <p className="font-medium text-gray-900 dark:text-white mb-1">{method.label}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{method.value}</p>
            {method.hours && (
              <p className="text-xs text-gray-500 dark:text-gray-500">{method.hours}</p>
            )}
            {!method.available && (
              <p className="text-xs text-red-500 mt-2">暂不可用</p>
            )}
          </button>
        ))}
      </div>

      {selectedMethod && (
        <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
          <p className="text-sm text-teal-900 dark:text-teal-200">
            {selectedMethod === 'online_chat' &&
              '我们的在线客服团队已准备好帮助您。点击下方按钮开始对话。'}
            {selectedMethod === 'phone' &&
              '请拨打上方电话号码与我们的客服团队联系。'}
            {selectedMethod === 'email' &&
              '请发送邮件至上方地址，我们会在24小时内回复。'}
          </p>
        </div>
      )}
    </div>
  );
}
