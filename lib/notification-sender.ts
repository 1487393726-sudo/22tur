/**
 * 通知发送模块
 * 用于发送各类通知（邮件、推送、站内消息等）
 */

import { prisma } from './prisma'

export interface NotificationOptions {
  userId: string
  title: string
  message: string
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'TASK' | 'EVENT' | 'REMINDER'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  actionUrl?: string
  metadata?: Record<string, any>
  sendEmail?: boolean
  sendPush?: boolean
}

/**
 * 发送通知
 */
export async function sendNotification(
  userId: string,
  title: string,
  message: string,
  options: Partial<NotificationOptions> = {}
): Promise<void> {
  try {
    // 创建站内通知
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: options.type || 'INFO',
        priority: options.priority || 'LOW',
        actionUrl: options.actionUrl,
        metadata: options.metadata ? JSON.stringify(options.metadata) : null,
        isEmail: options.sendEmail || false,
        isPush: options.sendPush || false,
      }
    })

    // 如果需要发送邮件
    if (options.sendEmail) {
      await sendEmailNotification(userId, title, message)
    }

    // 如果需要发送推送
    if (options.sendPush) {
      await sendPushNotification(userId, title, message)
    }
  } catch (error) {
    console.error('发送通知失败:', error)
  }
}

/**
 * 发送邮件通知
 */
async function sendEmailNotification(
  userId: string,
  title: string,
  message: string
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true }
    })

    if (!user?.email) {
      console.warn(`用户 ${userId} 没有邮箱地址`)
      return
    }

    // TODO: 实现实际的邮件发送逻辑
    console.log(`发送邮件通知到 ${user.email}: ${title}`)
  } catch (error) {
    console.error('发送邮件通知失败:', error)
  }
}

/**
 * 发送推送通知
 */
async function sendPushNotification(
  userId: string,
  title: string,
  message: string
): Promise<void> {
  try {
    // TODO: 实现实际的推送通知逻辑
    console.log(`发送推送通知到用户 ${userId}: ${title}`)
  } catch (error) {
    console.error('发送推送通知失败:', error)
  }
}

/**
 * 批量发送通知
 */
export async function sendBulkNotifications(
  userIds: string[],
  title: string,
  message: string,
  options: Partial<NotificationOptions> = {}
): Promise<void> {
  await Promise.all(
    userIds.map(userId => sendNotification(userId, title, message, options))
  )
}

/**
 * 标记通知为已读
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { 
      isRead: true,
      readAt: new Date()
    }
  })
}

/**
 * 获取用户未读通知数量
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return await prisma.notification.count({
    where: {
      userId,
      isRead: false
    }
  })
}
