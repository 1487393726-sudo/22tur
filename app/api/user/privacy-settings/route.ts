import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 获取隐私设置
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 查找或创建隐私设置
    let privacySettings = await prisma.privacySettings.findUnique({
      where: { userId: user.id },
    });

    if (!privacySettings) {
      // 创建默认隐私设置
      privacySettings = await prisma.privacySettings.create({
        data: {
          userId: user.id,
          profileVisible: true,
          showOnlineStatus: true,
          allowSearchEngineIndex: false,
          allowMessages: true,
        },
      });
    }

    return NextResponse.json({
      privacySettings: {
        profileVisible: privacySettings.profileVisible,
        showOnlineStatus: privacySettings.showOnlineStatus,
        allowSearchEngineIndex: privacySettings.allowSearchEngineIndex,
        allowMessages: privacySettings.allowMessages,
      },
    });
  } catch (error) {
    console.error('获取隐私设置错误:', error);
    return NextResponse.json(
      { error: '获取隐私设置失败' },
      { status: 500 }
    );
  }
}

// 更新隐私设置
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const {
      profileVisible,
      showOnlineStatus,
      allowSearchEngineIndex,
      allowMessages,
    } = await request.json();

    // 更新或创建隐私设置
    const privacySettings = await prisma.privacySettings.upsert({
      where: { userId: user.id },
      update: {
        profileVisible: profileVisible ?? true,
        showOnlineStatus: showOnlineStatus ?? true,
        allowSearchEngineIndex: allowSearchEngineIndex ?? false,
        allowMessages: allowMessages ?? true,
      },
      create: {
        userId: user.id,
        profileVisible: profileVisible ?? true,
        showOnlineStatus: showOnlineStatus ?? true,
        allowSearchEngineIndex: allowSearchEngineIndex ?? false,
        allowMessages: allowMessages ?? true,
      },
    });

    return NextResponse.json({
      message: '隐私设置已更新',
      privacySettings: {
        profileVisible: privacySettings.profileVisible,
        showOnlineStatus: privacySettings.showOnlineStatus,
        allowSearchEngineIndex: privacySettings.allowSearchEngineIndex,
        allowMessages: privacySettings.allowMessages,
      },
    });
  } catch (error) {
    console.error('更新隐私设置错误:', error);
    return NextResponse.json(
      { error: '更新隐私设置失败' },
      { status: 500 }
    );
  }
}
