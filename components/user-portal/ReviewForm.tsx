'use client';

import React, { useState } from 'react';
import { Review, ReviewRating } from '@/lib/user-portal/reviews-types';

interface ReviewFormProps {
  productId: string;
  productName: string;
  orderId: string;
  onSubmit: (review: Partial<Review>) => void;
  isLoading?: boolean;
}

export function ReviewForm({
  productId,
  productName,
  orderId,
  onSubmit,
  isLoading = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState<ReviewRating>(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = '请填写评价标题';
    }

    if (title.length < 5) {
      newErrors.title = '评价标题至少需要5个字符';
    }

    if (!content.trim()) {
      newErrors.content = '请填写评价内容';
    }

    if (content.length < 10) {
      newErrors.content = '评价内容至少需要10个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setImages([...images, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      productId,
      productName,
      orderId,
      rating,
      title,
      content,
      images,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          商品名称
        </label>
        <input
          type="text"
          value={productName}
          disabled
          className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          评分 *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star as ReviewRating)}
              className={`text-3xl transition ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          评价标题 *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入评价标题"
          className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-gray-300 ${
            errors.title ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
          }`}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          评价内容 *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请详细描述您的使用体验..."
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-gray-300 ${
            errors.content ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
          }`}
        />
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {content.length}/500
        </p>
        {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          上传图片 (最多5张)
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`评价图片 ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
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
          accept="image/*"
          onChange={handleImageUpload}
          disabled={images.length >= 5}
          className="block w-full text-sm text-gray-500 dark:text-gray-400"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
      >
        {isLoading ? '提交中...' : '提交评价'}
      </button>
    </form>
  );
}
