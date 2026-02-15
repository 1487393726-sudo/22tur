import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// GET /api/miniprogram/signatures/[id] - 获取签名详情
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

    const signatureRequest = await prisma.signatureRequest.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        },
        history: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
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
        { success: false, error: '无权访问' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      id: signatureRequest.id,
      title: signatureRequest.title,
      senderName: signatureRequest.sender?.name || '系统',
      status: signatureRequest.status,
      createdAt: signatureRequest.createdAt.toISOString(),
      expireAt: signatureRequest.expireAt?.toISOString(),
      signedAt: signatureRequest.signedAt?.toISOString(),
      rejectReason: signatureRequest.rejectReason,
      previewImage: signatureRequest.previewImage,
      signatureImage: signatureRequest.signatureImage,
      documentUrl: signatureRequest.documentUrl,
      history: signatureRequest.history.map(h => ({
        id: h.id,
        action: h.action,
        time: h.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('获取签名详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取详情失败' },
      { status: 500 }
    );
  }
}

// POST /api/miniprogram/signatures/[id] - 提交签名
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
    const { signatureData } = body;

    if (!signatureData) {
      return NextResponse.json(
        { success: false, error: '签名数据不能为空' },
        { status: 400 }
      );
    }

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

    // 检查是否过期
    if (signatureRequest.expireAt && new Date() > signatureRequest.expireAt) {
      await prisma.signatureRequest.update({
        where: { id },
        data: { status: 'expired' }
      });
      return NextResponse.json(
        { success: false, error: '签名请求已过期' },
        { status: 400 }
      );
    }

    // 更新签名状态
    await prisma.$transaction([
      prisma.signatureRequest.update({
        where: { id },
        data: {
          status: 'signed',
          signatureImage: signatureData,
          signedAt: new Date()
        }
      }),
      prisma.signatureHistory.create({
        data: {
          signatureRequestId: id,
          action: '完成签署',
          userId: user.id
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: '签署成功'
    });
  } catch (error) {
    console.error('提交签名失败:', error);
    return NextResponse.json(
      { success: false, error: '签署失败' },
      { status: 500 }
    );
  }
}
