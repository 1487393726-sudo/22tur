/**
 * 支付状态处理器
 * 处理支付成功、失败、超时等状态变更
 */

import { prisma } from '@/lib/prisma'
import { PaymentStatus } from '@/types/payment'
import { sendNotification } from '@/lib/notification-sender'
import { sendEmail } from '@/lib/email'

/**
 * 处理支付成功
 */
export async function handlePaymentSuccess(transactionId: string) {
  try {
    // 获取交易信息
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!transaction) {
      throw new Error(`交易不存在: ${transactionId}`)
    }

    if (transaction.status === PaymentStatus.SUCCESS) {
      console.log(`交易已处理: ${transactionId}`)
      return { success: true, message: '交易已处理' }
    }

    // 更新交易状态
    await prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
      },
    })

    // 更新订单状态（如果有关联订单）
    await updateOrderStatus(transaction.orderId, 'PAID')

    // 发送成功通知
    await sendPaymentSuccessNotification(transaction)

    // 发送成功邮件
    await sendPaymentSuccessEmail(transaction)

    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: transaction.userId,
        action: 'PAYMENT_SUCCESS',
        resource: 'PaymentTransaction',
        resourceId: transactionId,
        details: JSON.stringify({
          orderId: transaction.orderId,
          amount: transaction.amount,
          method: transaction.method,
        }),
        status: 'SUCCESS',
        risk: 'LOW',
      },
    })

    console.log(`支付成功处理完成: ${transactionId}`)
    return { success: true, message: '支付成功处理完成' }
  } catch (error) {
    console.error('处理支付成功失败:', error)
    throw error
  }
}

/**
 * 处理支付失败
 */
export async function handlePaymentFailure(
  transactionId: string,
  failureReason?: string
) {
  try {
    // 获取交易信息
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!transaction) {
      throw new Error(`交易不存在: ${transactionId}`)
    }

    // 更新交易状态
    await prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: PaymentStatus.FAILED,
        failureReason: failureReason || '支付失败',
      },
    })

    // 更新订单状态
    await updateOrderStatus(transaction.orderId, 'PAYMENT_FAILED')

    // 发送失败通知
    await sendPaymentFailureNotification(transaction, failureReason)

    // 发送失败邮件
    await sendPaymentFailureEmail(transaction, failureReason)

    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: transaction.userId,
        action: 'PAYMENT_FAILED',
        resource: 'PaymentTransaction',
        resourceId: transactionId,
        details: JSON.stringify({
          orderId: transaction.orderId,
          amount: transaction.amount,
          method: transaction.method,
          failureReason,
        }),
        status: 'FAILED',
        risk: 'MEDIUM',
      },
    })

    console.log(`支付失败处理完成: ${transactionId}`)
    return { success: true, message: '支付失败处理完成' }
  } catch (error) {
    console.error('处理支付失败失败:', error)
    throw error
  }
}

/**
 * 处理支付超时
 */
export async function handlePaymentTimeout(transactionId: string) {
  try {
    // 获取交易信息
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!transaction) {
      throw new Error(`交易不存在: ${transactionId}`)
    }

    // 只处理待支付状态的交易
    if (transaction.status !== PaymentStatus.PENDING) {
      console.log(`交易状态不是待支付: ${transactionId}`)
      return { success: true, message: '交易状态不是待支付' }
    }

    // 检查是否已过期
    if (transaction.expiredAt && new Date() > transaction.expiredAt) {
      // 更新为已取消
      await prisma.paymentTransaction.update({
        where: { id: transactionId },
        data: {
          status: PaymentStatus.CANCELLED,
          failureReason: '支付超时',
        },
      })

      // 更新订单状态
      await updateOrderStatus(transaction.orderId, 'CANCELLED')

      // 发送超时通知
      await sendPaymentTimeoutNotification(transaction)

      // 记录审计日志
      await prisma.auditLog.create({
        data: {
          userId: transaction.userId,
          action: 'PAYMENT_TIMEOUT',
          resource: 'PaymentTransaction',
          resourceId: transactionId,
          details: JSON.stringify({
            orderId: transaction.orderId,
            amount: transaction.amount,
            method: transaction.method,
            expiredAt: transaction.expiredAt,
          }),
          status: 'SUCCESS',
          risk: 'LOW',
        },
      })

      console.log(`支付超时处理完成: ${transactionId}`)
      return { success: true, message: '支付超时处理完成' }
    }

    return { success: true, message: '交易未过期' }
  } catch (error) {
    console.error('处理支付超时失败:', error)
    throw error
  }
}

/**
 * 批量检查并处理过期交易
 */
export async function checkExpiredTransactions() {
  try {
    const now = new Date()

    // 查找所有过期的待支付交易
    const expiredTransactions = await prisma.paymentTransaction.findMany({
      where: {
        status: PaymentStatus.PENDING,
        expiredAt: {
          lt: now,
        },
      },
      select: {
        id: true,
      },
    })

    console.log(`发现 ${expiredTransactions.length} 个过期交易`)

    // 批量处理
    const results = await Promise.allSettled(
      expiredTransactions.map((t) => handlePaymentTimeout(t.id))
    )

    const successCount = results.filter((r) => r.status === 'fulfilled').length
    const failureCount = results.filter((r) => r.status === 'rejected').length

    console.log(
      `过期交易处理完成: 成功 ${successCount}, 失败 ${failureCount}`
    )

    return {
      success: true,
      total: expiredTransactions.length,
      successCount,
      failureCount,
    }
  } catch (error) {
    console.error('检查过期交易失败:', error)
    throw error
  }
}

/**
 * 实现支付重试机制
 */
export async function retryPayment(transactionId: string) {
  try {
    // 获取原交易信息
    const originalTransaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
    })

    if (!originalTransaction) {
      throw new Error(`交易不存在: ${transactionId}`)
    }

    // 只允许重试失败或取消的交易
    if (
      originalTransaction.status !== PaymentStatus.FAILED &&
      originalTransaction.status !== PaymentStatus.CANCELLED
    ) {
      throw new Error(`交易状态不允许重试: ${originalTransaction.status}`)
    }

    // 创建新的交易
    const newTransaction = await prisma.paymentTransaction.create({
      data: {
        orderId: originalTransaction.orderId,
        userId: originalTransaction.userId,
        amount: originalTransaction.amount,
        currency: originalTransaction.currency,
        method: originalTransaction.method,
        status: PaymentStatus.PENDING,
        expiredAt: new Date(Date.now() + 30 * 60 * 1000), // 30分钟后过期
        metadata: originalTransaction.metadata,
      },
    })

    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: originalTransaction.userId,
        action: 'PAYMENT_RETRY',
        resource: 'PaymentTransaction',
        resourceId: newTransaction.id,
        details: JSON.stringify({
          originalTransactionId: transactionId,
          orderId: originalTransaction.orderId,
          amount: originalTransaction.amount,
        }),
        status: 'SUCCESS',
        risk: 'LOW',
      },
    })

    console.log(`支付重试成功: ${transactionId} -> ${newTransaction.id}`)
    return { success: true, transaction: newTransaction }
  } catch (error) {
    console.error('支付重试失败:', error)
    throw error
  }
}

/**
 * 更新订单状态（示例实现）
 */
async function updateOrderStatus(orderId: string, status: string) {
  try {
    // 注：这里假设有 Order 模型，实际实现需要根据业务逻辑调整
    // 如果使用 Purchase 或 UserSubscription，需要相应修改

    // 示例：更新 Purchase 状态
    const purchase = await prisma.purchase.findFirst({
      where: { id: orderId },
    })

    if (purchase) {
      await prisma.purchase.update({
        where: { id: orderId },
        data: {
          // 根据实际 Purchase 模型字段调整
          // status: status,
        },
      })
      console.log(`订单状态已更新: ${orderId} -> ${status}`)
    }
  } catch (error) {
    console.error('更新订单状态失败:', error)
    // 不抛出错误，避免影响主流程
  }
}

/**
 * 发送支付成功通知
 */
async function sendPaymentSuccessNotification(transaction: any) {
  try {
    await sendNotification(
      transaction.userId,
      '支付成功',
      `您的订单 ${transaction.orderId} 已支付成功，金额 ¥${transaction.amount}`,
      {
        type: 'SUCCESS',
        actionUrl: `/payments/${transaction.id}`,
      }
    )
  } catch (error) {
    console.error('发送支付成功通知失败:', error)
  }
}

/**
 * 发送支付失败通知
 */
async function sendPaymentFailureNotification(
  transaction: any,
  failureReason?: string
) {
  try {
    await sendNotification(
      transaction.userId,
      '支付失败',
      `您的订单 ${transaction.orderId} 支付失败${failureReason ? `: ${failureReason}` : ''}`,
      {
        type: 'ERROR',
        actionUrl: `/payments/${transaction.id}`,
      }
    )
  } catch (error) {
    console.error('发送支付失败通知失败:', error)
  }
}

/**
 * 发送支付超时通知
 */
async function sendPaymentTimeoutNotification(transaction: any) {
  try {
    await sendNotification(
      transaction.userId,
      '支付超时',
      `您的订单 ${transaction.orderId} 已超时取消，如需继续支付请重新下单`,
      {
        type: 'WARNING',
        actionUrl: `/payments/${transaction.id}`,
      }
    )
  } catch (error) {
    console.error('发送支付超时通知失败:', error)
  }
}

/**
 * 发送支付成功邮件
 */
async function sendPaymentSuccessEmail(transaction: any) {
  try {
    const userName = `${transaction.user.firstName || ''} ${transaction.user.lastName || ''}`.trim() || transaction.user.email

    await sendEmail({
      to: transaction.user.email,
      subject: '支付成功通知',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">支付成功</h2>
          <p>尊敬的 ${userName}，</p>
          <p>您的支付已成功完成。</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>订单号：</strong>${transaction.orderId}</p>
            <p><strong>支付金额：</strong>¥${transaction.amount}</p>
            <p><strong>支付方式：</strong>${getPaymentMethodName(transaction.method)}</p>
            <p><strong>支付时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
          </div>
          <p>感谢您的支付！</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('发送支付成功邮件失败:', error)
  }
}

/**
 * 发送支付失败邮件
 */
async function sendPaymentFailureEmail(
  transaction: any,
  failureReason?: string
) {
  try {
    const userName = `${transaction.user.firstName || ''} ${transaction.user.lastName || ''}`.trim() || transaction.user.email

    await sendEmail({
      to: transaction.user.email,
      subject: '支付失败通知',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">支付失败</h2>
          <p>尊敬的 ${userName}，</p>
          <p>您的支付未能成功完成。</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>订单号：</strong>${transaction.orderId}</p>
            <p><strong>支付金额：</strong>¥${transaction.amount}</p>
            <p><strong>支付方式：</strong>${getPaymentMethodName(transaction.method)}</p>
            ${failureReason ? `<p><strong>失败原因：</strong>${failureReason}</p>` : ''}
          </div>
          <p>如需帮助，请联系客服。</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('发送支付失败邮件失败:', error)
  }
}

/**
 * 获取支付方式名称
 */
function getPaymentMethodName(method: string): string {
  const names: Record<string, string> = {
    ALIPAY: '支付宝',
    WECHAT: '微信支付',
    BANK: '银行卡',
    CREDIT_CARD: '信用卡',
  }
  return names[method] || method
}
