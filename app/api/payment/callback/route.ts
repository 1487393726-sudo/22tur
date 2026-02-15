/**
 * 支付回调 API
 * 
 * POST /api/payment/callback
 * 
 * 功能：
 * - 接收第三方支付平台的回调通知
 * - 验证签名
 * - 更新支付状态
 * - 触发后续业务逻辑
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { PaymentStatus } from '@/types/payment'
import {
  handlePaymentSuccess as handlePaymentSuccessHandler,
  handlePaymentFailure as handlePaymentFailureHandler,
} from '@/lib/payment-status-handler'

// 回调数据验证 schema
const callbackSchema = z.object({
  transactionId: z.string().min(1, '交易ID不能为空'),
  orderId: z.string().min(1, '订单ID不能为空'),
  amount: z.number().positive('金额必须大于0'),
  status: z.nativeEnum(PaymentStatus),
  platformTransactionId: z.string().optional(), // 第三方平台交易ID
  paidAt: z.string().optional(), // 支付时间
  sign: z.string().optional(), // 签名
  // 其他第三方平台返回的字段
  [z.string()]: z.any()
})

/**
 * 验证支付平台签名
 * TODO: 根据不同的支付平台实现不同的签名验证逻辑
 */
function verifySignature(data: any, sign: string, method: string): boolean {
  // 这里应该根据支付方式调用对应的签名验证函数
  // 例如：
  // if (method === 'ALIPAY') {
  //   return verifyAlipaySign(data, sign)
  // } else if (method === 'WECHAT') {
  //   return verifyWechatSign(data, sign)
  // }
  
  // 临时实现：开发环境跳过签名验证
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  开发环境：跳过签名验证')
    return true
  }
  
  // 生产环境必须验证签名
  console.error('❌ 签名验证未实现')
  return false
}

// 支付成功和失败的业务逻辑处理已移至 lib/payment-status-handler.ts

export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求数据
    const body = await request.json()
    console.log('📥 收到支付回调:', body)

    // 2. 验证请求数据
    const validatedData = callbackSchema.parse(body)

    // 3. 查询支付交易
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: validatedData.transactionId }
    })

    if (!transaction) {
      console.error('❌ 交易不存在:', validatedData.transactionId)
      return NextResponse.json(
        { success: false, error: '交易不存在' },
        { status: 404 }
      )
    }

    // 4. 验证订单ID匹配
    if (transaction.orderId !== validatedData.orderId) {
      console.error('❌ 订单ID不匹配')
      return NextResponse.json(
        { success: false, error: '订单ID不匹配' },
        { status: 400 }
      )
    }

    // 5. 验证金额匹配
    if (Math.abs(transaction.amount - validatedData.amount) > 0.01) {
      console.error('❌ 金额不匹配')
      return NextResponse.json(
        { success: false, error: '金额不匹配' },
        { status: 400 }
      )
    }

    // 6. 验证签名（如果提供）
    if (validatedData.sign) {
      const isValidSign = verifySignature(
        validatedData,
        validatedData.sign,
        transaction.method
      )

      if (!isValidSign) {
        console.error('❌ 签名验证失败')
        return NextResponse.json(
          { success: false, error: '签名验证失败' },
          { status: 400 }
        )
      }
    }

    // 7. 检查交易状态（防止重复处理）
    if (transaction.status !== PaymentStatus.PENDING) {
      console.warn('⚠️  交易已处理，当前状态:', transaction.status)
      return NextResponse.json({
        success: true,
        message: '交易已处理',
        status: transaction.status
      })
    }

    // 8. 更新交易状态
    const updateData: any = {
      status: validatedData.status,
      transactionId: validatedData.platformTransactionId || transaction.transactionId
    }

    if (validatedData.status === PaymentStatus.SUCCESS) {
      updateData.paidAt = validatedData.paidAt ? new Date(validatedData.paidAt) : new Date()
    } else if (validatedData.status === PaymentStatus.FAILED) {
      updateData.failureReason = body.failureReason || '支付失败'
    }

    const updatedTransaction = await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: updateData
    })

    console.log('✅ 交易状态已更新:', updatedTransaction.status)

    // 9. 处理后续业务逻辑（使用状态处理器）
    if (validatedData.status === PaymentStatus.SUCCESS) {
      await handlePaymentSuccessHandler(updatedTransaction.id)
    } else if (validatedData.status === PaymentStatus.FAILED) {
      await handlePaymentFailureHandler(
        updatedTransaction.id,
        updateData.failureReason || '支付失败'
      )
    }

    // 10. 返回成功响应（根据不同支付平台返回不同格式）
    // 支付宝要求返回 "success"
    // 微信支付要求返回特定XML格式
    return NextResponse.json({
      success: true,
      message: 'OK'
    })

  } catch (error) {
    console.error('❌ 处理支付回调失败:', error)

    // Zod 验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '回调数据格式错误',
          details: error.errors
        },
        { status: 400 }
      )
    }

    // 其他错误
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '处理回调失败'
      },
      { status: 500 }
    )
  }
}
