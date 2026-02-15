import { prisma } from '@/lib/prisma';
import type { ApiTemplate, ConnectionType, ApiConnectionInput } from '@/types/api-management';

/**
 * Gets all active templates
 */
export async function getTemplates(type?: ConnectionType): Promise<ApiTemplate[]> {
  const where: Record<string, unknown> = { isActive: true };
  if (type) where.type = type;
  
  const templates = await prisma.apiTemplate.findMany({
    where,
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
  
  return templates.map(mapToApiTemplate);
}

/**
 * Gets templates by category
 */
export async function getTemplatesByCategory(category: string): Promise<ApiTemplate[]> {
  const templates = await prisma.apiTemplate.findMany({
    where: { category, isActive: true },
    orderBy: { name: 'asc' },
  });
  
  return templates.map(mapToApiTemplate);
}

/**
 * Gets a template by ID
 */
export async function getTemplateById(id: string): Promise<ApiTemplate | null> {
  const template = await prisma.apiTemplate.findUnique({
    where: { id },
  });
  
  return template ? mapToApiTemplate(template) : null;
}

/**
 * Gets a template by provider and type
 */
export async function getTemplateByProvider(
  provider: string,
  type: ConnectionType
): Promise<ApiTemplate | null> {
  const template = await prisma.apiTemplate.findUnique({
    where: { provider_type: { provider, type } },
  });
  
  return template ? mapToApiTemplate(template) : null;
}


/**
 * Applies a template to create connection input
 * Merges template defaults with user-provided credentials
 */
export function applyTemplate(
  template: ApiTemplate,
  credentials: Record<string, unknown>,
  overrides?: Partial<ApiConnectionInput>
): ApiConnectionInput {
  const defaultConfig = JSON.parse(template.defaultConfig);
  
  // Merge default config with user credentials
  const config = {
    ...defaultConfig,
    ...credentials,
  };
  
  return {
    name: overrides?.name ?? template.name,
    type: template.type as ConnectionType,
    provider: template.provider,
    environment: overrides?.environment ?? 'SANDBOX',
    baseUrl: overrides?.baseUrl,
    config,
    isDefault: overrides?.isDefault ?? false,
  };
}

/**
 * Validates configuration against template schema
 */
export function validateConfig(
  template: ApiTemplate,
  config: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const schema = JSON.parse(template.configSchema);
  const errors: string[] = [];
  
  // Check required fields
  if (schema.required && Array.isArray(schema.required)) {
    for (const field of schema.required) {
      if (config[field] === undefined || config[field] === null || config[field] === '') {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }
  
  // Check field types
  if (schema.properties && typeof schema.properties === 'object') {
    for (const [field, fieldSchema] of Object.entries(schema.properties)) {
      const value = config[field];
      if (value !== undefined && value !== null) {
        const fieldType = (fieldSchema as { type?: string }).type;
        if (fieldType && !validateFieldType(value, fieldType)) {
          errors.push(`Invalid type for field '${field}': expected ${fieldType}`);
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Gets all unique categories
 */
export async function getCategories(): Promise<string[]> {
  const templates = await prisma.apiTemplate.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ['category'],
  });
  
  return templates.map((t) => t.category);
}

/**
 * Creates a new template (admin only)
 */
export async function createTemplate(input: {
  name: string;
  provider: string;
  type: ConnectionType;
  category: string;
  description: string;
  configSchema: Record<string, unknown>;
  defaultConfig: Record<string, unknown>;
  docsUrl?: string;
  logoUrl?: string;
}): Promise<ApiTemplate> {
  const template = await prisma.apiTemplate.create({
    data: {
      name: input.name,
      provider: input.provider,
      type: input.type,
      category: input.category,
      description: input.description,
      configSchema: JSON.stringify(input.configSchema),
      defaultConfig: JSON.stringify(input.defaultConfig),
      docsUrl: input.docsUrl,
      logoUrl: input.logoUrl,
      isActive: true,
    },
  });
  
  return mapToApiTemplate(template);
}

/**
 * Updates a template
 */
export async function updateTemplate(
  id: string,
  input: Partial<{
    name: string;
    description: string;
    configSchema: Record<string, unknown>;
    defaultConfig: Record<string, unknown>;
    docsUrl: string;
    logoUrl: string;
    isActive: boolean;
  }>
): Promise<ApiTemplate> {
  const updateData: Record<string, unknown> = {};
  
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.configSchema !== undefined) updateData.configSchema = JSON.stringify(input.configSchema);
  if (input.defaultConfig !== undefined) updateData.defaultConfig = JSON.stringify(input.defaultConfig);
  if (input.docsUrl !== undefined) updateData.docsUrl = input.docsUrl;
  if (input.logoUrl !== undefined) updateData.logoUrl = input.logoUrl;
  if (input.isActive !== undefined) updateData.isActive = input.isActive;
  
  const template = await prisma.apiTemplate.update({
    where: { id },
    data: updateData,
  });
  
  return mapToApiTemplate(template);
}

/**
 * Validates field type
 */
function validateFieldType(value: unknown, expectedType: string): boolean {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && !Array.isArray(value);
    default:
      return true;
  }
}

/**
 * Maps Prisma model to ApiTemplate type
 */
function mapToApiTemplate(template: {
  id: string;
  name: string;
  provider: string;
  type: string;
  category: string;
  description: string;
  configSchema: string;
  defaultConfig: string;
  docsUrl: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ApiTemplate {
  return {
    id: template.id,
    name: template.name,
    provider: template.provider,
    type: template.type as ConnectionType,
    category: template.category,
    description: template.description,
    configSchema: template.configSchema,
    defaultConfig: template.defaultConfig,
    docsUrl: template.docsUrl,
    logoUrl: template.logoUrl,
    isActive: template.isActive,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}
