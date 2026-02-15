import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// POST /api/miniprogram/signatures/[id]/reject - 拒绝签名
export async function POST(
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
    const { reason } = body;

    // 查询签名请求
    const signatureRequest = await prisma.signatureRequest.findUnique({
      where: { id }
    });

    if (!signatureRequest) {
      return NextResponse.json(
        { success: false, error: '签名请求不存在' },
        { status: 404 }
      );
    }

    // 验证权限
    if (signatureRequest.recipientId !== user.id) {
      return NextResponse.json(
        { success: false, error: '无权操作' },
        { status: 403 }
      );
    }

    // 检查状态
    if (signatureRequest.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: '该文档已处理' },
        { status: 400 }
      );
    }

    // 更新为拒绝状态
    await prisma.$transaction([
      prisma.signatureRequest.update({
        where: { id },
        data: {
          status: 'rejected',
          rejectReason: reason || '用户拒绝签署',
          rejectedAt: new Date()
        }
      }),
      prisma.signatureHistory.create({
        data: {
          signatureRequestId: id,
          action: reason ? `拒绝签署: ${reason}` : '拒绝签署',
          userId: user.id
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: '已拒绝签署'
    });
  } catch (error) {
    console.error('拒绝签名失败:', error);
    return NextResponse.json(
      { success: false, error: '操作失败' },
      { status: 500 }
    );
  }
}
