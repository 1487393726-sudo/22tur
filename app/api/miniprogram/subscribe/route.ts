import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import { TEMPLATE_IDS, TemplateType } from '@/lib/miniprogram/subscribe-message';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

// 验证 token
function verifyToken(request: NextRequest): { userId: string } | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

// GET /api/miniprogram/subscribe - 获取订阅状态
export async function GET(request: NextRequest) {
  try {
    const auth = verifyToken(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    // 获取用户的订阅记录
    const subscriptions = await prisma.subscribeMessageRecord?.findMany({
      where: { userId: auth.userId },
      select: {
        templateId: true,
        templateType: true,
        status: true,
        subscribedAt: true,
      },
    }).catch(() => []);

    // 构建订阅状态映射
    const subscriptionMap: Record<string, boolean> = {};
    for (const key of Object.keys(TEMPLATE_IDS) as TemplateType[]) {
      const sub = subscriptions?.find(s => s.templateType === key);
      subscriptionMap[key] = sub?.status === 'SUBSCRIBED';
    }

    return NextResponse.json({
      success: true,
      data: {
        subscriptions: subscriptionMap,
        templateIds: TEMPLATE_IDS,
      },
    });
  } catch (error) {
    console.error('获取订阅状态失败:', error);
    return NextResponse.json(
      { success: false, error: '获取失败' },
      { status: 500 }
    );
  }
}

// POST /api/miniprogram/subscribe - 记录订阅结果
export async function POST(request: NextRequest) {
  try {
    const auth = verifyToken(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subscribeResults } = body;

    if (!subscribeResults || !Array.isArray(subscribeResults)) {
      return NextResponse.json(
        { success: false, error: '参数错误' },
        { status: 400 }
      );
    }

    // 批量更新订阅记录
    for (const result of subscribeResults) {
      const { templateId, status } = result;
      
      // 查找模板类型
      const templateType = Object.entries(TEMPLATE_IDS).find(
        ([, id]) => id === templateId
      )?.[0] as TemplateType | undefined;

      if (!templateType) continue;

      // 更新或创建订阅记录
      await prisma.subscribeMessageRecord?.upsert({
        where: {
          userId_templateId: {
            userId: auth.userId,
            templateId,
          },
        },
        update: {
          status: status === 'accept' ? 'SUBSCRIBED' : 'REJECTED',
          subscribedAt: status === 'accept' ? new Date() : undefined,
        },
        create: {
          userId: auth.userId,
          templateId,
          templateType,
          status: status === 'accept' ? 'SUBSCRIBED' : 'REJECTED',
          subscribedAt: status === 'accept' ? new Date() : undefined,
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: { updated: subscribeResults.length },
    });
  } catch (error) {
    console.error('记录订阅结果失败:', error);
    return NextResponse.json(
      { success: false, error: '记录失败' },
      { status: 500 }
    );
  }
}
