import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// GET /api/miniprogram/addresses/[id] - 获取地址详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getMiniprogramUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const { id } = params;

    const address = await prisma.userAddress.findUnique({
      where: { id }
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: '地址不存在' },
        { status: 404 }
      );
    }

    if (address.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: '无权访问' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      ...address
    });
  } catch (error) {
    console.error('获取地址详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取详情失败' },
      { status: 500 }
    );
  }
}

// PUT /api/miniprogram/addresses/[id] - 更新地址
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getMiniprogramUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, phone, province, city, district, address, isDefault, latitude, longitude } = body;

    const existingAddress = await prisma.userAddress.findUnique({
      where: { id }
    });

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: '地址不存在' },
        { status: 404 }
      );
    }

    if (existingAddress.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: '无权操作' },
        { status: 403 }
      );
    }

    // 如果设为默认，先取消其他默认地址
    if (isDefault && !existingAddress.isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    await prisma.userAddress.update({
      where: { id },
      data: {
        name,
        phone,
        province,
        city,
        district,
        address,
        isDefault,
        latitude,
        longitude
      }
    });

    return NextResponse.json({
      success: true,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新地址失败:', error);
    return NextResponse.json(
      { success: false, error: '更新失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/miniprogram/addresses/[id] - 删除地址
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getMiniprogramUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const { id } = params;

    const address = await prisma.userAddress.findUnique({
      where: { id }
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: '地址不存在' },
        { status: 404 }
      );
    }

    if (address.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: '无权操作' },
        { status: 403 }
      );
    }

    await prisma.userAddress.delete({
      where: { id }
    });

    // 如果删除的是默认地址，将第一个地址设为默认
    if (address.isDefault) {
      const firstAddress = await prisma.userAddress.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });

      if (firstAddress) {
        await prisma.userAddress.update({
          where: { id: firstAddress.id },
          data: { isDefault: true }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除地址失败:', error);
    return NextResponse.json(
      { success: false, error: '删除失败' },
      { status: 500 }
    );
  }
}
