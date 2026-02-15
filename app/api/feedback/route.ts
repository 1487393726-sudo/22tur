// 用户反馈 API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// 提交反馈
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { type, content, images, contact } = await request.json();

    if (!type || !content) {
      return NextResponse.json(
        { success: false, message: '请填写反馈内容' },
        { status: 400 }
      );
    }

    if (content.length < 10) {
      return NextResponse.json(
        { success: false, message: '反馈内容至少10个字' },
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

    const feedback = await prisma.feedback.create({
      data: {
        userId: user.id,
        type,
        content,
        images: images || [],
        contact: contact || user.email,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      data: feedback,
      message: '反馈提交成功，感谢您的宝贵意见',
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// 获取反馈历史
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

    const feedbacks = await prisma.feedback.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    console.error('Get feedbacks error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
