/**
 * 取消支付 API
 * 
 * POST /api/payment/cancel
 * 
 * 功能：
 * - 取消待支付的交易
 * - 更新交易状态为已取消
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { PaymentStatus } from '@/types/payment'

// 请求验证 schema
const cancelPaymentSchema = z.object({
  transactionId: z.string().min(1, '交易ID不能为空'),
  reason: z.string().optional()
})

export async function POST(request: NextRequest) {
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

    // 3. 解析和验证请求数据
    const body = await request.json()
    const validatedData = cancelPaymentSchema.parse(body)

    // 4. 查询支付交易
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: validatedData.transactionId }
    })

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: '交易不存在' },
        { status: 404 }
      )
    }

    // 5. 验证权限（只能取消自己的交易）
    if (transaction.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: '无权取消此交易' },
        { status: 403 }
      )
    }

    // 6. 检查交易状态（只能取消待支付的交易）
    if (transaction.status !== PaymentStatus.PENDING) {
      return NextResponse.json(
        {
          success: false,
          error: `无法取消${transaction.status}状态的交易`
        },
        { status: 400 }
      )
    }

    // 7. TODO: 如果已经调用了第三方支付平台，需要调用取消接口
    // if (transaction.transactionId) {
    //   await cancelPaymentOnPlatform(transaction)
    // }

    // 8. 更新交易状态为已取消
    const updatedTransaction = await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: PaymentStatus.CANCELLED,
        failureReason: validatedData.reason || '用户取消'
      }
    })

    // 9. 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE',
        resource: 'PAYMENT',
        resourceId: transaction.id,
        details: JSON.stringify({
          action: 'cancel',
          reason: validatedData.reason || '用户取消',
          previousStatus: transaction.status
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'SUCCESS'
      }
    })

    // 10. 返回成功响应
    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      message: '支付已取消'
    })

  } catch (error) {
    console.error('取消支付失败:', error)

    // Zod 验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '请求参数错误',
          details: error.errors
        },
        { status: 400 }
      )
    }

    // 其他错误
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '取消支付失败'
      },
      { status: 500 }
    )
  }
}
