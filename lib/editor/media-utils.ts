/**
 * 媒体工具函数
 * Media Utility Functions
 */

import type { MediaItem, CropAspectRatio, RotationAngle, CropConfig } from '@/types/editor';
import {
  validateFile,
  validateFileSize,
  validateFileType,
  type FileValidationResult,
} from '@/lib/file-validation';

// ============================================
// 文件类型配置
// ============================================

/**
 * 编辑器媒体文件类型配置
 */
export const EDITOR_FILE_PRESETS = {
  image: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  video: {
    allowedTypes: ['video/mp4', 'video/webm'],
    allowedExtensions: ['.mp4', '.webm'],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  document: {
    allowedTypes: ['application/pdf'],
    allowedExtensions: ['.pdf'],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
} as const;

// ============================================
// 图片数组操作
// ============================================

/**
 * 重新排序图片数组
 * @param images 图片URL数组
 * @param fromIndex 原始位置
 * @param toIndex 目标位置
 * @returns 重新排序后的数组
 */
export function reorderImages(images: string[], fromIndex: number, toIndex: number): string[] {
  // 验证索引
  if (fromIndex < 0 || fromIndex >= images.length) {
    return [...images];
  }
  if (toIndex < 0 || toIndex >= images.length) {
    return [...images];
  }
  if (fromIndex === toIndex) {
    return [...images];
  }

  const result = [...images];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  
  return result;
}

/**
 * 设置主图（将指定图片移动到第一位）
 * @param images 图片URL数组
 * @param index 要设为主图的索引
 * @returns 更新后的数组
 */
export function setAsPrimary(images: string[], index: number): string[] {
  if (index < 0 || index >= images.length) {
    return [...images];
  }
  if (index === 0) {
    return [...images];
  }

  return reorderImages(images, index, 0);
}

/**
 * 删除图片
 * @param images 图片URL数组
 * @param index 要删除的索引
 * @returns 更新后的数组
 */
export function deleteImage(images: string[], index: number): string[] {
  if (index < 0 || index >= images.length) {
    return [...images];
  }

  const result = [...images];
  result.splice(index, 1);
  return result;
}

/**
 * 添加图片
 * @param images 图片URL数组
 * @param url 新图片URL
 * @param maxImages 最大图片数量
 * @returns 更新后的数组
 */
export function addImage(images: string[], url: string, maxImages?: number): string[] {
  if (maxImages && images.length >= maxImages) {
    return [...images];
  }
  return [...images, url];
}

// ============================================
// MediaItem 操作
// ============================================

/**
 * 重新排序媒体项
 */
export function reorderMediaItems(items: MediaItem[], fromIndex: number, toIndex: number): MediaItem[] {
  if (fromIndex < 0 || fromIndex >= items.length) {
    return [...items];
  }
  if (toIndex < 0 || toIndex >= items.length) {
    return [...items];
  }
  if (fromIndex === toIndex) {
    return [...items];
  }

  const result = [...items];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  
  // 更新 order 属性
  return result.map((item, index) => ({
    ...item,
    order: index,
  }));
}

/**
 * 将字符串数组转换为 MediaItem 数组
 */
export function stringsToMediaItems(urls: string[], type: 'image' | 'video' = 'image'): MediaItem[] {
  return urls.map((url, index) => ({
    id: `${type}-${index}-${Date.now()}`,
    url,
    type,
    order: index,
  }));
}

/**
 * 将 MediaItem 数组转换为字符串数组
 */
export function mediaItemsToStrings(items: MediaItem[]): string[] {
  return items
    .sort((a, b) => a.order - b.order)
    .map((item) => item.url);
}

// ============================================
// 文件验证
// ============================================

/**
 * 验证图片文件
 */
export function validateImageFile(file: File): FileValidationResult {
  return validateFile(file, EDITOR_FILE_PRESETS.image);
}

/**
 * 验证视频文件
 */
export function validateVideoFile(file: File): FileValidationResult {
  return validateFile(file, EDITOR_FILE_PRESETS.video);
}

/**
 * 验证文档文件
 */
export function validateDocumentFile(file: File): FileValidationResult {
  return validateFile(file, EDITOR_FILE_PRESETS.document);
}

/**
 * 根据类型验证文件
 */
export function validateAssetFile(file: File, type: 'image' | 'video' | 'document'): FileValidationResult {
  const preset = EDITOR_FILE_PRESETS[type];
  return validateFile(file, preset);
}

/**
 * 获取文件验证错误的具体原因
 */
export function getValidationErrorReason(
  file: File,
  type: 'image' | 'video' | 'document'
): { reason: 'invalid_type' | 'size_exceeded' | null; message: string | null } {
  const preset = EDITOR_FILE_PRESETS[type];

  // 检查文件类型
  const typeResult = validateFileType(file, preset.allowedTypes);
  if (!typeResult.valid) {
    return {
      reason: 'invalid_type',
      message: `不支持的文件类型。允许的类型: ${preset.allowedTypes.join(', ')}`,
    };
  }

  // 检查文件大小
  const sizeResult = validateFileSize(file, preset.maxSize);
  if (!sizeResult.valid) {
    return {
      reason: 'size_exceeded',
      message: `文件大小超过限制。最大允许 ${formatFileSize(preset.maxSize)}`,
    };
  }

  return { reason: null, message: null };
}

// ============================================
// 图片编辑
// ============================================

/**
 * 裁剪宽高比数值
 */
export const CROP_ASPECT_RATIOS: Record<CropAspectRatio, number | undefined> = {
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
  'free': undefined,
};

/**
 * 获取裁剪宽高比数值
 */
export function getCropAspectRatioValue(ratio: CropAspectRatio): number | undefined {
  return CROP_ASPECT_RATIOS[ratio];
}

/**
 * 验证裁剪结果是否符合宽高比
 * @param width 裁剪宽度
 * @param height 裁剪高度
 * @param aspectRatio 目标宽高比
 * @param tolerance 容差（像素）
 */
export function validateCropAspectRatio(
  width: number,
  height: number,
  aspectRatio: CropAspectRatio,
  tolerance: number = 1
): boolean {
  if (aspectRatio === 'free') {
    return true;
  }

  const targetRatio = CROP_ASPECT_RATIOS[aspectRatio];
  if (!targetRatio) {
    return true;
  }

  const actualRatio = width / height;
  const expectedHeight = width / targetRatio;
  
  return Math.abs(height - expectedHeight) <= tolerance;
}

/**
 * 旋转图片（90度增量）
 * @param currentRotation 当前旋转角度
 * @param direction 旋转方向
 * @returns 新的旋转角度
 */
export function rotateImage(
  currentRotation: RotationAngle,
  direction: 'clockwise' | 'counterclockwise'
): RotationAngle {
  const delta = direction === 'clockwise' ? 90 : -90;
  const newRotation = (currentRotation + delta + 360) % 360;
  return newRotation as RotationAngle;
}

/**
 * 验证旋转角度是否有效
 */
export function isValidRotation(rotation: number): rotation is RotationAngle {
  return [0, 90, 180, 270].includes(rotation);
}

/**
 * 旋转4次后应回到原始状态
 */
export function rotateRoundTrip(rotation: RotationAngle): RotationAngle {
  // 旋转4次90度 = 360度 = 0度
  let result = rotation;
  for (let i = 0; i < 4; i++) {
    result = rotateImage(result, 'clockwise');
  }
  return result;
}

// ============================================
// 工具函数
// ============================================

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 从URL获取文件名
 */
export function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.split('/').pop() || 'unknown';
  } catch {
    return url.split('/').pop() || 'unknown';
  }
}

/**
 * 检查URL是否为图片
 */
export function isImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some((ext) => lowerUrl.includes(ext));
}

/**
 * 检查URL是否为视频
 */
export function isVideoUrl(url: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some((ext) => lowerUrl.includes(ext));
}

/**
 * 生成唯一ID
 */
export function generateMediaId(): string {
  return `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
