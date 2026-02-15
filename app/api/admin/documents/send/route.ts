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
    const { documentId, customerId } = data;

    if (!documentId || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 获取文档信息
    const document = await prisma.userDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
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

    // 创建通知发送到客户账户
    const notification = await prisma.notification.create({
      data: {
        userId: customerId,
        title: '新资料已发送',
        message: `您收到了一份新资料: ${document.title}`,
        type: 'INFO',
        priority: 'MEDIUM',
        isEmail: true,
        metadata: JSON.stringify({
          documentId: document.id,
          documentTitle: document.title,
          documentUrl: document.filePath,
          documentSize: document.fileSize,
          documentCategory: document.category,
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
        type: 'DOCUMENT',
        title: `资料发送: ${document.title}`,
        amount: 0,
        status: 'SUCCESS',
        description: `管理员发送了资料: ${document.title}`,
        metadata: JSON.stringify({
          documentId: document.id,
          documentTitle: document.title,
          documentSize: document.fileSize,
          sentBy: session.user.email,
          sentAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: '资料已发送到客户账户',
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
    console.error('Error sending document:', error);
    return NextResponse.json(
      { error: 'Failed to send document' },
      { status: 500 }
    );
  }
}
