// KYC 认证 API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { kycService } from '@/lib/kyc/kyc-service';

// 获取 KYC 状态
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }

    const kyc = await prisma.kycRecord.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        status: kyc?.status || 'NOT_SUBMITTED',
        kyc: kyc ? {
          id: kyc.id,
          status: kyc.status,
          realName: kyc.realName,
          idType: kyc.idType,
          submittedAt: kyc.createdAt,
          reviewedAt: kyc.reviewedAt,
          rejectReason: kyc.rejectReason,
          expiresAt: kyc.expiresAt,
        } : null,
      },
    });
  } catch (error) {
    console.error('Get KYC status error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// 提交 KYC 认证
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { realName, idType, idNumber, idFrontImage, idBackImage, selfieImage } = data;

    // 验证必填字段
    if (!realName || !idType || !idNumber || !idFrontImage) {
      return NextResponse.json(
        { success: false, message: '请填写完整信息' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查是否有待审核的 KYC
    const pendingKyc = await prisma.kycRecord.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING',
      },
    });

    if (pendingKyc) {
      return NextResponse.json(
        { success: false, message: '您已有待审核的认证申请' },
        { status: 400 }
      );
    }

    // 加密敏感信息
    const encryptedIdNumber = await kycService.encryptDocument(idNumber);

    // 创建 KYC 记录
    const kyc = await prisma.kycRecord.create({
      data: {
        userId: user.id,
        realName,
        idType,
        idNumber: encryptedIdNumber,
        idFrontImage,
        idBackImage,
        selfieImage,
        status: 'PENDING',
      },
    });

    // 更新用户 KYC 状态
    await prisma.user.update({
      where: { id: user.id },
      data: { kycStatus: 'PENDING' },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: kyc.id,
        status: kyc.status,
      },
      message: '提交成功，请等待审核',
    });
  } catch (error) {
    console.error('Submit KYC error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
