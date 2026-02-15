import { prisma } from '@/lib/prisma';
import type { ExportedConfig, ApiConnection, ApiWebhook, ConnectionType } from '@/types/api-management';

const CONFIG_VERSION = '1.0';

/**
 * Exports API configurations (without sensitive data)
 */
export async function exportConfig(connectionIds?: string[]): Promise<ExportedConfig> {
  const where = connectionIds ? { id: { in: connectionIds } } : {};
  
  const connections = await prisma.apiConnection.findMany({
    where,
    include: { webhooks: true },
  });
  
  // Map connections without sensitive data
  const exportedConnections = connections.map((conn) => ({
    name: conn.name,
    type: conn.type as ConnectionType,
    provider: conn.provider,
    status: conn.status as 'ACTIVE' | 'INACTIVE' | 'ERROR',
    environment: conn.environment as 'SANDBOX' | 'PRODUCTION',
    baseUrl: conn.baseUrl,
    isDefault: conn.isDefault,
    lastTestedAt: conn.lastTestedAt,
    lastTestStatus: conn.lastTestStatus,
    createdBy: conn.createdBy,
    // Note: encryptedConfig is NOT exported for security
  }));
  
  // Map webhooks without sensitive data
  const exportedWebhooks = connections.flatMap((conn) =>
    conn.webhooks.map((webhook) => ({
      connectionId: conn.id,
      name: webhook.name,
      events: JSON.parse(webhook.events),
      status: webhook.status as 'ACTIVE' | 'INACTIVE',
      updatedAt: webhook.updatedAt,
      // Note: url and secretHash are NOT exported for security
    }))
  );
  
  return {
    version: CONFIG_VERSION,
    exportedAt: new Date().toISOString(),
    connections: exportedConnections,
    webhooks: exportedWebhooks,
  };
}


/**
 * Validates import data
 */
export function validateImport(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format: expected an object');
    return { valid: false, errors };
  }
  
  const config = data as Record<string, unknown>;
  
  // Check version
  if (!config.version || typeof config.version !== 'string') {
    errors.push('Missing or invalid version field');
  }
  
  // Check connections array
  if (!Array.isArray(config.connections)) {
    errors.push('Missing or invalid connections array');
  } else {
    config.connections.forEach((conn, index) => {
      const connErrors = validateConnectionImport(conn, index);
      errors.push(...connErrors);
    });
  }
  
  // Check webhooks array (optional)
  if (config.webhooks !== undefined && !Array.isArray(config.webhooks)) {
    errors.push('Invalid webhooks field: expected an array');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a single connection for import
 */
function validateConnectionImport(conn: unknown, index: number): string[] {
  const errors: string[] = [];
  const prefix = `connections[${index}]`;
  
  if (!conn || typeof conn !== 'object') {
    errors.push(`${prefix}: expected an object`);
    return errors;
  }
  
  const connection = conn as Record<string, unknown>;
  
  if (!connection.name || typeof connection.name !== 'string') {
    errors.push(`${prefix}.name: required string field`);
  }
  
  if (!connection.type || !['PAYMENT', 'EMAIL', 'SMS', 'STORAGE', 'CUSTOM'].includes(connection.type as string)) {
    errors.push(`${prefix}.type: must be one of PAYMENT, EMAIL, SMS, STORAGE, CUSTOM`);
  }
  
  if (!connection.provider || typeof connection.provider !== 'string') {
    errors.push(`${prefix}.provider: required string field`);
  }
  
  if (!connection.environment || !['SANDBOX', 'PRODUCTION'].includes(connection.environment as string)) {
    errors.push(`${prefix}.environment: must be SANDBOX or PRODUCTION`);
  }
  
  return errors;
}

/**
 * Imports API configurations
 * Note: Credentials must be provided separately for security
 */
export async function importConfig(
  data: ExportedConfig,
  credentialsMap: Map<string, Record<string, unknown>>,
  createdBy: string
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;
  
  for (const conn of data.connections) {
    try {
      // Check if connection with same name exists
      const existing = await prisma.apiConnection.findFirst({
        where: { name: conn.name },
      });
      
      if (existing) {
        skipped++;
        errors.push(`Skipped '${conn.name}': connection with same name already exists`);
        continue;
      }
      
      // Get credentials for this connection
      const credentials = credentialsMap.get(conn.name);
      if (!credentials) {
        skipped++;
        errors.push(`Skipped '${conn.name}': no credentials provided`);
        continue;
      }
      
      // Import the encrypt function
      const { encrypt } = await import('./encryption-service');
      
      // Create the connection
      await prisma.apiConnection.create({
        data: {
          name: conn.name,
          type: conn.type,
          provider: conn.provider,
          status: 'INACTIVE', // Always start as inactive
          environment: conn.environment,
          baseUrl: conn.baseUrl ?? null,
          encryptedConfig: encrypt(JSON.stringify(credentials)),
          isDefault: false, // Don't import default status
          createdBy,
        },
      });
      
      imported++;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Failed to import '${conn.name}': ${message}`);
      skipped++;
    }
  }
  
  return { imported, skipped, errors };
}

/**
 * Exports config as JSON string
 */
export async function exportConfigAsJson(connectionIds?: string[]): Promise<string> {
  const config = await exportConfig(connectionIds);
  return JSON.stringify(config, null, 2);
}

/**
 * Parses and validates import JSON
 */
export function parseImportJson(json: string): { config: ExportedConfig | null; errors: string[] } {
  try {
    const data = JSON.parse(json);
    const validation = validateImport(data);
    
    if (!validation.valid) {
      return { config: null, errors: validation.errors };
    }
    
    return { config: data as ExportedConfig, errors: [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { config: null, errors: [`Invalid JSON: ${message}`] };
  }
}
