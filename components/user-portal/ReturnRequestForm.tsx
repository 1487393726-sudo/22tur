'use client';

import React, { useState } from 'react';
import { ReturnReason, ReturnRequest } from '@/lib/user-portal/aftersales-types';

interface ReturnRequestFormProps {
  orderId: string;
  itemId: string;
  itemName: string;
  onSubmit: (request: Partial<ReturnRequest>) => void;
  isLoading?: boolean;
}

const RETURN_REASONS: { value: ReturnReason; label: string }[] = [
  { value: 'defective', label: '产品有缺陷' },
  { value: 'wrong_item', label: '收到错误的商品' },
  { value: 'not_as_described', label: '与描述不符' },
  { value: 'damaged', label: '商品损坏' },
  { value: 'changed_mind', label: '改变主意' },
  { value: 'other', label: '其他原因' },
];

export function ReturnRequestForm({
  orderId,
  itemId,
  itemName,
  onSubmit,
  isLoading = false,
}: ReturnRequestFormProps) {
  const [reason, setReason] = useState<ReturnReason>('defective');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!reason) {
      newErrors.reason = '请选择退货原因';
    }

    if (!description.trim()) {
      newErrors.description = '请填写退货说明';
    }

    if (description.length < 10) {
      newErrors.description = '退货说明至少需要10个字符';
    }

    if (quantity < 1) {
      newErrors.quantity = '退货数量必须大于0';
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
      orderId,
      itemId,
      itemName,
      reason,
      description,
      quantity,
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
          value={itemName}
          disabled
          className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          退货原因 *
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value as ReturnReason)}
          className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-gray-300 ${
            errors.reason ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
          }`}
        >
          {RETURN_REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          退货数量 *
        </label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-gray-300 ${
            errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
          }`}
        />
        {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          退货说明 *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="请详细描述退货原因..."
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-gray-300 ${
            errors.description ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
          }`}
        />
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {description.length}/500
        </p>
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          上传凭证 (最多5张)
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`证明 ${index + 1}`}
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
        {isLoading ? '提交中...' : '提交退货申请'}
      </button>
    </form>
  );
}
