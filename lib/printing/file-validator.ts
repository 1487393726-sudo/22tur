/**
 * 印刷文件验证工具
 * Requirements: 1.1
 */

import {
  FileValidationResult,
  ALLOWED_FILE_TYPES,
  AllowedFileType,
  MAX_FILE_SIZE,
} from './types';

/**
 * 获取文件扩展名
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * 检查文件类型是否允许
 */
export function isAllowedFileType(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return ALLOWED_FILE_TYPES.includes(ext as AllowedFileType);
}

/**
 * 检查文件大小是否在限制内
 */
export function isFileSizeValid(fileSize: number): boolean {
  return fileSize > 0 && fileSize <= MAX_FILE_SIZE;
}

/**
 * 验证上传文件
 */
export function validateFile(
  fileName: string,
  fileSize: number
): FileValidationResult {
  // 检查文件名
  if (!fileName || fileName.trim() === '') {
    return {
      valid: false,
      error: '文件名不能为空',
    };
  }

  // 检查文件类型
  const ext = getFileExtension(fileName);
  if (!ext) {
    return {
      valid: false,
      error: '无法识别文件类型',
    };
  }

  if (!isAllowedFileType(fileName)) {
    return {
      valid: false,
      error: `不支持的文件类型: ${ext}。支持的格式: ${ALLOWED_FILE_TYPES.join(', ')}`,
    };
  }

  // 检查文件大小
  if (fileSize <= 0) {
    return {
      valid: false,
      error: '文件大小无效',
    };
  }

  if (fileSize > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `文件大小 ${fileSizeMB}MB 超过限制 ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * 批量验证文件
 */
export function validateFiles(
  files: Array<{ fileName: string; fileSize: number }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const file of files) {
    const result = validateFile(file.fileName, file.fileSize);
    if (!result.valid && result.error) {
      errors.push(`${file.fileName}: ${result.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 获取文件 MIME 类型
 */
export function getMimeType(fileName: string): string {
  const ext = getFileExtension(fileName);
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    pdf: 'application/pdf',
    ai: 'application/illustrator',
    psd: 'image/vnd.adobe.photoshop',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
