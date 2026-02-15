import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// GET /api/miniprogram/signatures - 获取签名请求列表
export async function GET(request: NextRequest) {
  try {
    const user = await getMiniprogramUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {
      recipientId: user.id
    };

    if (status) {
      where.status = status;
    }

    // 查询签名请求
    const [list, total, pendingCount] = await Promise.all([
      prisma.signatureRequest.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize
      }),
      prisma.signatureRequest.count({ where }),
      prisma.signatureRequest.count({
        where: {
          recipientId: user.id,
          status: 'pending'
        }
      })
    ]);

    const formattedList = list.map(item => ({
      id: item.id,
      title: item.title,
      senderName: item.sender?.name || '系统',
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      expireAt: item.expireAt?.toISOString()
    }));

    return NextResponse.json({
      success: true,
      list: formattedList,
      pendingCount,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('获取签名请求列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取列表失败' },
      { status: 500 }
    );
  }
}
