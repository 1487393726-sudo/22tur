import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { theme } = await request.json();

    if (!theme || !['light', 'dark', 'system'].includes(theme)) {
      return NextResponse.json(
        { error: '无效的主题值' },
        { status: 400 }
      );
    }

    // 这里可以保存到数据库或 localStorage
    // 由于主题通常是客户端设置，我们只需返回成功
    // 如果需要持久化，可以在 User 表中添加 theme 字段

    return NextResponse.json({
      message: '主题已更新',
      theme,
    });
  } catch (error) {
    console.error('更新主题错误:', error);
    return NextResponse.json(
      { error: '更新主题失败' },
      { status: 500 }
    );
  }
}
