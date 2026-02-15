'use client';

import React, { useState } from 'react';
import { FAQ } from '@/lib/user-portal/help-types';

interface FAQListProps {
  faqs: FAQ[];
  onSelectFAQ?: (faq: FAQ) => void;
  onHelpful?: (faqId: string, helpful: boolean) => void;
}

export function FAQList({ faqs, onSelectFAQ, onHelpful }: FAQListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (faqs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">暂无常见问题</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          <button
            onClick={() => {
              setExpandedId(expandedId === faq.id ? null : faq.id);
              onSelectFAQ?.(faq);
            }}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition"
          >
            <div className="text-left flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">{faq.question}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                浏览: {faq.views} | 有用: {faq.helpful}
              </p>
            </div>
            <span className={`text-2xl transition transform ${expandedId === faq.id ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {expandedId === faq.id && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
              <p className="text-gray-700 dark:text-gray-300 mb-4">{faq.answer}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onHelpful?.(faq.id, true)}
                  className="px-3 py-2 text-sm bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200 rounded-lg transition"
                >
                  👍 有用
                </button>
                <button
                  onClick={() => onHelpful?.(faq.id, false)}
                  className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-200 rounded-lg transition"
                >
                  👎 无用
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
