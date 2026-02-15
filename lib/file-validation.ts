/**
 * 文件验证工具
 */

export interface FileValidationOptions {
  maxSize?: number; // 字节
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 验证文件大小
 */
export function validateFileSize(
  file: File,
  maxSize: number
): FileValidationResult {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `文件大小超过限制。最大允许 ${formatFileSize(maxSize)}，当前文件 ${formatFileSize(file.size)}`,
    };
  }
  return { valid: true };
}

/**
 * 验证文件类型（MIME type）
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): FileValidationResult {
  const fileType = file.type;

  // 检查精确匹配
  if (allowedTypes.includes(fileType)) {
    return { valid: true };
  }

  // 检查通配符匹配（如 image/*）
  const wildcardMatch = allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      const prefix = type.slice(0, -2);
      return fileType.startsWith(prefix + '/');
    }
    return false;
  });

  if (wildcardMatch) {
    return { valid: true };
  }

  return {
    valid: false,
    error: `不支持的文件类型。允许的类型: ${allowedTypes.join(', ')}`,
  };
}

/**
 * 验证文件扩展名
 */
export function validateFileExtension(
  file: File,
  allowedExtensions: string[]
): FileValidationResult {
  const fileName = file.name.toLowerCase();
  const extension = fileName.substring(fileName.lastIndexOf('.'));

  if (!extension) {
    return {
      valid: false,
      error: '文件没有扩展名',
    };
  }

  const normalizedExtensions = allowedExtensions.map((ext) =>
    ext.toLowerCase().startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`
  );

  if (!normalizedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `不支持的文件扩展名。允许的扩展名: ${allowedExtensions.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * 综合验证文件
 */
export function validateFile(
  file: File,
  options: FileValidationOptions
): FileValidationResult {
  // 验证文件大小
  if (options.maxSize) {
    const sizeResult = validateFileSize(file, options.maxSize);
    if (!sizeResult.valid) {
      return sizeResult;
    }
  }

  // 验证文件类型
  if (options.allowedTypes && options.allowedTypes.length > 0) {
    const typeResult = validateFileType(file, options.allowedTypes);
    if (!typeResult.valid) {
      return typeResult;
    }
  }

  // 验证文件扩展名
  if (options.allowedExtensions && options.allowedExtensions.length > 0) {
    const extResult = validateFileExtension(file, options.allowedExtensions);
    if (!extResult.valid) {
      return extResult;
    }
  }

  return { valid: true };
}

/**
 * 批量验证文件
 */
export function validateFiles(
  files: File[],
  options: FileValidationOptions
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  files.forEach((file) => {
    const result = validateFile(file, options);
    if (!result.valid && result.error) {
      errors[file.name] = result.error;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 检查文件是否为图片
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * 检查文件是否为视频
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

/**
 * 检查文件是否为音频
 */
export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/');
}

/**
 * 检查文件是否为文档
 */
export function isDocumentFile(file: File): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ];
  return documentTypes.includes(file.type);
}

/**
 * 获取文件类别
 */
export function getFileCategory(file: File): 'image' | 'video' | 'audio' | 'document' | 'other' {
  if (isImageFile(file)) return 'image';
  if (isVideoFile(file)) return 'video';
  if (isAudioFile(file)) return 'audio';
  if (isDocumentFile(file)) return 'document';
  return 'other';
}

/**
 * 预设的文件类型配置
 */
export const FILE_TYPE_PRESETS = {
  images: {
    allowedTypes: ['image/*'],
    allowedExtensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  documents: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  videos: {
    allowedTypes: ['video/*'],
    allowedExtensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  audio: {
    allowedTypes: ['audio/*'],
    allowedExtensions: ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
  all: {
    allowedTypes: ['*/*'],
    allowedExtensions: [],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
};
