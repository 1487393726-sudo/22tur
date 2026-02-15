/**
 * 印刷通知服务
 * Requirements: 1.4, 2.3, 2.4, 4.4
 */

import { prisma } from '@/lib/prisma';
import { QuoteStatus, OrderStatus } from './types';

// 通知类型
export type NotificationType =
  | 'quote_submitted'      // 询价已提交
  | 'quote_received'       // 报价已收到
  | 'quote_rejected'       // 报价已拒绝
  | 'quote_expired'        // 报价已过期
  | 'quote_expiry_reminder' // 报价过期提醒
  | 'order_paid'           // 订单已支付
  | 'order_status_changed' // 订单状态已更改
  | 'order_shipped'        // 订单已发货
  | 'order_delivered';     // 订单已送达

// 通知渠道
export type NotificationChannel = 'system' | 'email' | 'sms' | 'wechat' | 'push';

/**
 * 创建系统内通知
 */
export async function createNotification(
  recipientId: string,
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    quoteId?: string;
    orderId?: string;
    channels?: NotificationChannel[];
  }
): Promise<string> {
  const channels = options?.channels || ['system'];

  const notification = await prisma.printNotification.create({
    data: {
      recipientId,
      type,
      title,
      message,
      quoteId: options?.quoteId,
      orderId: options?.orderId,
      channels: JSON.stringify(channels),
    },
  });

  return notification.id;
}

/**
 * 获取用户通知列表
 */
export async function getUserNotifications(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    page?: number;
    pageSize?: number;
  }
): Promise<{ items: any[]; total: number }> {
  const { unreadOnly = false, page = 1, pageSize = 20 } = options || {};

  const where: Record<string, unknown> = { recipientId: userId };
  if (unreadOnly) {
    where.isRead = false;
  }

  const [items, total] = await Promise.all([
    prisma.printNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.printNotification.count({ where }),
  ]);

  return { items, total };
}

/**
 * 标记通知为已读
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await prisma.printNotification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * 标记所有通知为已读
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await prisma.printNotification.updateMany({
    where: {
      recipientId: userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * 获取未读通知数
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.printNotification.count({
    where: {
      recipientId: userId,
      isRead: false,
    },
  });
}

/**
 * 询价提交通知
 */
export async function notifyQuoteSubmitted(
  customerId: string,
  quoteNumber: string,
  quoteId: string
): Promise<void> {
  // 通知客户
  await createNotification(
    customerId,
    'quote_submitted',
    '询价已提交',
    `您的询价 ${quoteNumber} 已成功提交，我们会尽快为您报价。`,
    {
      quoteId,
      channels: ['system', 'email'],
    }
  );

  // 通知管理员
  const adminUsers = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { id: true },
  });

  for (const admin of adminUsers) {
    await createNotification(
      admin.id,
      'quote_submitted',
      '新询价提交',
      `客户提交了新的询价 ${quoteNumber}，请及时处理。`,
      {
        quoteId,
        channels: ['system'],
      }
    );
  }
}

/**
 * 报价已收到通知
 */
export async function notifyQuoteReceived(
  customerId: string,
  quoteNumber: string,
  quoteId: string,
  totalPrice: number,
  validUntil: Date
): Promise<void> {
  const daysUntilExpiry = Math.ceil(
    (validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  await createNotification(
    customerId,
    'quote_received',
    '报价已收到',
    `您的询价 ${quoteNumber} 已报价，总价：¥${(totalPrice / 100).toFixed(2)}，有效期至 ${validUntil.toLocaleDateString()}（${daysUntilExpiry} 天）。`,
    {
      quoteId,
      channels: ['system', 'email', 'sms'],
    }
  );
}

/**
 * 报价已拒绝通知
 */
export async function notifyQuoteRejected(
  customerId: string,
  quoteNumber: string,
  quoteId: string,
  reason: string
): Promise<void> {
  await createNotification(
    customerId,
    'quote_rejected',
    '报价已拒绝',
    `您的询价 ${quoteNumber} 已被拒绝。原因：${reason}`,
    {
      quoteId,
      channels: ['system', 'email'],
    }
  );
}

/**
 * 报价已过期通知
 */
export async function notifyQuoteExpired(
  customerId: string,
  quoteNumber: string,
  quoteId: string
): Promise<void> {
  await createNotification(
    customerId,
    'quote_expired',
    '报价已过期',
    `您的询价 ${quoteNumber} 的报价已过期，如需继续，请重新提交询价。`,
    {
      quoteId,
      channels: ['system', 'email'],
    }
  );
}

/**
 * 报价过期提醒通知（24小时前）
 */
export async function notifyQuoteExpiryReminder(
  customerId: string,
  quoteNumber: string,
  quoteId: string,
  validUntil: Date
): Promise<void> {
  await createNotification(
    customerId,
    'quote_expiry_reminder',
    '报价即将过期',
    `您的询价 ${quoteNumber} 的报价将在 ${validUntil.toLocaleString()} 过期，请及时处理。`,
    {
      quoteId,
      channels: ['system', 'email', 'sms'],
    }
  );
}

/**
 * 订单已支付通知
 */
export async function notifyOrderPaid(
  customerId: string,
  orderNumber: string,
  orderId: string,
  totalPrice: number
): Promise<void> {
  // 通知客户
  await createNotification(
    customerId,
    'order_paid',
    '订单已支付',
    `订单 ${orderNumber} 已支付成功，金额：¥${(totalPrice / 100).toFixed(2)}，开始生产。`,
    {
      orderId,
      channels: ['system', 'email', 'sms'],
    }
  );

  // 通知管理员
  const adminUsers = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { id: true },
  });

  for (const admin of adminUsers) {
    await createNotification(
      admin.id,
      'order_paid',
      '新订单已支付',
      `订单 ${orderNumber} 已支付，金额：¥${(totalPrice / 100).toFixed(2)}`,
      {
        orderId,
        channels: ['system'],
      }
    );
  }
}

/**
 * 订单状态已更改通知
 */
export async function notifyOrderStatusChanged(
  customerId: string,
  orderNumber: string,
  orderId: string,
  newStatus: OrderStatus,
  trackingNumber?: string
): Promise<void> {
  const statusLabels: Record<OrderStatus, string> = {
    pending_payment: '待支付',
    paid: '已支付',
    in_production: '生产中',
    shipped: '已发货',
    delivered: '已送达',
    completed: '已完成',
    cancelled: '已取消',
  };

  let message = `订单 ${orderNumber} 状态已更新为：${statusLabels[newStatus]}`;
  if (trackingNumber && newStatus === 'shipped') {
    message += `，物流单号：${trackingNumber}`;
  }

  await createNotification(
    customerId,
    'order_status_changed',
    '订单状态已更新',
    message,
    {
      orderId,
      channels: ['system', 'email', 'sms'],
    }
  );
}

/**
 * 订单已发货通知
 */
export async function notifyOrderShipped(
  customerId: string,
  orderNumber: string,
  orderId: string,
  trackingNumber: string
): Promise<void> {
  await createNotification(
    customerId,
    'order_shipped',
    '订单已发货',
    `订单 ${orderNumber} 已发货，物流单号：${trackingNumber}，请及时查收。`,
    {
      orderId,
      channels: ['system', 'email', 'sms'],
    }
  );
}

/**
 * 订单已送达通知
 */
export async function notifyOrderDelivered(
  customerId: string,
  orderNumber: string,
  orderId: string
): Promise<void> {
  await createNotification(
    customerId,
    'order_delivered',
    '订单已送达',
    `订单 ${orderNumber} 已送达，感谢您的购买！`,
    {
      orderId,
      channels: ['system', 'email'],
    }
  );
}
