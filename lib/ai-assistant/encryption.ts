/**
 * Encryption Utility for API Keys
 * Provides AES-256 encryption/decryption for sensitive data like API keys
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCODING = 'hex';

/**
 * Get encryption key from environment
 * **Property 7: API 密钥加密**
 */
function getEncryptionKey(): Buffer {
  const key = process.env.AI_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('AI_ENCRYPTION_KEY environment variable is not set');
  }
  
  // Ensure key is 32 bytes (256 bits) for AES-256
  const hash = crypto.createHash('sha256');
  hash.update(key);
  return hash.digest();
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param plaintext - Data to encrypt
 * @returns Encrypted data in format: iv:authTag:encryptedData
 */
export function encrypt(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);
    
    const authTag = cipher.getAuthTag();
    
    // Return format: iv:authTag:encryptedData
    return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt data encrypted with encrypt()
 * @param encrypted - Encrypted data in format: iv:authTag:encryptedData
 * @returns Decrypted plaintext
 */
export function decrypt(encrypted: string): string {
  try {
    const key = getEncryptionKey();
    const parts = encrypted.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], ENCODING);
    const authTag = Buffer.from(parts[1], ENCODING);
    const encryptedData = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Hash a value for comparison (one-way)
 * @param value - Value to hash
 * @returns Hashed value
 */
export function hash(value: string): string {
  return crypto.createHash('sha256').update(value).digest(ENCODING);
}

/**
 * Verify a hashed value
 * @param value - Original value
 * @param hashedValue - Hashed value to compare against
 * @returns True if values match
 */
export function verifyHash(value: string, hashedValue: string): boolean {
  return hash(value) === hashedValue;
}
