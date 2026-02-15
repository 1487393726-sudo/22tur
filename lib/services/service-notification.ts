import { prisma } from "@/lib/prisma";
import {
  sendServiceOrderUpdateMessage,
  sendServiceMilestoneUpdateMessage,
  sendServiceDeliverableMessage,
} from "@/lib/miniprogram/subscribe-message";

export type ServiceStatusType = 
  | "ORDER_CREATED"
  | "ORDER_CONFIRMED"
  | "ORDER_IN_PROGRESS"
  | "ORDER_COMPLETED"
  | "ORDER_CANCELLED"
  | "MILESTONE_STARTED"
  | "MILESTONE_COMPLETED"
  | "DELIVERABLE_UPLOADED"
  | "PAYMENT_RECEIVED"
  | "CONTRACT_READY";

interface NotificationData {
  userId: string;
  orderId: string;
  orderNumber: string;
  type: ServiceStatusType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * 创建服务状态更新通知
 */
export async function createServiceNotification(data: NotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: "SERVICE_UPDATE",
        priority: "MEDIUM",
        actionUrl: `/my-services/${data.orderId}`,
        metadata: JSON.stringify({
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          statusType: data.type,
          ...data.metadata,
        }),
      },
    });

    return notification;
  } catch (error) {
    console.error("创建服务通知失败:", error);
    throw error;
  }
}

/**
 * 订单状态变更通知
 */
export async function notifyOrderStatusChange(
  orderId: string,
  newStatus: string,
  previousStatus?: string
) {
  const order = await prisma.serviceOrder.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      clientId: true,
      package: {
        select: { name: true },
      },
    },
  });

  if (!order) return;

  const statusMessages: Record<string, { title: string; message: string; type: ServiceStatusType }> = {
    CONFIRMED: {
      title: "订单已确认",
      message: `您的订单 ${order.orderNumber} 已确认，我们将尽快开始服务。`,
      type: "ORDER_CONFIRMED",
    },
    IN_PROGRESS: {
      title: "服务已开始",
      message: `您的订单 ${order.orderNumber} 已开始处理，请关注进度更新。`,
      type: "ORDER_IN_PROGRESS",
    },
    COMPLETED: {
      title: "服务已完成",
      message: `您的订单 ${order.orderNumber} 已完成，感谢您的信任！`,
      type: "ORDER_COMPLETED",
    },
    CANCELLED: {
      title: "订单已取消",
      message: `您的订单 ${order.orderNumber} 已取消。`,
      type: "ORDER_CANCELLED",
    },
  };

  const statusInfo = statusMessages[newStatus];
  if (!statusInfo) return;

  // 创建站内通知
  const notification = await createServiceNotification({
    userId: order.clientId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    type: statusInfo.type,
    title: statusInfo.title,
    message: statusInfo.message,
    metadata: {
      previousStatus,
      newStatus,
      packageName: order.package?.name,
    },
  });

  // 发送微信订阅消息
  try {
    await sendServiceOrderUpdateMessage(
      order.clientId,
      order.orderNumber,
      order.package?.name || "服务订单",
      newStatus,
      order.id
    );
  } catch (error) {
    console.error("发送订阅消息失败:", error);
  }

  return notification;
}

/**
 * 里程碑状态变更通知
 */
export async function notifyMilestoneStatusChange(
  milestoneId: string,
  newStatus: string
) {
  const milestone = await prisma.orderMilestone.findUnique({
    where: { id: milestoneId },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          clientId: true,
        },
      },
    },
  });

  if (!milestone) return;

  let title: string;
  let message: string;
  let type: ServiceStatusType;

  if (newStatus === "IN_PROGRESS") {
    title = "里程碑已开始";
    message = `订单 ${milestone.order.orderNumber} 的里程碑「${milestone.name}」已开始。`;
    type = "MILESTONE_STARTED";
  } else if (newStatus === "COMPLETED") {
    title = "里程碑已完成";
    message = `订单 ${milestone.order.orderNumber} 的里程碑「${milestone.name}」已完成。`;
    type = "MILESTONE_COMPLETED";
  } else {
    return;
  }

  // 创建站内通知
  const notification = await createServiceNotification({
    userId: milestone.order.clientId,
    orderId: milestone.order.id,
    orderNumber: milestone.order.orderNumber,
    type,
    title,
    message,
    metadata: {
      milestoneId,
      milestoneName: milestone.name,
      newStatus,
    },
  });

  // 发送微信订阅消息
  try {
    await sendServiceMilestoneUpdateMessage(
      milestone.order.clientId,
      milestone.order.orderNumber,
      milestone.name,
      newStatus === "IN_PROGRESS" ? "STARTED" : "COMPLETED",
      milestone.order.id
    );
  } catch (error) {
    console.error("发送订阅消息失败:", error);
  }

  return notification;
}

/**
 * 交付物上传通知
 */
export async function notifyDeliverableUploaded(
  orderId: string,
  deliverableName: string
) {
  const order = await prisma.serviceOrder.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      clientId: true,
    },
  });

  if (!order) return;

  // 创建站内通知
  const notification = await createServiceNotification({
    userId: order.clientId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    type: "DELIVERABLE_UPLOADED",
    title: "新交付物已上传",
    message: `订单 ${order.orderNumber} 有新的交付物「${deliverableName}」已上传，请查看。`,
    metadata: {
      deliverableName,
    },
  });

  // 发送微信订阅消息
  try {
    await sendServiceDeliverableMessage(
      order.clientId,
      order.orderNumber,
      deliverableName,
      order.id
    );
  } catch (error) {
    console.error("发送订阅消息失败:", error);
  }

  return notification;
}

/**
 * 付款确认通知
 */
export async function notifyPaymentReceived(
  orderId: string,
  amount: number
) {
  const order = await prisma.serviceOrder.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      clientId: true,
    },
  });

  if (!order) return;

  return createServiceNotification({
    userId: order.clientId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    type: "PAYMENT_RECEIVED",
    title: "付款已确认",
    message: `订单 ${order.orderNumber} 的付款 ¥${amount.toFixed(2)} 已确认。`,
    metadata: {
      amount,
    },
  });
}
