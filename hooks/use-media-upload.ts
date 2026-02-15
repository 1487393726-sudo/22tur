/**
 * 媒体上传 Hook
 * Media Upload Hook
 */

import { useState, useCallback } from 'react';
import type { AssetMetadata, AssetType } from '@/types/editor';

interface UseMediaUploadOptions {
  maxItems?: number;
  onUploadComplete?: (url: string, metadata: AssetMetadata) => void;
  onUploadError?: (error: string) => void;
}

interface UseMediaUploadReturn {
  urls: string[];
  isUploading: boolean;
  error: string | null;
  addUrl: (url: string) => boolean;
  removeUrl: (index: number) => void;
  reorderUrls: (fromIndex: number, toIndex: number) => void;
  setAsPrimary: (index: number) => void;
  handleUploadComplete: (url: string, metadata: AssetMetadata) => void;
  handleUploadError: (error: string) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * 媒体上传管理 Hook
 */
export function useMediaUpload(
  initialUrls: string[] = [],
  options: UseMediaUploadOptions = {}
): UseMediaUploadReturn {
  const { maxItems = 10, onUploadComplete, onUploadError } = options;

  const [urls, setUrls] = useState<string[]>(initialUrls);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 添加 URL 到媒体数组
   */
  const addUrl = useCallback(
    (url: string): boolean => {
      if (urls.length >= maxItems) {
        setError(`最多只能添加 ${maxItems} 个媒体文件`);
        return false;
      }

      if (!url.trim()) {
        setError('URL 不能为空');
        return false;
      }

      setUrls((prev) => [...prev, url.trim()]);
      setError(null);
      return true;
    },
    [urls.length, maxItems]
  );

  /**
   * 从媒体数组中移除 URL
   */
  const removeUrl = useCallback((index: number) => {
    setUrls((prev) => {
      if (index < 0 || index >= prev.length) {
        return prev;
      }
      const newUrls = [...prev];
      newUrls.splice(index, 1);
      return newUrls;
    });
  }, []);

  /**
   * 重新排序媒体数组
   */
  const reorderUrls = useCallback((fromIndex: number, toIndex: number) => {
    setUrls((prev) => {
      if (
        fromIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex < 0 ||
        toIndex >= prev.length ||
        fromIndex === toIndex
      ) {
        return prev;
      }

      const newUrls = [...prev];
      const [removed] = newUrls.splice(fromIndex, 1);
      newUrls.splice(toIndex, 0, removed);
      return newUrls;
    });
  }, []);

  /**
   * 设置主图（移动到第一位）
   */
  const setAsPrimary = useCallback((index: number) => {
    setUrls((prev) => {
      if (index <= 0 || index >= prev.length) {
        return prev;
      }

      const newUrls = [...prev];
      const [removed] = newUrls.splice(index, 1);
      newUrls.unshift(removed);
      return newUrls;
    });
  }, []);

  /**
   * 处理上传完成
   */
  const handleUploadComplete = useCallback(
    (url: string, metadata: AssetMetadata) => {
      setIsUploading(false);
      const success = addUrl(url);
      
      if (success) {
        onUploadComplete?.(url, metadata);
      }
    },
    [addUrl, onUploadComplete]
  );

  /**
   * 处理上传错误
   */
  const handleUploadError = useCallback(
    (errorMessage: string) => {
      setIsUploading(false);
      setError(errorMessage);
      onUploadError?.(errorMessage);
    },
    [onUploadError]
  );

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setUrls(initialUrls);
    setIsUploading(false);
    setError(null);
  }, [initialUrls]);

  return {
    urls,
    isUploading,
    error,
    addUrl,
    removeUrl,
    reorderUrls,
    setAsPrimary,
    handleUploadComplete,
    handleUploadError,
    clearError,
    reset,
  };
}

// ============================================
// 工具函数（用于属性测试）
// ============================================

/**
 * 验证上传完成后 URL 是否被添加到数组
 */
export function verifyUploadAddsToArray(
  originalUrls: string[],
  newUrl: string,
  resultUrls: string[]
): boolean {
  // 新数组应该比原数组多一个元素
  if (resultUrls.length !== originalUrls.length + 1) {
    return false;
  }

  // 新 URL 应该在数组中
  if (!resultUrls.includes(newUrl)) {
    return false;
  }

  // 原有的 URL 应该都还在
  return originalUrls.every((url) => resultUrls.includes(url));
}

/**
 * 验证 URL 是否有效
 */
export function isValidUrl(url: string): boolean {
  if (!url || !url.trim()) {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    // 允许相对路径
    return url.startsWith('/') || url.startsWith('./');
  }
}

/**
 * 验证媒体数组是否在限制内
 */
export function isWithinLimit(urls: string[], maxItems: number): boolean {
  return urls.length <= maxItems;
}
