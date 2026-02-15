/**
 * 支付调度器管理 API
 * 用于启动、停止和查询支付调度器状态
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  startPaymentScheduler,
  stopPaymentScheduler,
  getPaymentSchedulerStatus,
} from '@/lib/payment-scheduler'
import { checkExpiredTransactions } from '@/lib/payment-status-handler'
import { prisma } from '@/lib/prisma'

/**
 * GET - 获取调度器状态
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 验证管理员权限
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 })
    }

    // 获取调度器状态
    const status = getPaymentSchedulerStatus()

    // 获取最近的过期交易统计
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    const recentExpired = await prisma.paymentTransaction.count({
      where: {
        status: 'CANCELLED',
        failureReason: '支付超时',
        updatedAt: {
          gte: oneHourAgo,
        },
      },
    })

    const pendingCount = await prisma.paymentTransaction.count({
      where: {
        status: 'PENDING',
      },
    })

    const expiredPendingCount = await prisma.paymentTransaction.count({
      where: {
        status: 'PENDING',
        expiredAt: {
          lt: now,
        },
      },
    })

    return NextResponse.json({
      success: true,
      scheduler: status,
      statistics: {
        recentExpiredCount: recentExpired,
        pendingCount,
        expiredPendingCount,
      },
    })
  } catch (error) {
    console.error('获取调度器状态失败:', error)
    return NextResponse.json(
      { error: '获取调度器状态失败' },
      { status: 500 }
    )
  }
}

/**
 * POST - 控制调度器（启动/停止/立即执行）
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 验证管理员权限
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    let result: any = {}

    switch (action) {
      case 'start':
        startPaymentScheduler()
        result = { message: '调度器已启动' }
        break

      case 'stop':
        stopPaymentScheduler()
        result = { message: '调度器已停止' }
        break

      case 'execute':
        // 立即执行一次检查
        const checkResult = await checkExpiredTransactions()
        result = {
          message: '检查完成',
          ...checkResult,
        }
        break

      default:
        return NextResponse.json(
          { error: '无效的操作' },
          { status: 400 }
        )
    }

    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: `PAYMENT_SCHEDULER_${action.toUpperCase()}`,
        resource: 'PaymentScheduler',
        details: JSON.stringify({ action, result }),
        status: 'SUCCESS',
        risk: 'LOW',
      },
    })

    return NextResponse.json({
      success: true,
      ...result,
      scheduler: getPaymentSchedulerStatus(),
    })
  } catch (error) {
    console.error('控制调度器失败:', error)
    return NextResponse.json(
      { error: '控制调度器失败' },
      { status: 500 }
    )
  }
}
