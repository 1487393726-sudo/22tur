import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;

// Get encryption key from environment or generate a default one
function getEncryptionKey(): Buffer {
  const envKey = process.env.API_ENCRYPTION_KEY;
  if (envKey) {
    // If key is provided as hex string
    if (envKey.length === 64) {
      return Buffer.from(envKey, 'hex');
    }
    // If key is provided as base64
    const decoded = Buffer.from(envKey, 'base64');
    if (decoded.length === KEY_LENGTH) {
      return decoded;
    }
    // Derive key from passphrase
    return crypto.scryptSync(envKey, 'api-management-salt', KEY_LENGTH);
  }
  // Fallback: derive from a default (not recommended for production)
  return crypto.scryptSync('default-api-key-change-me', 'api-management-salt', KEY_LENGTH);
}

/**
 * Encrypts plaintext using AES-256-GCM
 * Returns base64 encoded string: iv:authTag:ciphertext
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:ciphertext (all in hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}


/**
 * Decrypts ciphertext encrypted with AES-256-GCM
 * Expects base64 encoded string: iv:authTag:ciphertext
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext format');
  }
  
  const [ivHex, authTagHex, encryptedHex] = parts;
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  
  if (iv.length !== IV_LENGTH) {
    throw new Error('Invalid IV length');
  }
  
  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error('Invalid auth tag length');
  }
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString('utf8');
}

/**
 * Generates a cryptographically secure random key
 * @param length - Length of the key in bytes (default: 32 for 256-bit)
 * @returns Hex-encoded key string
 */
export function generateKey(length: number = 32): string {
  if (length < 32) {
    throw new Error('Key length must be at least 32 bytes for security');
  }
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generates a secure API key with prefix
 * @param prefix - Prefix for the key (e.g., 'sk_live', 'pk_test')
 * @returns API key string with prefix
 */
export function generateApiKey(prefix: string = 'sk'): string {
  const randomPart = crypto.randomBytes(24).toString('base64url');
  return `${prefix}_${randomPart}`;
}

/**
 * Hashes a secret using SHA-256 with salt
 * Used for storing webhook secrets securely
 */
export function hashSecret(secret: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.pbkdf2Sync(secret, salt, 100000, 64, 'sha512');
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * Verifies a secret against its hash
 */
export function verifySecret(secret: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) {
    return false;
  }
  
  const [saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex, 'hex');
  const storedHashBuffer = Buffer.from(hashHex, 'hex');
  
  const hash = crypto.pbkdf2Sync(secret, salt, 100000, 64, 'sha512');
  
  return crypto.timingSafeEqual(hash, storedHashBuffer);
}

/**
 * Generates HMAC signature for webhook payloads
 */
export function generateHmacSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verifies HMAC signature for webhook payloads
 */
export function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateHmacSignature(payload, secret);
  
  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Masks an API key for display purposes
 * Shows first 4 and last 4 characters, masks the rest
 */
export function maskApiKey(key: string): string {
  if (key.length <= 8) {
    return '*'.repeat(key.length);
  }
  
  const prefix = key.slice(0, 4);
  const suffix = key.slice(-4);
  const maskedLength = key.length - 8;
  
  return `${prefix}${'*'.repeat(maskedLength)}${suffix}`;
}
