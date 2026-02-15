/**
 * 印刷订单服务
 * Requirements: 4.1, 4.3
 */

import { prisma } from '@/lib/prisma';
import {
  PrintOrder,
  OrderStatus,
  PaymentStatus,
  ProductType,
} from './types';
import { markQuoteOrdered } from './quote-service';

/**
 * 生成订单号
 */
function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PO${year}${month}${day}${random}`;
}

/**
 * 从询价创建订单
 */
export async function createOrderFromQuote(
  quoteId: string,
  customerId: string
): Promise<PrintOrder> {
  // 获取询价信息
  const quote = await prisma.printQuote.findFirst({
    where: {
      id: quoteId,
      customerId,
      status: 'accepted',
    },
  });

  if (!quote) {
    throw new Error('询价不存在或状态不正确');
  }

  if (!quote.totalPrice || !quote.unitPrice) {
    throw new Error('询价缺少价格信息');
  }

  // 构建规格 JSON
  const specifications = JSON.stringify({
    size: quote.size,
    customWidth: quote.customWidth,
    customHeight: quote.customHeight,
    material: quote.material,
    finishing: quote.finishing ? JSON.parse(quote.finishing) : [],
    colorMode: quote.colorMode,
    sides: quote.sides,
    requirements: quote.requirements,
    deliveryAddress: quote.deliveryAddress,
  });

  // 创建订单
  const order = await prisma.printOrder.create({
    data: {
      orderNumber: generateOrderNumber(),
      quoteId,
      customerId,
      status: 'pending_payment',
      productType: quote.productType,
      quantity: quote.quantity,
      specifications,
      unitPrice: quote.unitPrice,
      totalPrice: quote.totalPrice,
      paymentStatus: 'unpaid',
    },
  });

  // 更新询价状态为已下单
  await markQuoteOrdered(quoteId);

  return order as unknown as PrintOrder;
}


/**
 * 获取订单列表
 */
export async function getOrders(options: {
  customerId?: string;
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: PaymentStatus;
  page?: number;
  pageSize?: number;
}): Promise<{ items: PrintOrder[]; total: number }> {
  const { customerId, status, paymentStatus, page = 1, pageSize = 10 } = options;

  const where: Record<string, unknown> = {};

  if (customerId) {
    where.customerId = customerId;
  }

  if (status) {
    where.status = Array.isArray(status) ? { in: status } : status;
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  const [items, total] = await Promise.all([
    prisma.printOrder.findMany({
      where,
      include: {
        quote: {
          include: {
            files: true,
          },
        },
        customer: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.printOrder.count({ where }),
  ]);

  return {
    items: items as unknown as PrintOrder[],
    total,
  };
}

/**
 * 获取订单详情
 */
export async function getOrderById(
  id: string,
  customerId?: string
): Promise<PrintOrder | null> {
  const where: Record<string, unknown> = { id };

  if (customerId) {
    where.customerId = customerId;
  }

  const order = await prisma.printOrder.findFirst({
    where,
    include: {
      quote: {
        include: {
          files: true,
        },
      },
      customer: {
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return order as unknown as PrintOrder | null;
}

/**
 * 更新订单支付状态
 */
export async function updateOrderPayment(
  orderId: string,
  paymentMethod: string,
  transactionId?: string
): Promise<PrintOrder> {
  const order = await prisma.printOrder.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('订单不存在');
  }

  if (order.paymentStatus !== 'unpaid') {
    throw new Error('订单已支付或已退款');
  }

  const updated = await prisma.printOrder.update({
    where: { id: orderId },
    data: {
      status: 'paid',
      paymentStatus: 'paid',
      paymentMethod,
      paidAt: new Date(),
    },
  });

  return updated as unknown as PrintOrder;
}

/**
 * 更新订单状态（管理员）
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string
): Promise<PrintOrder> {
  const order = await prisma.printOrder.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('订单不存在');
  }

  const updateData: Record<string, unknown> = { status };

  // 根据状态设置相应的时间戳
  if (status === 'shipped') {
    updateData.shippedAt = new Date();
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
  } else if (status === 'delivered') {
    updateData.deliveredAt = new Date();
  }

  const updated = await prisma.printOrder.update({
    where: { id: orderId },
    data: updateData,
  });

  return updated as unknown as PrintOrder;
}

/**
 * 取消订单
 */
export async function cancelOrder(
  orderId: string,
  customerId?: string
): Promise<PrintOrder> {
  const where: Record<string, unknown> = { id: orderId };
  if (customerId) {
    where.customerId = customerId;
  }

  const order = await prisma.printOrder.findFirst({ where });

  if (!order) {
    throw new Error('订单不存在');
  }

  // 只有待支付状态可以取消
  if (order.status !== 'pending_payment') {
    throw new Error('当前状态不允许取消订单');
  }

  const updated = await prisma.printOrder.update({
    where: { id: orderId },
    data: {
      status: 'cancelled',
    },
  });

  return updated as unknown as PrintOrder;
}
