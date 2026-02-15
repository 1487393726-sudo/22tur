/**
 * 查询支付列表 API
 * 
 * GET /api/payment/list
 * 
 * 功能：
 * - 查询用户的支付交易列表
 * - 支持分页和筛选
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { PaymentStatus, PaymentMethod } from '@/types/payment'

export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户登录
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      )
    }

    // 2. 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 3. 解析查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') as PaymentStatus | null
    const method = searchParams.get('method') as PaymentMethod | null
    const orderId = searchParams.get('orderId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // 4. 构建查询条件
    const where: any = {
      userId: user.id
    }

    if (status) {
      where.status = status
    }

    if (method) {
      where.method = method
    }

    if (orderId) {
      where.orderId = {
        contains: orderId
      }
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // 5. 查询总数
    const total = await prisma.paymentTransaction.count({ where })

    // 6. 查询列表
    const transactions = await prisma.paymentTransaction.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // 7. 计算统计信息
    const stats = await prisma.paymentTransaction.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    })

    const statistics = {
      total: total,
      totalAmount: 0,
      successCount: 0,
      successAmount: 0,
      pendingCount: 0,
      pendingAmount: 0,
      failedCount: 0,
      refundedCount: 0,
      refundedAmount: 0
    }

    stats.forEach(stat => {
      const count = stat._count.id
      const amount = stat._sum.amount || 0

      statistics.totalAmount += amount

      switch (stat.status) {
        case PaymentStatus.SUCCESS:
          statistics.successCount = count
          statistics.successAmount = amount
          break
        case PaymentStatus.PENDING:
          statistics.pendingCount = count
          statistics.pendingAmount = amount
          break
        case PaymentStatus.FAILED:
          statistics.failedCount = count
          break
        case PaymentStatus.REFUNDED:
          statistics.refundedCount = count
          statistics.refundedAmount = amount
          break
      }
    })

    // 8. 返回响应
    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      statistics
    })

  } catch (error) {
    console.error('查询支付列表失败:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '查询支付列表失败'
      },
      { status: 500 }
    )
  }
}
