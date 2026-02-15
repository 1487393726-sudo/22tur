import { prisma } from '@/lib/prisma';
import { encrypt, decrypt, generateApiKey, maskApiKey } from './encryption-service';
import type { ApiKey, ApiKeyCreateInput } from '@/types/api-management';

export interface CreateKeyResult {
  key: ApiKey;
  plainKey: string; // Only returned once at creation
}

export interface KeyWithMasked extends ApiKey {
  maskedKey: string;
}

/**
 * Creates a new API key for a connection
 * Returns the plain key only once - it cannot be retrieved later
 */
export async function createKey(input: ApiKeyCreateInput): Promise<CreateKeyResult> {
  const plainKey = input.key || generateApiKey('sk');
  const encryptedKey = encrypt(plainKey);
  
  // Extract prefix for display (e.g., "sk_abc..." -> "sk_a")
  const keyPrefix = plainKey.length > 8 ? plainKey.slice(0, 8) : plainKey.slice(0, 4);
  
  const key = await prisma.apiKey.create({
    data: {
      connectionId: input.connectionId,
      name: input.name,
      encryptedKey,
      keyPrefix,
      status: 'ACTIVE',
      expiresAt: input.expiresAt,
    },
  });
  
  return {
    key: mapToApiKey(key),
    plainKey,
  };
}

/**
 * Rotates an API key - creates a new key and revokes the old one
 */
export async function rotateKey(keyId: string): Promise<CreateKeyResult> {
  const existingKey = await prisma.apiKey.findUnique({
    where: { id: keyId },
  });
  
  if (!existingKey) {
    throw new Error('API key not found');
  }
  
  if (existingKey.status === 'REVOKED') {
    throw new Error('Cannot rotate a revoked key');
  }

  
  // Generate new key
  const plainKey = generateApiKey('sk');
  const encryptedKey = encrypt(plainKey);
  const keyPrefix = plainKey.slice(0, 8);
  
  // Use transaction to ensure atomicity
  const [revokedKey, newKey] = await prisma.$transaction([
    // Revoke old key
    prisma.apiKey.update({
      where: { id: keyId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    }),
    // Create new key
    prisma.apiKey.create({
      data: {
        connectionId: existingKey.connectionId,
        name: existingKey.name,
        encryptedKey,
        keyPrefix,
        status: 'ACTIVE',
        expiresAt: existingKey.expiresAt,
      },
    }),
  ]);
  
  return {
    key: mapToApiKey(newKey),
    plainKey,
  };
}

/**
 * Revokes an API key
 */
export async function revokeKey(keyId: string): Promise<ApiKey> {
  const key = await prisma.apiKey.update({
    where: { id: keyId },
    data: {
      status: 'REVOKED',
      revokedAt: new Date(),
    },
  });
  
  return mapToApiKey(key);
}

/**
 * Gets all keys for a connection with masked values
 */
export async function getKeysByConnection(connectionId: string): Promise<KeyWithMasked[]> {
  const keys = await prisma.apiKey.findMany({
    where: { connectionId },
    orderBy: { createdAt: 'desc' },
  });
  
  return keys.map((key) => ({
    ...mapToApiKey(key),
    maskedKey: maskApiKey(key.keyPrefix + '...' + 'xxxx'),
  }));
}

/**
 * Gets a single key by ID with masked value
 */
export async function getKeyById(keyId: string): Promise<KeyWithMasked | null> {
  const key = await prisma.apiKey.findUnique({
    where: { id: keyId },
  });
  
  if (!key) return null;
  
  return {
    ...mapToApiKey(key),
    maskedKey: maskApiKey(key.keyPrefix + '...' + 'xxxx'),
  };
}

/**
 * Reveals the full key (for authorized operations only)
 * Should be used sparingly and with proper authorization
 */
export async function revealKey(keyId: string): Promise<string | null> {
  const key = await prisma.apiKey.findUnique({
    where: { id: keyId },
  });
  
  if (!key) return null;
  
  return decrypt(key.encryptedKey);
}

/**
 * Updates the last used timestamp for a key
 */
export async function updateKeyLastUsed(keyId: string): Promise<void> {
  await prisma.apiKey.update({
    where: { id: keyId },
    data: { lastUsedAt: new Date() },
  });
}

/**
 * Deletes a key permanently
 */
export async function deleteKey(keyId: string): Promise<void> {
  await prisma.apiKey.delete({
    where: { id: keyId },
  });
}

/**
 * Maps Prisma model to ApiKey type
 */
function mapToApiKey(key: {
  id: string;
  connectionId: string;
  name: string;
  keyPrefix: string;
  status: string;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): ApiKey {
  return {
    id: key.id,
    connectionId: key.connectionId,
    name: key.name,
    keyPrefix: key.keyPrefix,
    status: key.status as 'ACTIVE' | 'REVOKED',
    expiresAt: key.expiresAt,
    lastUsedAt: key.lastUsedAt,
    revokedAt: key.revokedAt,
    createdAt: key.createdAt,
    updatedAt: key.updatedAt,
  };
}
