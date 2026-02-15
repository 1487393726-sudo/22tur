/**
 * Admin Print Quotes API
 * GET /api/admin/print-quotes - Get all quotes with filtering
 * Requirements: 2.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // 构建查询条件
    const where: Record<string, unknown> = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (dateFrom) {
      where.createdAt = {
        gte: new Date(dateFrom),
      };
    }

    if (dateTo) {
      if (where.createdAt) {
        (where.createdAt as Record<string, unknown>).lte = new Date(dateTo);
      } else {
        where.createdAt = {
          lte: new Date(dateTo),
        };
      }
    }

    // 获取总数
    const total = await prisma.printQuote.count({ where });

    // 获取分页数据
    const items = await prisma.printQuote.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
          },
        },
        files: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching admin quotes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
