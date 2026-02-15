/**
 * Cloud Storage Configuration API
 * 云存储配置管理 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { CloudStorageService, validateConfig } from '@/lib/cloud-storage';
import type { CloudStorageConfig, CloudStorageProvider } from '@/lib/cloud-storage';

/**
 * GET /api/admin/cloud-storage
 * 获取云存储配置列表
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const configs = await prisma.apiConnection.findMany({
      where: {
        type: 'STORAGE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 解析配置并隐藏敏感信息
    const result = configs.map((config) => {
      const configData = config.encryptedConfig ? JSON.parse(config.encryptedConfig) : {};
      return {
        id: config.id,
        name: config.name,
        provider: config.provider,
        region: configData.region,
        bucket: configData.bucket,
        cdnDomain: configData.cdnDomain,
        status: config.status,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      };
    });

    return NextResponse.json({ configs: result });
  } catch (error) {
    console.error('Failed to get cloud storage configs:', error);
    return NextResponse.json(
      { error: 'Failed to get configurations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/cloud-storage
 * 创建云存储配置
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      provider,
      region,
      bucket,
      accessKeyId,
      accessKeySecret,
      cdnDomain,
      endpoint,
      internal,
    } = body;

    // 验证配置
    const validation = validateConfig({
      provider,
      region,
      bucket,
      accessKeyId,
      accessKeySecret,
      cdnDomain,
      endpoint,
      internal,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: validation.errors },
        { status: 400 }
      );
    }

    // 构建凭证
    const encryptedConfig = JSON.stringify({
      region,
      bucket,
      accessKeyId,
      accessKeySecret,
      cdnDomain,
      endpoint,
      internal,
    });

    // 创建配置
    const config = await prisma.apiConnection.create({
      data: {
        name: name || `${provider}-${bucket}`,
        provider,
        type: 'STORAGE',
        encryptedConfig,
        status: 'ACTIVE',
        createdBy: session.user.email || 'system',
      },
    });

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        name: config.name,
        provider: config.provider,
        region,
        bucket,
        cdnDomain,
        status: config.status,
      },
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error('Failed to create cloud storage config:', error);
    return NextResponse.json(
      { error: 'Failed to create configuration' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/cloud-storage
 * 更新云存储配置
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Configuration ID is required' }, { status: 400 });
    }

    // 获取现有配置
    const existingConfig = await prisma.apiConnection.findUnique({
      where: { id },
    });

    if (!existingConfig || existingConfig.type !== 'STORAGE') {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    const currentCredentials = existingConfig.encryptedConfig
      ? JSON.parse(existingConfig.encryptedConfig)
      : {};

    // 合并更新
    const newCredentials = {
      ...currentCredentials,
      region: updates.region ?? currentCredentials.region,
      bucket: updates.bucket ?? currentCredentials.bucket,
      accessKeyId: updates.accessKeyId ?? currentCredentials.accessKeyId,
      accessKeySecret: updates.accessKeySecret ?? currentCredentials.accessKeySecret,
      cdnDomain: updates.cdnDomain ?? currentCredentials.cdnDomain,
      endpoint: updates.endpoint ?? currentCredentials.endpoint,
      internal: updates.internal ?? currentCredentials.internal,
    };

    // 验证更新后的配置
    const validation = validateConfig({
      provider: updates.provider ?? existingConfig.provider,
      ...newCredentials,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: validation.errors },
        { status: 400 }
      );
    }

    // 更新配置
    const updatedConfig = await prisma.apiConnection.update({
      where: { id },
      data: {
        name: updates.name ?? existingConfig.name,
        provider: updates.provider ?? existingConfig.provider,
        encryptedConfig: JSON.stringify(newCredentials),
        status: updates.status ?? existingConfig.status,
      },
    });

    return NextResponse.json({
      success: true,
      config: {
        id: updatedConfig.id,
        name: updatedConfig.name,
        provider: updatedConfig.provider,
        region: newCredentials.region,
        bucket: newCredentials.bucket,
        cdnDomain: newCredentials.cdnDomain,
        status: updatedConfig.status,
      },
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error('Failed to update cloud storage config:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/cloud-storage
 * 删除云存储配置
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Configuration ID is required' }, { status: 400 });
    }

    // 检查配置是否存在
    const config = await prisma.apiConnection.findUnique({
      where: { id },
    });

    if (!config || config.type !== 'STORAGE') {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    // 删除配置
    await prisma.apiConnection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete cloud storage config:', error);
    return NextResponse.json(
      { error: 'Failed to delete configuration' },
      { status: 500 }
    );
  }
}
