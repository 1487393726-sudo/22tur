import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { packageId, customerId, sendEmail } = data;

    if (!packageId || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 获取压缩包信息
    const pkg = await prisma.financialRecord.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // 获取客户信息
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // 生成下载链接
    const downloadLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/packages/${packageId}/download`;

    // 创建通知发送到客户账户
    const notification = await prisma.notification.create({
      data: {
        userId: customerId,
        title: '新压缩包已发送',
        message: `您收到了一份新压缩包: ${pkg.title}`,
        type: 'INFO',
        priority: 'MEDIUM',
        isEmail: sendEmail,
        metadata: JSON.stringify({
          packageId: pkg.id,
          packageTitle: pkg.title,
          packageUrl: pkg.filePath,
          downloadLink: downloadLink,
          packageSize: pkg.fileSize,
          customerCustomId: customer.customUserId,
          customerEmail: customer.email,
          sentAt: new Date().toISOString(),
        }),
      },
    });

    // 创建发送记录
    const sendRecord = await prisma.financialRecord.create({
      data: {
        userId: customerId,
        type: 'PACKAGE_SEND',
        title: `压缩包发送: ${pkg.title}`,
        amount: 0,
        status: 'SUCCESS',
        description: `管理员发送了压缩包: ${pkg.title}`,
        metadata: JSON.stringify({
          packageId: pkg.id,
          packageTitle: pkg.title,
          packageSize: pkg.fileSize,
          downloadLink: downloadLink,
          sendEmail: sendEmail,
          sentBy: session.user.email,
          sentAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: '压缩包已发送到客户账户' + (sendEmail ? '和邮箱' : ''),
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt,
      },
      record: {
        id: sendRecord.id,
        title: sendRecord.title,
        status: sendRecord.status,
      },
    });
  } catch (error) {
    console.error('Error sending package:', error);
    return NextResponse.json(
      { error: 'Failed to send package' },
      { status: 500 }
    );
  }
}
