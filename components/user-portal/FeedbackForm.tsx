'use client';

import React, { useState } from 'react';
import { Feedback, FeedbackCategory as FeedbackCategoryType } from '@/lib/user-portal/reviews-types';

interface FeedbackFormProps {
  onSubmit: (feedback: Partial<Feedback>) => void;
  isLoading?: boolean;
}

const FEEDBACK_CATEGORIES: { value: FeedbackCategoryType; label: string }[] = [
  { value: 'product', label: '商品问题' },
  { value: 'service', label: '服务问题' },
  { value: 'website', label: '网站问题' },
  { value: 'other', label: '其他' },
];

export function FeedbackForm({ onSubmit, isLoading = false }: FeedbackFormProps) {
  const [category, setCategory] = useState<FeedbackCategoryType>('product');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = '请填写反馈标题';
    }

    if (title.length < 5) {
      newErrors.title = '反馈标题至少需要5个字符';
    }

    if (!content.trim()) {
      newErrors.content = '请填写反馈内容';
    }

    if (content.length < 10) {
      newErrors.content = '反馈内容至少需要10个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments = Array.from(files).map((file) => URL.createObjectURL(file));
      setAttachments([...attachments, ...newAttachments].slice(0, 3));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      category,
      title,
      content,
      attachments,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          反馈类别 *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as FeedbackCategoryType)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-gray-300"
        >
          {FEEDBACK_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          反馈标题 *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入反馈标题"
          className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-gray-300 ${
            errors.title ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
          }`}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          反馈内容 *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请详细描述您的反馈..."
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-gray-300 ${
            errors.content ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
          }`}
        />
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {content.length}/1000
        </p>
        {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          上传附件 (最多3个)
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative">
              <div className="w-20 h-20 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📎</span>
              </div>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          disabled={attachments.length >= 3}
          className="block w-full text-sm text-gray-500 dark:text-gray-400"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
      >
        {isLoading ? '提交中...' : '提交反馈'}
      </button>
    </form>
  );
}
