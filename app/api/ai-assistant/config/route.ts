/**
 * AI Assistant Configuration API
 * Handles AI configuration management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  getProjectAIConfig,
  getGlobalAIConfig,
  getEffectiveAIConfig,
  saveAIConfig,
  validateAIConfig,
} from '@/lib/ai-assistant/config-manager';
import { getOpenAIProvider } from '@/lib/ai-assistant/openai-integration';

/**
 * GET /api/ai-assistant/config
 * Get AI configuration
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const configType = searchParams.get('type') || 'effective'; // effective, project, global

    let config;

    if (configType === 'project' && projectId) {
      config = await getProjectAIConfig(projectId);
    } else if (configType === 'global') {
      config = await getGlobalAIConfig();
    } else if (projectId) {
      config = await getEffectiveAIConfig(projectId);
    } else {
      config = await getGlobalAIConfig();
    }

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('GET /api/ai-assistant/config error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai-assistant/config
 * Create or update AI configuration
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    
    // Handle validation requests
    if (url.pathname.includes('/validate')) {
      const provider = getOpenAIProvider();
      const isValid = await provider.validateConnection();

      if (!isValid) {
        return NextResponse.json(
          { error: 'Failed to connect to LLM provider' },
          { status: 400 }
        );
      }

      const modelInfo = await provider.getModelInfo();

      return NextResponse.json({
        valid: true,
        provider: provider.name,
        modelInfo,
      });
    }

    // Handle configuration updates
    const body = await request.json();
    const { projectId, modelProvider, modelName, temperature, maxTokens, systemPrompt } = body;

    // Validate configuration
    const validation = validateAIConfig({
      modelProvider,
      modelName,
      temperature,
      maxTokens,
      systemPrompt,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid configuration', errors: validation.errors },
        { status: 400 }
      );
    }

    // Save configuration
    const config = await saveAIConfig(projectId || null, {
      modelProvider,
      modelName,
      temperature,
      maxTokens,
      systemPrompt,
      isActive: true,
    });

    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    console.error('POST /api/ai-assistant/config error:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ai-assistant/config
 * Update AI configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, modelProvider, modelName, temperature, maxTokens, systemPrompt } = body;

    // Validate configuration
    const validation = validateAIConfig({
      modelProvider,
      modelName,
      temperature,
      maxTokens,
      systemPrompt,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid configuration', errors: validation.errors },
        { status: 400 }
      );
    }

    // Save configuration
    const config = await saveAIConfig(projectId || null, {
      modelProvider,
      modelName,
      temperature,
      maxTokens,
      systemPrompt,
      isActive: true,
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('PUT /api/ai-assistant/config error:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
