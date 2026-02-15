'use client';

import React from 'react';
import { ContactInfo as ContactInfoType } from '@/lib/user-portal/help-types';

interface ContactInfoProps {
  contacts: ContactInfoType[];
}

export function ContactInfo({ contacts }: ContactInfoProps) {
  if (contacts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">暂无联系方式</p>
      </div>
    );
  }

  const typeIcon = {
    email: '📧',
    phone: '📞',
    wechat: '💬',
    qq: '👥',
    address: '📍',
  };

  const typeLabel = {
    email: '邮箱',
    phone: '电话',
    wechat: '微信',
    qq: 'QQ',
    address: '地址',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className={`rounded-lg p-4 border ${
            contact.available
              ? 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700'
              : 'bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{typeIcon[contact.type]}</span>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {typeLabel[contact.type]}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{contact.label}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">{contact.value}</p>
              {contact.availableHours && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  ⏰ {contact.availableHours}
                </p>
              )}
              {!contact.available && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">暂不可用</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
