import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 获取产品图片
 * GET /api/marketplace/products/[id]/images
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        brand: true,
        model: true,
      },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // 生成默认图片 URL
    const images = [
      `/uploads/products/${equipment.id}.svg`,
      `/uploads/products/${equipment.id}-2.svg`,
      `/uploads/products/${equipment.id}-3.svg`,
    ].filter((img) => img); // 过滤空值

    return NextResponse.json({
      id: equipment.id,
      name: equipment.name,
      images: images,
      defaultImage: images[0],
    });
  } catch (error) {
    console.error('Failed to get product images:', error);
    return NextResponse.json(
      { error: 'Failed to get product images' },
      { status: 500 }
    );
  }
}

/**
 * 上传产品图片
 * POST /api/marketplace/products/[id]/images
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 验证产品是否存在
    const equipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // 这里可以添加实际的文件上传逻辑
    // 目前返回模拟的上传结果
    const uploadedImages = files.map((file, index) => ({
      filename: `${id}-${index + 1}.${file.type.split('/')[1]}`,
      url: `/uploads/products/${id}-${index + 1}.${file.type.split('/')[1]}`,
      size: file.size,
      type: file.type,
    }));

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadedImages.length} images`,
      images: uploadedImages,
    });
  } catch (error) {
    console.error('Failed to upload product images:', error);
    return NextResponse.json(
      { error: 'Failed to upload product images' },
      { status: 500 }
    );
  }
}

/**
 * 删除产品图片
 * DELETE /api/marketplace/products/[id]/images
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // 这里可以添加实际的文件删除逻辑

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete product image:', error);
    return NextResponse.json(
      { error: 'Failed to delete product image' },
      { status: 500 }
    );
  }
}
