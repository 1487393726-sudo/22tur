/**
 * 查询支付状态 API
 * 
 * GET /api/payment/status/[id]
 * 
 * 功能：
 * - 查询支付交易状态
 * - 返回交易详情
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 3. 查询支付交易
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: params.id },
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

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: '交易不存在' },
        { status: 404 }
      )
    }

    // 4. 验证权限（只能查询自己的交易）
    if (transaction.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '无权访问此交易' },
        { status: 403 }
      )
    }

    // 5. 检查是否过期
    if (
      transaction.status === 'PENDING' &&
      transaction.expiredAt &&
      new Date() > transaction.expiredAt
    ) {
      // 自动取消过期的交易
      const updatedTransaction = await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'CANCELLED',
          failureReason: '支付超时'
        }
      })

      return NextResponse.json({
        success: true,
        ...updatedTransaction
      })
    }

    // 6. TODO: 如果是待支付状态，可以主动查询第三方支付平台的状态
    // if (transaction.status === 'PENDING' && transaction.transactionId) {
    //   const platformStatus = await queryPaymentPlatform(transaction)
    //   if (platformStatus !== transaction.status) {
    //     // 更新状态
    //     const updatedTransaction = await prisma.paymentTransaction.update({
    //       where: { id: transaction.id },
    //       data: { status: platformStatus }
    //     })
    //     return NextResponse.json({ success: true, ...updatedTransaction })
    //   }
    // }

    // 7. 返回交易信息
    return NextResponse.json({
      success: true,
      ...transaction
    })

  } catch (error) {
    console.error('查询支付状态失败:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '查询支付状态失败'
      },
      { status: 500 }
    )
  }
}
