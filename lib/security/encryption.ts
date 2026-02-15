/**
 * 数据加密工具
 * 提供敏感数据加密、密码哈希、令牌生成等功能
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * 加密配置
 */
const ENCRYPTION_CONFIG = {
  algorithm: "aes-256-gcm" as const,
  keyLength: 32, // 256 bits
  ivLength: 16, // 128 bits
  tagLength: 16, // 128 bits
  saltLength: 32,
  pbkdf2Iterations: 100000,
};

/**
 * 密码哈希配置
 */
const PASSWORD_CONFIG = {
  saltRounds: 12,
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

/**
 * 获取加密密钥
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY 环境变量未设置");
  }

  // 如果密钥长度不足，使用 PBKDF2 派生
  if (key.length < ENCRYPTION_CONFIG.keyLength) {
    return crypto.pbkdf2Sync(
      key,
      "salt",
      ENCRYPTION_CONFIG.pbkdf2Iterations,
      ENCRYPTION_CONFIG.keyLength,
      "sha256"
    );
  }

  return Buffer.from(key.slice(0, ENCRYPTION_CONFIG.keyLength));
}

/**
 * AES-256-GCM 加密
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return "";

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);

  const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // 格式: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * AES-256-GCM 解密
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return "";

  const parts = ciphertext.split(":");
  if (parts.length !== 3) {
    throw new Error("无效的加密数据格式");
  }

  const [ivHex, authTagHex, encrypted] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * 简单的 AES-256-CBC 加密（用于数据库密码等）
 */
export function encryptSimple(plaintext: string, key?: string): string {
  if (!plaintext) return "";

  const encKey = key || process.env.ENCRYPTION_KEY || "default-key-32-characters-long!";
  const keyBuffer = Buffer.from(encKey.padEnd(32, "0").slice(0, 32));
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * 简单的 AES-256-CBC 解密
 */
export function decryptSimple(ciphertext: string, key?: string): string {
  if (!ciphertext) return "";

  const parts = ciphertext.split(":");
  if (parts.length !== 2) {
    throw new Error("无效的加密数据格式");
  }

  const [ivHex, encrypted] = parts;
  const encKey = key || process.env.ENCRYPTION_KEY || "default-key-32-characters-long!";
  const keyBuffer = Buffer.from(encKey.padEnd(32, "0").slice(0, 32));
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * 密码哈希
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_CONFIG.saltRounds);
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * 验证密码强度
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;

  // 检查长度
  if (password.length < PASSWORD_CONFIG.minLength) {
    errors.push(`密码长度至少 ${PASSWORD_CONFIG.minLength} 个字符`);
  } else {
    score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
  }

  if (password.length > PASSWORD_CONFIG.maxLength) {
    errors.push(`密码长度不能超过 ${PASSWORD_CONFIG.maxLength} 个字符`);
  }

  // 检查大写字母
  if (PASSWORD_CONFIG.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("密码必须包含大写字母");
  } else if (/[A-Z]/.test(password)) {
    score += 1;
  }

  // 检查小写字母
  if (PASSWORD_CONFIG.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("密码必须包含小写字母");
  } else if (/[a-z]/.test(password)) {
    score += 1;
  }

  // 检查数字
  if (PASSWORD_CONFIG.requireNumbers && !/\d/.test(password)) {
    errors.push("密码必须包含数字");
  } else if (/\d/.test(password)) {
    score += 1;
  }

  // 检查特殊字符
  if (PASSWORD_CONFIG.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("密码必须包含特殊字符");
  } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  }

  // 检查常见弱密码
  const weakPasswords = [
    "password", "123456", "12345678", "qwerty", "abc123",
    "password123", "admin", "letmein", "welcome", "monkey",
  ];
  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push("密码过于简单");
    score = 0;
  }

  return {
    valid: errors.length === 0,
    errors,
    score: Math.min(score, 7), // 最高 7 分
  };
}

/**
 * 生成安全随机令牌
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * 生成安全随机字符串（URL 安全）
 */
export function generateUrlSafeToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("base64url");
}

/**
 * 生成数字验证码
 */
export function generateVerificationCode(length: number = 6): string {
  const max = Math.pow(10, length);
  const min = Math.pow(10, length - 1);
  const code = crypto.randomInt(min, max);
  return code.toString();
}

/**
 * 计算字符串哈希（SHA-256）
 */
export function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * 计算 HMAC
 */
export function hmac(data: string, key?: string): string {
  const hmacKey = key || process.env.HMAC_KEY || process.env.ENCRYPTION_KEY || "default-hmac-key";
  return crypto.createHmac("sha256", hmacKey).update(data).digest("hex");
}

/**
 * 验证 HMAC
 */
export function verifyHmac(data: string, signature: string, key?: string): boolean {
  const expected = hmac(data, key);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * 生成签名 URL
 */
export function generateSignedUrl(
  url: string,
  expiresIn: number = 3600, // 默认 1 小时
  key?: string
): string {
  const expires = Math.floor(Date.now() / 1000) + expiresIn;
  const dataToSign = `${url}:${expires}`;
  const signature = hmac(dataToSign, key);

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}expires=${expires}&signature=${signature}`;
}

/**
 * 验证签名 URL
 */
export function verifySignedUrl(signedUrl: string, key?: string): boolean {
  try {
    const url = new URL(signedUrl, "http://localhost");
    const expires = url.searchParams.get("expires");
    const signature = url.searchParams.get("signature");

    if (!expires || !signature) {
      return false;
    }

    // 检查是否过期
    const expiresTime = parseInt(expires, 10);
    if (Date.now() / 1000 > expiresTime) {
      return false;
    }

    // 重建原始 URL
    url.searchParams.delete("expires");
    url.searchParams.delete("signature");
    const originalUrl = url.pathname + url.search;

    // 验证签名
    const dataToSign = `${originalUrl}:${expires}`;
    return verifyHmac(dataToSign, signature, key);
  } catch {
    return false;
  }
}

/**
 * 加密敏感字段
 */
export function encryptSensitiveFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): T {
  const result = { ...data };
  for (const field of fields) {
    if (typeof result[field] === "string" && result[field]) {
      (result[field] as unknown) = encrypt(result[field] as string);
    }
  }
  return result;
}

/**
 * 解密敏感字段
 */
export function decryptSensitiveFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): T {
  const result = { ...data };
  for (const field of fields) {
    if (typeof result[field] === "string" && result[field]) {
      try {
        (result[field] as unknown) = decrypt(result[field] as string);
      } catch {
        // 如果解密失败，保持原值
      }
    }
  }
  return result;
}

/**
 * 掩码敏感数据
 */
export function maskSensitiveData(data: string, type: "email" | "phone" | "card" | "custom" = "custom"): string {
  if (!data) return "";

  switch (type) {
    case "email": {
      const [local, domain] = data.split("@");
      if (!domain) return data;
      const maskedLocal = local.length > 2
        ? local[0] + "*".repeat(local.length - 2) + local[local.length - 1]
        : "*".repeat(local.length);
      return `${maskedLocal}@${domain}`;
    }
    case "phone": {
      if (data.length < 7) return "*".repeat(data.length);
      return data.slice(0, 3) + "*".repeat(data.length - 7) + data.slice(-4);
    }
    case "card": {
      if (data.length < 8) return "*".repeat(data.length);
      return data.slice(0, 4) + "*".repeat(data.length - 8) + data.slice(-4);
    }
    default: {
      if (data.length <= 4) return "*".repeat(data.length);
      return data[0] + "*".repeat(data.length - 2) + data[data.length - 1];
    }
  }
}

export default {
  encrypt,
  decrypt,
  encryptSimple,
  decryptSimple,
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generateToken,
  generateUrlSafeToken,
  generateVerificationCode,
  sha256,
  hmac,
  verifyHmac,
  generateSignedUrl,
  verifySignedUrl,
  encryptSensitiveFields,
  decryptSensitiveFields,
  maskSensitiveData,
};
