'use client';

import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  ProductType,
  PRODUCT_TYPE_LABELS,
  QUANTITY_PRESETS,
  MIN_QUANTITY,
  MAX_QUANTITY,
} from '@/lib/printing/types';
import { PRINT_SPECS } from '@/lib/printing/print-specs';
import { validateFile } from '@/lib/printing/file-validator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';

interface QuoteFormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

/**
 * 印刷询价表单组件
 * Requirements: 1.1, 1.2, 1.5
 */
export default function QuoteForm({ onSubmit, isSubmitting }: QuoteFormProps) {
  const { control, handleSubmit, watch, formState: { errors }, reset } = useForm({
    defaultValues: {
      productType: 'business_card',
      quantity: 1000,
      size: 'standard',
      customWidth: undefined,
      customHeight: undefined,
      material: undefined,
      finishing: [],
      colorMode: undefined,
      sides: 'single',
      requirements: '',
      deliveryAddress: '',
      expectedDate: '',
      files: [],
    },
  });

  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    size: number;
    url: string;
  }>>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const productType = watch('productType') as ProductType;
  const size = watch('size');
  const quantity = watch('quantity');

  const specs = PRINT_SPECS[productType] || {};

  // 处理文件上传
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;

    setIsUploading(true);
    setUploadErrors([]);
    const newErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 验证文件
      const validation = validateFile(file.name, file.size);
      if (!validation.valid) {
        newErrors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      try {
        // 上传文件
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/print-quotes/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          newErrors.push(`${file.name}: ${error.message}`);
          continue;
        }

        const result = await response.json();
        setUploadedFiles((prev) => [
          ...prev,
          {
            id: result.fileId,
            name: result.fileName,
            size: result.fileSize,
            url: result.fileUrl,
          },
        ]);
      } catch (error) {
        newErrors.push(`${file.name}: 上传失败`);
      }
    }

    setUploadErrors(newErrors);
    setIsUploading(false);
  }, []);

  // 处理拖拽上传
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  };

  // 删除文件
  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // 表单提交
  const onFormSubmit = async (data: any) => {
    // 验证必填字段
    const errors: string[] = [];

    if (!data.productType) errors.push('请选择产品类型');
    if (!data.quantity || data.quantity < MIN_QUANTITY || data.quantity > MAX_QUANTITY) {
      errors.push(`数量必须在 ${MIN_QUANTITY} 到 ${MAX_QUANTITY} 之间`);
    }
    if (!data.size) errors.push('请选择尺寸');
    if (data.size === 'custom') {
      if (!data.customWidth || data.customWidth <= 0) errors.push('请输入有效的自定义宽度');
      if (!data.customHeight || data.customHeight <= 0) errors.push('请输入有效的自定义高度');
    }
    if (uploadedFiles.length === 0) errors.push('请至少上传一个设计文件');

    if (errors.length > 0) {
      setUploadErrors(errors);
      return;
    }

    // 构建提交数据
    const submitData = {
      ...data,
      fileIds: uploadedFiles.map((f) => f.id),
      size: data.size === 'custom' ? `${data.customWidth}x${data.customHeight}mm` : data.size,
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* 产品类型选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          产品类型 <span className="text-red-500">*</span>
        </label>
        <Controller
          name="productType"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRODUCT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* 数量选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          数量 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            {QUANTITY_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  const input = document.querySelector('input[name="quantity"]') as HTMLInputElement;
                  if (input) input.value = preset.toString();
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                {preset}
              </button>
            ))}
          </div>
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                min={MIN_QUANTITY}
                max={MAX_QUANTITY}
                placeholder={`${MIN_QUANTITY} - ${MAX_QUANTITY}`}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            )}
          />
        </div>
      </div>

      {/* 尺寸选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          尺寸 <span className="text-red-500">*</span>
        </label>
        <Controller
          name="size"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {specs.sizes?.map((sizeOption) => (
                  <SelectItem key={sizeOption.value} value={sizeOption.value}>
                    {sizeOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* 自定义尺寸 */}
      {size === 'custom' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              宽度 (mm) <span className="text-red-500">*</span>
            </label>
            <Controller
              name="customWidth"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="1"
                  placeholder="宽度"
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                />
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              高度 (mm) <span className="text-red-500">*</span>
            </label>
            <Controller
              name="customHeight"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="1"
                  placeholder="高度"
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                />
              )}
            />
          </div>
        </div>
      )}

      {/* 材质选择 */}
      {specs.materials && specs.materials.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            材质
          </label>
          <Controller
            name="material"
            control={control}
            render={({ field }) => (
              <Select value={field.value || ''} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择材质" />
                </SelectTrigger>
                <SelectContent>
                  {specs.materials.map((materialOption) => (
                    <SelectItem key={materialOption.value} value={materialOption.value}>
                      {materialOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      {/* 工艺选择 */}
      {specs.finishings && specs.finishings.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            工艺
          </label>
          <div className="space-y-2">
            {specs.finishings.map((finishingOption) => (
              <label key={finishingOption.value} className="flex items-center">
                <input
                  type="checkbox"
                  value={finishingOption.value}
                  className="rounded border-gray-300"
                  onChange={(e) => {
                    // Handle checkbox changes
                  }}
                />
                <span className="ml-2 text-sm">{finishingOption.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 文件上传 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          设计文件 <span className="text-red-500">*</span>
        </label>
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition"
        >
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            拖拽文件到此处或点击选择
          </p>
          <p className="text-xs text-gray-500 mb-4">
            支持 JPG、PNG、PDF、AI、PSD，单个文件最大 50MB
          </p>
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.ai,.psd"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input">
            <Button type="button" variant="outline" asChild>
              <span>选择文件</span>
            </Button>
          </label>
        </div>

        {/* 已上传文件列表 */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 上传错误 */}
        {uploadErrors.length > 0 && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {uploadErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* 备注 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          特殊要求
        </label>
        <Controller
          name="requirements"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="请输入任何特殊要求或说明..."
              rows={4}
            />
          )}
        />
      </div>

      {/* 收货地址 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          收货地址
        </label>
        <Controller
          name="deliveryAddress"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="请输入收货地址"
            />
          )}
        />
      </div>

      {/* 期望交付日期 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          期望交付日期
        </label>
        <Controller
          name="expectedDate"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="date"
            />
          )}
        />
      </div>

      {/* 提交按钮 */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="flex-1"
        >
          {isSubmitting ? '提交中...' : '提交询价'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isSubmitting}
        >
          重置
        </Button>
      </div>
    </form>
  );
}
