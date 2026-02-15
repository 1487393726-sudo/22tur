import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// PUT /api/miniprogram/addresses/[id]/default - 设置默认地址
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

    // 使用事务确保只有一个默认地址
    await prisma.$transaction([
      // 取消所有默认地址
      prisma.userAddress.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false }
      }),
      // 设置新的默认地址
      prisma.userAddress.update({
        where: { id },
        data: { isDefault: true }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: '设置成功'
    });
  } catch (error) {
    console.error('设置默认地址失败:', error);
    return NextResponse.json(
      { success: false, error: '设置失败' },
      { status: 500 }
    );
  }
}
