/**
 * Encryption Key Manager
 * Manages encryption keys, rotation, and field-level encryption
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { encrypt, decrypt } from '@/lib/security/encryption';

export interface EncryptionKeyInfo {
  id: string;
  keyId: string;
  algorithm: string;
  status: 'ACTIVE' | 'ROTATED' | 'RETIRED';
  createdAt: Date;
  rotatedAt?: Date;
}

export class KeyManager {
  /**
   * Create a new encryption key
   */
  async createKey(algorithm: string = 'AES-256'): Promise<EncryptionKeyInfo> {
    const keyId = crypto.randomBytes(16).toString('hex');

    const key = await prisma.encryptionKey.create({
      data: {
        keyId,
        algorithm,
        status: 'ACTIVE',
      },
    });

    return key as EncryptionKeyInfo;
  }

  /**
   * Get key by ID
   */
  async getKey(id: string): Promise<EncryptionKeyInfo | null> {
    const key = await prisma.encryptionKey.findUnique({
      where: { id },
    });

    return key as EncryptionKeyInfo | null;
  }

  /**
   * Get active key
   */
  async getActiveKey(): Promise<EncryptionKeyInfo | null> {
    const key = await prisma.encryptionKey.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    return key as EncryptionKeyInfo | null;
  }

  /**
   * Get all keys
   */
  async getAllKeys(): Promise<EncryptionKeyInfo[]> {
    const keys = await prisma.encryptionKey.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return keys as EncryptionKeyInfo[];
  }

  /**
   * Rotate encryption key
   */
  async rotateKey(): Promise<EncryptionKeyInfo> {
    // Get current active key
    const currentKey = await this.getActiveKey();

    if (currentKey) {
      // Mark current key as rotated
      await prisma.encryptionKey.update({
        where: { id: currentKey.id },
        data: {
          status: 'ROTATED',
          rotatedAt: new Date(),
        },
      });
    }

    // Create new active key
    return this.createKey();
  }

  /**
   * Retire a key
   */
  async retireKey(id: string): Promise<void> {
    const key = await this.getKey(id);

    if (!key) {
      throw new Error(`Key with ID "${id}" not found`);
    }

    if (key.status === 'ACTIVE') {
      throw new Error('Cannot retire active key. Rotate first.');
    }

    await prisma.encryptionKey.update({
      where: { id },
      data: { status: 'RETIRED' },
    });
  }

  /**
   * Encrypt sensitive fields in an object
   */
  encryptFields<T extends Record<string, any>>(
    data: T,
    fields: (keyof T)[]
  ): T {
    const encrypted = { ...data };

    for (const field of fields) {
      if (typeof encrypted[field] === 'string' && encrypted[field]) {
        encrypted[field] = encrypt(encrypted[field] as string) as any;
      }
    }

    return encrypted;
  }

  /**
   * Decrypt sensitive fields in an object
   */
  decryptFields<T extends Record<string, any>>(
    data: T,
    fields: (keyof T)[]
  ): T {
    const decrypted = { ...data };

    for (const field of fields) {
      if (typeof decrypted[field] === 'string' && decrypted[field]) {
        try {
          decrypted[field] = decrypt(decrypted[field] as string) as any;
        } catch (error) {
          // If decryption fails, keep original value
          console.error(`Failed to decrypt field ${String(field)}:`, error);
        }
      }
    }

    return decrypted;
  }

  /**
   * Encrypt data at rest
   */
  encryptDataAtRest(data: string): string {
    return encrypt(data);
  }

  /**
   * Decrypt data at rest
   */
  decryptDataAtRest(encryptedData: string): string {
    return decrypt(encryptedData);
  }

  /**
   * Generate TLS certificate (simplified)
   */
  generateTLSCertificate(): {
    certificate: string;
    privateKey: string;
  } {
    // In production, use a proper certificate generation library
    // This is a placeholder
    const privateKey = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });

    return {
      certificate: 'CERTIFICATE_PLACEHOLDER',
      privateKey: privateKey.privateKey.export({ type: 'pkcs8', format: 'pem' }) as string,
    };
  }

  /**
   * Verify encryption round trip
   */
  verifyEncryptionRoundTrip(originalData: string): boolean {
    try {
      const encrypted = this.encryptDataAtRest(originalData);
      const decrypted = this.decryptDataAtRest(encrypted);
      return originalData === decrypted;
    } catch (error) {
      console.error('Encryption round trip verification failed:', error);
      return false;
    }
  }

  /**
   * Get key statistics
   */
  async getKeyStats(): Promise<{
    totalKeys: number;
    activeKeys: number;
    rotatedKeys: number;
    retiredKeys: number;
  }> {
    const total = await prisma.encryptionKey.count();

    const active = await prisma.encryptionKey.count({
      where: { status: 'ACTIVE' },
    });

    const rotated = await prisma.encryptionKey.count({
      where: { status: 'ROTATED' },
    });

    const retired = await prisma.encryptionKey.count({
      where: { status: 'RETIRED' },
    });

    return {
      totalKeys: total,
      activeKeys: active,
      rotatedKeys: rotated,
      retiredKeys: retired,
    };
  }
}

export const keyManager = new KeyManager();
