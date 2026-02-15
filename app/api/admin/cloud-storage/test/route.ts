/**
 * Cloud Storage Test Connection API
 * 云存储连接测试 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CloudStorageService, validateConfig } from '@/lib/cloud-storage';
import type { CloudStorageConfig } from '@/lib/cloud-storage';

/**
 * POST /api/admin/cloud-storage/test
 * 测试云存储连接
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
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
        {
          success: false,
          error: 'Invalid configuration',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // 创建服务实例并测试连接
    const config: CloudStorageConfig = {
      provider,
      region,
      bucket,
      accessKeyId,
      accessKeySecret,
      cdnDomain,
      endpoint,
      internal,
    };

    const service = new CloudStorageService(config);
    const connected = await service.testConnection();

    if (connected) {
      return NextResponse.json({
        success: true,
        message: 'Connection successful',
        warnings: validation.warnings,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Connection failed. Please check your credentials and bucket settings.',
      });
    }
  } catch (error) {
    console.error('Cloud storage connection test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      },
      { status: 500 }
    );
  }
}
