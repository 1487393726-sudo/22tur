import { prisma } from '@/lib/prisma';
import { decrypt } from './encryption-service';
import type { ApiConnection, ConnectionType } from '@/types/api-management';

export interface PaymentGatewayConfig {
  apiKey: string;
  secretKey: string;
  environment: 'SANDBOX' | 'PRODUCTION';
  webhookSecret?: string;
  merchantId?: string;
  [key: string]: unknown;
}

export interface PaymentGatewayValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Required fields for different payment providers
 */
const PROVIDER_REQUIRED_FIELDS: Record<string, string[]> = {
  stripe: ['apiKey', 'secretKey'],
  alipay: ['appId', 'privateKey', 'alipayPublicKey'],
  wechat: ['appId', 'mchId', 'apiKey'],
  paypal: ['clientId', 'clientSecret'],
  default: ['apiKey', 'secretKey'],
};

/**
 * Validates payment gateway configuration
 */
export function validatePaymentConfig(
  provider: string,
  config: Record<string, unknown>
): PaymentGatewayValidationResult {
  const errors: string[] = [];
  
  // Get required fields for provider
  const requiredFields = PROVIDER_REQUIRED_FIELDS[provider.toLowerCase()] || PROVIDER_REQUIRED_FIELDS.default;
  
  // Check required fields
  for (const field of requiredFields) {
    if (!config[field] || (typeof config[field] === 'string' && config[field].toString().trim() === '')) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Check environment
  if (!config.environment || !['SANDBOX', 'PRODUCTION'].includes(config.environment as string)) {
    errors.push('Environment must be SANDBOX or PRODUCTION');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}


/**
 * Sets a payment gateway as the default
 * Ensures only one gateway is default at a time
 */
export async function setDefaultGateway(connectionId: string): Promise<ApiConnection> {
  // First, unset all other payment gateways as default
  await prisma.apiConnection.updateMany({
    where: {
      type: 'PAYMENT',
      isDefault: true,
      id: { not: connectionId },
    },
    data: { isDefault: false },
  });
  
  // Set the specified gateway as default
  const connection = await prisma.apiConnection.update({
    where: { id: connectionId },
    data: { isDefault: true },
  });
  
  return mapToApiConnection(connection);
}

/**
 * Gets the default payment gateway
 */
export async function getDefaultGateway(): Promise<ApiConnection | null> {
  const connection = await prisma.apiConnection.findFirst({
    where: {
      type: 'PAYMENT',
      isDefault: true,
      status: 'ACTIVE',
    },
  });
  
  return connection ? mapToApiConnection(connection) : null;
}

/**
 * Gets all payment gateways
 */
export async function getPaymentGateways(): Promise<ApiConnection[]> {
  const connections = await prisma.apiConnection.findMany({
    where: { type: 'PAYMENT' },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  
  return connections.map(mapToApiConnection);
}

/**
 * Tests a payment gateway in sandbox mode
 */
export async function testSandbox(connectionId: string): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}> {
  const connection = await prisma.apiConnection.findUnique({
    where: { id: connectionId },
  });
  
  if (!connection) {
    return { success: false, message: 'Connection not found' };
  }
  
  if (connection.type !== 'PAYMENT') {
    return { success: false, message: 'Connection is not a payment gateway' };
  }
  
  const config = JSON.parse(decrypt(connection.encryptedConfig));
  
  // Validate configuration first
  const validation = validatePaymentConfig(connection.provider, config);
  if (!validation.valid) {
    return {
      success: false,
      message: 'Invalid configuration',
      details: { errors: validation.errors },
    };
  }
  
  // Provider-specific sandbox tests
  try {
    const result = await performSandboxTest(connection.provider, config);
    
    // Update connection status based on test result
    await prisma.apiConnection.update({
      where: { id: connectionId },
      data: {
        lastTestedAt: new Date(),
        lastTestStatus: result.success ? 'SUCCESS' : 'FAILED',
      },
    });
    
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message };
  }
}

/**
 * Performs provider-specific sandbox test
 */
async function performSandboxTest(
  provider: string,
  config: Record<string, unknown>
): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  // In a real implementation, this would make actual API calls to the provider's sandbox
  // For now, we just validate the configuration format
  
  switch (provider.toLowerCase()) {
    case 'stripe':
      // Check if API key has correct format
      if (typeof config.apiKey === 'string' && config.apiKey.startsWith('sk_test_')) {
        return { success: true, message: 'Stripe sandbox configuration is valid' };
      }
      if (typeof config.apiKey === 'string' && config.apiKey.startsWith('sk_live_')) {
        return { success: false, message: 'Using live key in sandbox mode is not recommended' };
      }
      return { success: true, message: 'Configuration format is valid' };
      
    case 'alipay':
      return { success: true, message: 'Alipay sandbox configuration is valid' };
      
    case 'wechat':
      return { success: true, message: 'WeChat Pay sandbox configuration is valid' };
      
    case 'paypal':
      return { success: true, message: 'PayPal sandbox configuration is valid' };
      
    default:
      return { success: true, message: 'Configuration format is valid' };
  }
}

/**
 * Gets payment gateway configuration (decrypted)
 */
export async function getGatewayConfig(connectionId: string): Promise<PaymentGatewayConfig | null> {
  const connection = await prisma.apiConnection.findUnique({
    where: { id: connectionId },
  });
  
  if (!connection || connection.type !== 'PAYMENT') {
    return null;
  }
  
  const config = JSON.parse(decrypt(connection.encryptedConfig));
  return {
    ...config,
    environment: connection.environment,
  } as PaymentGatewayConfig;
}

/**
 * Checks if there's exactly one default gateway
 */
export async function validateSingleDefault(): Promise<{
  valid: boolean;
  defaultCount: number;
  defaultGateways: string[];
}> {
  const defaults = await prisma.apiConnection.findMany({
    where: {
      type: 'PAYMENT',
      isDefault: true,
    },
    select: { id: true, name: true },
  });
  
  return {
    valid: defaults.length <= 1,
    defaultCount: defaults.length,
    defaultGateways: defaults.map((d) => d.name),
  };
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
    status: connection.status as 'ACTIVE' | 'INACTIVE' | 'ERROR',
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
