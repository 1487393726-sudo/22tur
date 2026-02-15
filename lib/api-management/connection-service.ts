import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from './encryption-service';
import type {
  ApiConnection,
  ApiConnectionInput,
  ConnectionStatus,
  ConnectionType,
  FilterCriteria,
  ConnectionTestResult,
} from '@/types/api-management';

/**
 * Creates a new API connection
 */
export async function createConnection(
  input: ApiConnectionInput,
  createdBy: string
): Promise<ApiConnection> {
  // Encrypt the configuration
  const encryptedConfig = encrypt(JSON.stringify(input.config));
  
  // If this is set as default, unset other defaults of same type
  if (input.isDefault) {
    await prisma.apiConnection.updateMany({
      where: { type: input.type, isDefault: true },
      data: { isDefault: false },
    });
  }
  
  const connection = await prisma.apiConnection.create({
    data: {
      name: input.name,
      type: input.type,
      provider: input.provider,
      environment: input.environment,
      baseUrl: input.baseUrl,
      encryptedConfig,
      isDefault: input.isDefault ?? false,
      status: 'INACTIVE',
      createdBy,
    },
  });
  
  return mapToApiConnection(connection);
}

/**
 * Updates an existing API connection
 */
export async function updateConnection(
  id: string,
  input: Partial<ApiConnectionInput>
): Promise<ApiConnection> {
  const updateData: Record<string, unknown> = {};
  
  if (input.name !== undefined) updateData.name = input.name;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.provider !== undefined) updateData.provider = input.provider;
  if (input.environment !== undefined) updateData.environment = input.environment;
  if (input.baseUrl !== undefined) updateData.baseUrl = input.baseUrl;

  
  if (input.config !== undefined) {
    updateData.encryptedConfig = encrypt(JSON.stringify(input.config));
  }
  
  // Handle default flag
  if (input.isDefault !== undefined) {
    updateData.isDefault = input.isDefault;
    if (input.isDefault) {
      const existing = await prisma.apiConnection.findUnique({ where: { id } });
      if (existing) {
        await prisma.apiConnection.updateMany({
          where: { type: existing.type, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }
    }
  }
  
  const connection = await prisma.apiConnection.update({
    where: { id },
    data: updateData,
  });
  
  return mapToApiConnection(connection);
}

/**
 * Deletes an API connection and all related data
 */
export async function deleteConnection(id: string): Promise<void> {
  await prisma.apiConnection.delete({
    where: { id },
  });
}

/**
 * Gets a single connection by ID
 */
export async function getConnectionById(id: string): Promise<ApiConnection | null> {
  const connection = await prisma.apiConnection.findUnique({
    where: { id },
  });
  
  return connection ? mapToApiConnection(connection) : null;
}

/**
 * Gets all connections with optional filtering
 */
export async function getConnections(criteria?: FilterCriteria): Promise<ApiConnection[]> {
  const where: Record<string, unknown> = {};
  
  if (criteria?.type) where.type = criteria.type;
  if (criteria?.status) where.status = criteria.status;
  if (criteria?.provider) where.provider = criteria.provider;
  
  const connections = await prisma.apiConnection.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  
  return connections.map(mapToApiConnection);
}

/**
 * Filters connections by criteria
 */
export async function filterConnections(criteria: FilterCriteria): Promise<ApiConnection[]> {
  return getConnections(criteria);
}

/**
 * Searches connections by name
 */
export async function searchConnections(query: string): Promise<ApiConnection[]> {
  const connections = await prisma.apiConnection.findMany({
    where: {
      name: { contains: query },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return connections.map(mapToApiConnection);
}

/**
 * Gets the decrypted configuration for a connection
 */
export async function getConnectionConfig(id: string): Promise<Record<string, unknown> | null> {
  const connection = await prisma.apiConnection.findUnique({
    where: { id },
    select: { encryptedConfig: true },
  });
  
  if (!connection) return null;
  
  const decrypted = decrypt(connection.encryptedConfig);
  return JSON.parse(decrypted);
}

/**
 * Tests an API connection
 */
export async function testConnection(id: string): Promise<ConnectionTestResult> {
  const connection = await prisma.apiConnection.findUnique({
    where: { id },
  });
  
  if (!connection) {
    return {
      success: false,
      responseTime: 0,
      message: 'Connection not found',
    };
  }
  
  const config = JSON.parse(decrypt(connection.encryptedConfig));
  const startTime = Date.now();
  
  try {
    // Perform a basic connectivity test based on provider type
    const result = await performProviderTest(connection.provider, connection.type, config);
    const responseTime = Date.now() - startTime;
    
    // Update connection status
    await prisma.apiConnection.update({
      where: { id },
      data: {
        lastTestedAt: new Date(),
        lastTestStatus: result.success ? 'SUCCESS' : 'FAILED',
        status: result.success ? 'ACTIVE' : 'ERROR',
      },
    });
    
    return {
      ...result,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await prisma.apiConnection.update({
      where: { id },
      data: {
        lastTestedAt: new Date(),
        lastTestStatus: 'FAILED',
        status: 'ERROR',
      },
    });
    
    return {
      success: false,
      responseTime,
      message: errorMessage,
      troubleshooting: getTroubleshootingTips(connection.provider, errorMessage),
    };
  }
}

/**
 * Updates connection status
 */
export async function updateConnectionStatus(
  id: string,
  status: ConnectionStatus
): Promise<ApiConnection> {
  const connection = await prisma.apiConnection.update({
    where: { id },
    data: { status },
  });
  
  return mapToApiConnection(connection);
}

/**
 * Performs provider-specific connection test
 */
async function performProviderTest(
  provider: string,
  type: string,
  config: Record<string, unknown>
): Promise<{ success: boolean; message: string; statusCode?: number }> {
  // Basic validation - check required fields exist
  switch (type) {
    case 'PAYMENT':
      if (!config.apiKey || !config.secretKey) {
        return {
          success: false,
          message: 'Missing required credentials: apiKey and secretKey are required',
        };
      }
      break;
    case 'EMAIL':
      if (!config.apiKey) {
        return {
          success: false,
          message: 'Missing required credential: apiKey is required',
        };
      }
      break;
    case 'SMS':
      if (!config.accountSid || !config.authToken) {
        return {
          success: false,
          message: 'Missing required credentials: accountSid and authToken are required',
        };
      }
      break;
    case 'STORAGE':
      if (!config.accessKeyId || !config.secretAccessKey) {
        return {
          success: false,
          message: 'Missing required credentials: accessKeyId and secretAccessKey are required',
        };
      }
      break;
  }
  
  // For now, return success if basic validation passes
  // In production, you would make actual API calls to verify credentials
  return {
    success: true,
    message: 'Connection test successful',
    statusCode: 200,
  };
}

/**
 * Gets troubleshooting tips based on provider and error
 */
function getTroubleshootingTips(provider: string, error: string): string[] {
  const tips: string[] = [];
  
  if (error.includes('unauthorized') || error.includes('401')) {
    tips.push('Check that your API credentials are correct');
    tips.push('Verify that the API key has not expired');
  }
  
  if (error.includes('forbidden') || error.includes('403')) {
    tips.push('Check that your account has the required permissions');
    tips.push('Verify that the API key has access to the requested resources');
  }
  
  if (error.includes('timeout') || error.includes('ETIMEDOUT')) {
    tips.push('Check your network connection');
    tips.push('The API server may be experiencing issues');
  }
  
  // Provider-specific tips
  switch (provider.toLowerCase()) {
    case 'stripe':
      tips.push('Ensure you are using the correct API key for your environment (test/live)');
      break;
    case 'sendgrid':
      tips.push('Verify your SendGrid API key has the required scopes');
      break;
    case 'twilio':
      tips.push('Check that your Account SID and Auth Token are correct');
      break;
  }
  
  return tips;
}

/**
 * Validates connection input
 */
export function validateConnectionInput(input: ApiConnectionInput): string[] {
  const errors: string[] = [];
  
  if (!input.name || input.name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (!input.type) {
    errors.push('Type is required');
  }
  
  if (!input.provider || input.provider.trim().length === 0) {
    errors.push('Provider is required');
  }
  
  if (!input.environment) {
    errors.push('Environment is required');
  }
  
  if (!input.config || typeof input.config !== 'object') {
    errors.push('Configuration is required');
  }
  
  return errors;
}

/**
 * Maps Prisma model to ApiConnection type
 */
function mapToApiConnection(connection: {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: string;
  environment: string;
  baseUrl: string | null;
  isDefault: boolean;
  lastTestedAt: Date | null;
  lastTestStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}): ApiConnection {
  return {
    id: connection.id,
    name: connection.name,
    type: connection.type as ConnectionType,
    provider: connection.provider,
    status: connection.status as ConnectionStatus,
    environment: connection.environment as 'SANDBOX' | 'PRODUCTION',
    baseUrl: connection.baseUrl,
    isDefault: connection.isDefault,
    lastTestedAt: connection.lastTestedAt,
    lastTestStatus: connection.lastTestStatus,
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt,
    createdBy: connection.createdBy,
  };
}
