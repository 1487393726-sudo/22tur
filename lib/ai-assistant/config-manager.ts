/**
 * AI Configuration Manager
 * Manages AI assistant configuration including model settings and API keys
 */

import { prisma } from '@/lib/prisma';
import { AIConfig } from './types';
import { encrypt, decrypt } from './encryption';

/**
 * Get AI configuration for a project
 * @param projectId - Project ID
 * @returns AI configuration or null if not found
 */
export async function getProjectAIConfig(projectId: string): Promise<AIConfig | null> {
  try {
    const config = await prisma.aIConfig.findUnique({
      where: { projectId },
    });

    if (!config) {
      return null;
    }

    return {
      id: config.id,
      projectId: config.projectId || undefined,
      modelProvider: config.modelProvider,
      modelName: config.modelName,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      systemPrompt: config.systemPrompt || undefined,
      isActive: config.isActive,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  } catch (error) {
    console.error('Failed to get AI config:', error);
    return null;
  }
}

/**
 * Get global AI configuration
 * @returns Global AI configuration or null if not found
 */
export async function getGlobalAIConfig(): Promise<AIConfig | null> {
  try {
    const config = await prisma.aIConfig.findFirst({
      where: { projectId: null },
    });

    if (!config) {
      return null;
    }

    return {
      id: config.id,
      projectId: config.projectId || undefined,
      modelProvider: config.modelProvider,
      modelName: config.modelName,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      systemPrompt: config.systemPrompt || undefined,
      isActive: config.isActive,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  } catch (error) {
    console.error('Failed to get global AI config:', error);
    return null;
  }
}

/**
 * Create or update AI configuration
 * @param projectId - Project ID (null for global config)
 * @param config - Configuration to save
 * @returns Created/updated configuration
 */
export async function saveAIConfig(
  projectId: string | null,
  config: Partial<AIConfig>
): Promise<AIConfig> {
  try {
    const existingConfig = projectId
      ? await prisma.aIConfig.findUnique({ where: { projectId } })
      : await prisma.aIConfig.findFirst({ where: { projectId: null } });

    const data = {
      modelProvider: config.modelProvider || 'openai',
      modelName: config.modelName || 'gpt-4',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens || 2000,
      systemPrompt: config.systemPrompt || null,
      isActive: config.isActive ?? true,
    };

    let result;
    if (existingConfig) {
      result = await prisma.aIConfig.update({
        where: { id: existingConfig.id },
        data,
      });
    } else {
      result = await prisma.aIConfig.create({
        data: {
          ...data,
          projectId,
        },
      });
    }

    return {
      id: result.id,
      projectId: result.projectId || undefined,
      modelProvider: result.modelProvider,
      modelName: result.modelName,
      temperature: result.temperature,
      maxTokens: result.maxTokens,
      systemPrompt: result.systemPrompt || undefined,
      isActive: result.isActive,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  } catch (error) {
    throw new Error(`Failed to save AI config: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get effective AI configuration (project-specific or global)
 * @param projectId - Project ID
 * @returns Effective AI configuration
 */
export async function getEffectiveAIConfig(projectId: string): Promise<AIConfig> {
  // Try to get project-specific config
  const projectConfig = await getProjectAIConfig(projectId);
  if (projectConfig && projectConfig.isActive) {
    return projectConfig;
  }

  // Fall back to global config
  const globalConfig = await getGlobalAIConfig();
  if (globalConfig && globalConfig.isActive) {
    return globalConfig;
  }

  // Return default config
  return {
    id: 'default',
    modelProvider: 'openai',
    modelName: process.env.OPENAI_MODEL || 'gpt-4',
    temperature: 0.7,
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Validate AI configuration
 * @param config - Configuration to validate
 * @returns Validation result
 */
export function validateAIConfig(config: Partial<AIConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.temperature !== undefined) {
    if (config.temperature < 0 || config.temperature > 2) {
      errors.push('Temperature must be between 0 and 2');
    }
  }

  if (config.maxTokens !== undefined) {
    if (config.maxTokens < 1 || config.maxTokens > 128000) {
      errors.push('Max tokens must be between 1 and 128000');
    }
  }

  if (config.modelProvider && !['openai', 'claude'].includes(config.modelProvider)) {
    errors.push('Invalid model provider');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
