/**
 * 文件上传安全验证工具
 * 提供文件类型验证、内容扫描、文件名安全处理等功能
 */

import crypto from "crypto";
import path from "path";

/**
 * 允许的文件类型配置
 */
export interface AllowedFileType {
  mimeType: string;
  extensions: string[];
  maxSize: number; // 字节
  magicBytes?: number[]; // 文件头魔数
}

/**
 * 文件验证结果
 */
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedFileName?: string;
  detectedMimeType?: string;
}

/**
 * 预定义的文件类型配置
 */
export const FILE_TYPE_CONFIGS: Record<string, AllowedFileType> = {
  // 图片
  "image/jpeg": {
    mimeType: "image/jpeg",
    extensions: [".jpg", ".jpeg"],
    maxSize: 10 * 1024 * 1024, // 10MB
    magicBytes: [0xff, 0xd8, 0xff],
  },
  "image/png": {
    mimeType: "image/png",
    extensions: [".png"],
    maxSize: 10 * 1024 * 1024,
    magicBytes: [0x89, 0x50, 0x4e, 0x47],
  },
  "image/gif": {
    mimeType: "image/gif",
    extensions: [".gif"],
    maxSize: 5 * 1024 * 1024,
    magicBytes: [0x47, 0x49, 0x46],
  },
  "image/webp": {
    mimeType: "image/webp",
    extensions: [".webp"],
    maxSize: 10 * 1024 * 1024,
    magicBytes: [0x52, 0x49, 0x46, 0x46],
  },

  // 文档
  "application/pdf": {
    mimeType: "application/pdf",
    extensions: [".pdf"],
    maxSize: 50 * 1024 * 1024, // 50MB
    magicBytes: [0x25, 0x50, 0x44, 0x46], // %PDF
  },
  "text/html": {
    mimeType: "text/html",
    extensions: [".html", ".htm"],
    maxSize: 10 * 1024 * 1024,
  },
  "application/vnd.ms-powerpoint": {
    mimeType: "application/vnd.ms-powerpoint",
    extensions: [".ppt"],
    maxSize: 100 * 1024 * 1024,
    magicBytes: [0xd0, 0xcf, 0x11, 0xe0],
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    extensions: [".pptx"],
    maxSize: 100 * 1024 * 1024,
    magicBytes: [0x50, 0x4b, 0x03, 0x04], // ZIP header
  },
};

/**
 * 危险的文件扩展名（黑名单）
 */
const DANGEROUS_EXTENSIONS = [
  ".exe", ".dll", ".bat", ".cmd", ".sh", ".bash",
  ".ps1", ".vbs", ".js", ".jse", ".wsf", ".wsh",
  ".msi", ".msp", ".com", ".scr", ".pif", ".hta",
  ".cpl", ".msc", ".jar", ".php", ".asp", ".aspx",
  ".jsp", ".py", ".rb", ".pl", ".cgi",
];

/**
 * 危险的 MIME 类型（黑名单）
 */
const DANGEROUS_MIME_TYPES = [
  "application/x-msdownload",
  "application/x-executable",
  "application/x-dosexec",
  "application/x-msdos-program",
  "application/x-sh",
  "application/x-shellscript",
  "text/x-php",
  "application/x-httpd-php",
];

/**
 * 文件验证器类
 */
export class FileValidator {
  private allowedTypes: Map<string, AllowedFileType>;

  constructor(allowedTypes?: AllowedFileType[]) {
    this.allowedTypes = new Map();
    if (allowedTypes) {
      for (const type of allowedTypes) {
        this.allowedTypes.set(type.mimeType, type);
      }
    } else {
      // 使用默认配置
      for (const [mimeType, config] of Object.entries(FILE_TYPE_CONFIGS)) {
        this.allowedTypes.set(mimeType, config);
      }
    }
  }

  /**
   * 验证文件
   */
  async validate(
    file: {
      name: string;
      type: string;
      size: number;
      buffer?: Buffer;
    }
  ): Promise<FileValidationResult> {
    const errors: string[] = [];

    // 1. 检查文件名
    const fileNameCheck = this.validateFileName(file.name);
    if (!fileNameCheck.valid) {
      errors.push(...fileNameCheck.errors);
    }

    // 2. 检查扩展名是否在黑名单中
    const ext = path.extname(file.name).toLowerCase();
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      errors.push(`不允许上传 ${ext} 类型的文件`);
    }

    // 3. 检查 MIME 类型是否在黑名单中
    if (DANGEROUS_MIME_TYPES.includes(file.type)) {
      errors.push(`不允许上传此类型的文件: ${file.type}`);
    }

    // 4. 检查是否在允许列表中
    const allowedType = this.allowedTypes.get(file.type);
    if (!allowedType) {
      errors.push(`不支持的文件类型: ${file.type}`);
    } else {
      // 5. 检查扩展名是否匹配
      if (!allowedType.extensions.includes(ext)) {
        errors.push(`文件扩展名 ${ext} 与 MIME 类型 ${file.type} 不匹配`);
      }

      // 6. 检查文件大小
      if (file.size > allowedType.maxSize) {
        const maxSizeMB = Math.round(allowedType.maxSize / 1024 / 1024);
        errors.push(`文件大小超过限制 (最大 ${maxSizeMB}MB)`);
      }

      // 7. 检查文件头魔数（如果提供了 buffer）
      if (file.buffer && allowedType.magicBytes) {
        const magicCheck = this.checkMagicBytes(file.buffer, allowedType.magicBytes);
        if (!magicCheck) {
          errors.push("文件内容与声明的类型不匹配");
        }
      }
    }

    // 8. 如果是 HTML 文件，检查危险内容
    if (file.type === "text/html" && file.buffer) {
      const htmlCheck = this.scanHtmlContent(file.buffer.toString("utf-8"));
      if (!htmlCheck.safe) {
        errors.push(...htmlCheck.issues);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitizedFileName: fileNameCheck.sanitizedName,
      detectedMimeType: file.type,
    };
  }

  /**
   * 验证文件名
   */
  validateFileName(fileName: string): {
    valid: boolean;
    errors: string[];
    sanitizedName: string;
  } {
    const errors: string[] = [];

    // 检查空文件名
    if (!fileName || fileName.trim() === "") {
      errors.push("文件名不能为空");
      return { valid: false, errors, sanitizedName: "" };
    }

    // 检查路径遍历攻击
    if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
      errors.push("文件名包含非法字符");
    }

    // 检查空字节注入
    if (fileName.includes("\0")) {
      errors.push("文件名包含非法字符");
    }

    // 生成安全的文件名
    const sanitizedName = this.sanitizeFileName(fileName);

    return {
      valid: errors.length === 0,
      errors,
      sanitizedName,
    };
  }

  /**
   * 清理文件名
   */
  sanitizeFileName(fileName: string): string {
    // 获取扩展名
    const ext = path.extname(fileName).toLowerCase();
    const baseName = path.basename(fileName, ext);

    // 移除危险字符
    let sanitized = baseName
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "") // 移除 Windows 非法字符
      .replace(/\.\./g, "") // 移除路径遍历
      .replace(/^\.+/, "") // 移除开头的点
      .trim();

    // 如果文件名为空，生成随机名称
    if (!sanitized) {
      sanitized = crypto.randomBytes(8).toString("hex");
    }

    // 限制长度
    if (sanitized.length > 200) {
      sanitized = sanitized.substring(0, 200);
    }

    // 添加时间戳和随机字符串确保唯一性
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString("hex");

    return `${sanitized}-${timestamp}-${random}${ext}`;
  }

  /**
   * 检查文件头魔数
   */
  private checkMagicBytes(buffer: Buffer, expectedMagic: number[]): boolean {
    if (buffer.length < expectedMagic.length) {
      return false;
    }

    for (let i = 0; i < expectedMagic.length; i++) {
      if (buffer[i] !== expectedMagic[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * 扫描 HTML 内容中的危险元素
   */
  scanHtmlContent(html: string): { safe: boolean; issues: string[] } {
    const issues: string[] = [];

    // 检查危险标签
    const dangerousTags = [
      /<script\b[^>]*>/gi,
      /<iframe\b[^>]*>/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi,
      /<applet\b[^>]*>/gi,
      /<meta\b[^>]*http-equiv/gi,
      /<link\b[^>]*rel\s*=\s*["']?import/gi,
      /<base\b[^>]*>/gi,
    ];

    for (const pattern of dangerousTags) {
      if (pattern.test(html)) {
        issues.push(`HTML 包含危险标签: ${pattern.source.split("\\b")[0].replace("<", "")}`);
      }
    }

    // 检查危险属性
    const dangerousAttrs = [
      /\bon\w+\s*=/gi, // 事件处理器 (onclick, onerror, etc.)
      /javascript:/gi, // javascript: 协议
      /vbscript:/gi, // vbscript: 协议
      /data:\s*text\/html/gi, // data: HTML
      /expression\s*\(/gi, // CSS expression
    ];

    for (const pattern of dangerousAttrs) {
      if (pattern.test(html)) {
        issues.push(`HTML 包含危险属性或协议`);
        break;
      }
    }

    return {
      safe: issues.length === 0,
      issues,
    };
  }

  /**
   * 清理 HTML 内容
   */
  sanitizeHtml(html: string): string {
    // 移除危险标签
    let sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
      .replace(/<embed\b[^>]*>/gi, "")
      .replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, "")
      .replace(/<meta\b[^>]*>/gi, "")
      .replace(/<base\b[^>]*>/gi, "");

    // 移除危险属性
    sanitized = sanitized
      .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "")
      .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/vbscript:/gi, "")
      .replace(/expression\s*\([^)]*\)/gi, "");

    return sanitized;
  }
}

// 创建默认实例
export const fileValidator = new FileValidator();

/**
 * 快捷函数：验证文件
 */
export async function validateFile(file: {
  name: string;
  type: string;
  size: number;
  buffer?: Buffer;
}): Promise<FileValidationResult> {
  return fileValidator.validate(file);
}

/**
 * 快捷函数：清理文件名
 */
export function sanitizeFileName(fileName: string): string {
  return fileValidator.sanitizeFileName(fileName);
}

/**
 * 快捷函数：清理 HTML
 */
export function sanitizeHtml(html: string): string {
  return fileValidator.sanitizeHtml(html);
}

export default FileValidator;
