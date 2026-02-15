/**
 * 创建支付交易 API
 * 
 * POST /api/payment/create
 * 
 * 功能：
 * - 创建支付交易记录
 * - 生成支付链接或二维码
 * - 返回支付信息
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { PaymentMethod, PaymentStatus } from '@/types/payment'
import { applyRateLimit, paymentCreateRateLimiter } from '@/lib/rate-limit'

// 请求验证 schema
const createPaymentSchema = z.object({
  orderId: z.string().min(1, '订单ID不能为空'),
  amount: z.number().positive('金额必须大于0'),
  currency: z.string().default('CNY'),
  method: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: '无效的支付方式' })
  }),
  metadata: z.record(z.any()).optional()
})

export async function POST(request: NextRequest) {
  // 应用速率限制
  const rateLimitResponse = await applyRateLimit(request, paymentCreateRateLimiter)
  if (rateLimitResponse) return rateLimitResponse

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
    const validatedData = createPaymentSchema.parse(body)

    // 4. 验证订单是否存在（可选，根据业务需求）
    // const order = await prisma.purchase.findUnique({
    //   where: { id: validatedData.orderId }
    // })
    // if (!order) {
    //   return NextResponse.json(
    //     { success: false, error: '订单不存在' },
    //     { status: 404 }
    //   )
    // }

    // 5. 检查是否已有待支付的交易
    const existingTransaction = await prisma.paymentTransaction.findFirst({
      where: {
        orderId: validatedData.orderId,
        userId: user.id,
        status: PaymentStatus.PENDING
      }
    })

    if (existingTransaction) {
      // 如果已有待支付交易，返回现有交易信息
      return NextResponse.json({
        success: true,
        transaction: existingTransaction,
        paymentUrl: existingTransaction.paymentUrl,
        qrCode: existingTransaction.qrCode,
        message: '已存在待支付交易'
      })
    }

    // 6. 创建支付交易记录
    const expiredAt = new Date(Date.now() + 30 * 60 * 1000) // 30分钟后过期

    const transaction = await prisma.paymentTransaction.create({
      data: {
        orderId: validatedData.orderId,
        userId: user.id,
        amount: validatedData.amount,
        currency: validatedData.currency,
        method: validatedData.method,
        status: PaymentStatus.PENDING,
        expiredAt,
        metadata: validatedData.metadata ? JSON.stringify(validatedData.metadata) : null
      }
    })

    // 7. 根据支付方式生成支付链接或二维码
    let paymentUrl = ''
    let qrCode = ''

    switch (validatedData.method) {
      case PaymentMethod.ALIPAY:
        // TODO: 调用支付宝API生成支付链接
        paymentUrl = `https://example.com/alipay/pay?transaction=${transaction.id}`
        qrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==` // 示例二维码
        break

      case PaymentMethod.WECHAT:
        // TODO: 调用微信支付API生成支付链接
        paymentUrl = `https://example.com/wechat/pay?transaction=${transaction.id}`
        qrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==` // 示例二维码
        break

      case PaymentMethod.BANK:
        // TODO: 调用银行支付API
        paymentUrl = `https://example.com/bank/pay?transaction=${transaction.id}`
        break

      case PaymentMethod.CREDIT_CARD:
        // TODO: 调用信用卡支付API
        paymentUrl = `https://example.com/card/pay?transaction=${transaction.id}`
        break
    }

    // 8. 更新交易记录，保存支付链接和二维码
    const updatedTransaction = await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        paymentUrl,
        qrCode
      }
    })

    // 9. 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        resource: 'PAYMENT',
        resourceId: transaction.id,
        details: JSON.stringify({
          orderId: validatedData.orderId,
          amount: validatedData.amount,
          method: validatedData.method
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
      paymentUrl,
      qrCode,
      message: '支付创建成功'
    })

  } catch (error) {
    console.error('创建支付失败:', error)

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
        error: error instanceof Error ? error.message : '创建支付失败'
      },
      { status: 500 }
    )
  }
}
