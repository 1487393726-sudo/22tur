/**
 * KYC Admin API - 单个记录操作
 * 查看详情和审核
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { kycService } from '@/lib/kyc';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - 获取 KYC 详情（解密数据）
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const record = await kycService.getDecryptedRecord(id);

    if (!record) {
      return NextResponse.json({ error: 'KYC 记录不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('获取 KYC 详情失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取失败' },
      { status: 500 }
    );
  }
}

// PUT - 审核 KYC
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, rejectionReason, expiresAt } = body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: '无效的审核状态' },
        { status: 400 }
      );
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return NextResponse.json(
        { error: '请填写拒绝原因' },
        { status: 400 }
      );
    }

    const record = await kycService.review({
      submissionId: id,
      reviewerId: session.user.id,
      status,
      rejectionReason,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: record,
      message: status === 'APPROVED' ? 'KYC 已通过' : 'KYC 已拒绝',
    });
  } catch (error) {
    console.error('审核 KYC 失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '审核失败' },
      { status: 500 }
    );
  }
}
