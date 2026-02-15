import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { videoSchema, formatValidationErrors } from '@/lib/homepage/validation';
import type { HomepageApiResponse, VideoSection } from '@/types/homepage';

// GET - 获取视频介绍区块内容
export async function GET(): Promise<NextResponse<HomepageApiResponse<VideoSection | null>>> {
  try {
    const video = await prisma.homepageVideo.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: video,
    });
  } catch (error) {
    console.error('Failed to fetch video section:', error);
    return NextResponse.json(
      { success: false, error: '获取视频介绍区块失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新视频介绍区块内容
export async function PUT(request: NextRequest): Promise<NextResponse<HomepageApiResponse<VideoSection>>> {
  try {
    const body = await request.json();
    
    // 验证输入
    const validation = videoSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: '验证失败', ...formatValidationErrors(validation.error) },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 查找现有记录
    const existing = await prisma.homepageVideo.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let video;
    if (existing) {
      video = await prisma.homepageVideo.update({
        where: { id: existing.id },
        data: {
          videoUrl: data.videoUrl,
          title: data.title,
          titleEn: data.titleEn,
          description: data.description ?? null,
          descriptionEn: data.descriptionEn ?? null,
          thumbnail: data.thumbnail ?? null,
          isActive: data.isActive ?? true,
        },
      });
    } else {
      video = await prisma.homepageVideo.create({
        data: {
          videoUrl: data.videoUrl,
          title: data.title,
          titleEn: data.titleEn,
          description: data.description ?? null,
          descriptionEn: data.descriptionEn ?? null,
          thumbnail: data.thumbnail ?? null,
          isActive: data.isActive ?? true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: video,
    });
  } catch (error) {
    console.error('Failed to update video section:', error);
    return NextResponse.json(
      { success: false, error: '更新视频介绍区块失败' },
      { status: 500 }
    );
  }
}
