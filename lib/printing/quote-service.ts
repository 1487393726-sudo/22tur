/**
 * 印刷询价服务
 * Requirements: 1.3, 2.1, 3.2, 3.3, 3.4
 */

import { prisma } from '@/lib/prisma';
import {
  PrintQuote,
  QuoteStatus,
  CreateQuoteRequest,
  SubmitQuoteRequest,
  QuoteValidationResult,
  QuoteValidationError,
  isValidStatusTransition,
  MIN_QUANTITY,
  MAX_QUANTITY,
  ProductType,
} from './types';

/**
 * 生成询价单号
 */
function generateQuoteNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PQ${year}${month}${day}${random}`;
}

/**
 * 验证询价请求
 */
export function validateQuoteRequest(data: Partial<CreateQuoteRequest>): QuoteValidationResult {
  const errors: QuoteValidationError[] = [];

  // 验证必填字段
  if (!data.productType) {
    errors.push({ field: 'productType', message: '产品类型为必填项' });
  }

  if (data.quantity === undefined || data.quantity === null) {
    errors.push({ field: 'quantity', message: '数量为必填项' });
  } else if (data.quantity < MIN_QUANTITY || data.quantity > MAX_QUANTITY) {
    errors.push({ field: 'quantity', message: `数量必须在 ${MIN_QUANTITY} 到 ${MAX_QUANTITY} 之间` });
  }

  if (!data.size) {
    errors.push({ field: 'size', message: '尺寸为必填项' });
  }

  // 验证自定义尺寸
  if (data.size === 'custom') {
    if (!data.customWidth || data.customWidth <= 0) {
      errors.push({ field: 'customWidth', message: '自定义宽度必须大于0' });
    }
    if (!data.customHeight || data.customHeight <= 0) {
      errors.push({ field: 'customHeight', message: '自定义高度必须大于0' });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 验证报价提交
 */
export function validateQuoteSubmission(data: Partial<SubmitQuoteRequest>): QuoteValidationResult {
  const errors: QuoteValidationError[] = [];

  if (data.unitPrice === undefined || data.unitPrice === null) {
    errors.push({ field: 'unitPrice', message: '单价为必填项' });
  } else if (data.unitPrice < 0) {
    errors.push({ field: 'unitPrice', message: '单价不能为负数' });
  }

  if (data.totalPrice === undefined || data.totalPrice === null) {
    errors.push({ field: 'totalPrice', message: '总价为必填项' });
  } else if (data.totalPrice < 0) {
    errors.push({ field: 'totalPrice', message: '总价不能为负数' });
  }

  if (!data.validUntil) {
    errors.push({ field: 'validUntil', message: '报价有效期为必填项' });
  } else {
    const validUntilDate = new Date(data.validUntil);
    if (validUntilDate <= new Date()) {
      errors.push({ field: 'validUntil', message: '报价有效期必须是未来时间' });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}


/**
 * 创建询价
 */
export async function createQuote(
  customerId: string,
  data: CreateQuoteRequest
): Promise<PrintQuote> {
  const validation = validateQuoteRequest(data);
  if (!validation.valid) {
    throw new Error(`验证失败: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  const quote = await prisma.printQuote.create({
    data: {
      quoteNumber: generateQuoteNumber(),
      customerId,
      status: 'pending',
      productType: data.productType,
      quantity: data.quantity,
      size: data.size,
      customWidth: data.customWidth,
      customHeight: data.customHeight,
      material: data.material,
      finishing: data.finishing ? JSON.stringify(data.finishing) : null,
      colorMode: data.colorMode,
      sides: data.sides,
      requirements: data.requirements,
      deliveryAddress: data.deliveryAddress,
      expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
    },
    include: {
      files: true,
    },
  });

  return quote as unknown as PrintQuote;
}

/**
 * 获取询价列表
 */
export async function getQuotes(options: {
  customerId?: string;
  status?: QuoteStatus | QuoteStatus[];
  productType?: ProductType;
  page?: number;
  pageSize?: number;
}): Promise<{ items: PrintQuote[]; total: number }> {
  const { customerId, status, productType, page = 1, pageSize = 10 } = options;

  const where: Record<string, unknown> = {};
  
  if (customerId) {
    where.customerId = customerId;
  }
  
  if (status) {
    where.status = Array.isArray(status) ? { in: status } : status;
  }
  
  if (productType) {
    where.productType = productType;
  }

  const [items, total] = await Promise.all([
    prisma.printQuote.findMany({
      where,
      include: {
        files: true,
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
    prisma.printQuote.count({ where }),
  ]);

  return {
    items: items as unknown as PrintQuote[],
    total,
  };
}

/**
 * 获取询价详情
 */
export async function getQuoteById(
  id: string,
  customerId?: string
): Promise<PrintQuote | null> {
  const where: Record<string, unknown> = { id };
  
  if (customerId) {
    where.customerId = customerId;
  }

  const quote = await prisma.printQuote.findFirst({
    where,
    include: {
      files: true,
      customer: {
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
        },
      },
      order: true,
    },
  });

  return quote as unknown as PrintQuote | null;
}

/**
 * 提交报价（管理员）
 */
export async function submitQuote(
  quoteId: string,
  data: SubmitQuoteRequest
): Promise<PrintQuote> {
  const quote = await prisma.printQuote.findUnique({
    where: { id: quoteId },
  });

  if (!quote) {
    throw new Error('询价不存在');
  }

  if (!isValidStatusTransition(quote.status as QuoteStatus, 'quoted')) {
    throw new Error(`当前状态 ${quote.status} 不允许提交报价`);
  }

  const validation = validateQuoteSubmission(data);
  if (!validation.valid) {
    throw new Error(`验证失败: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  const updated = await prisma.printQuote.update({
    where: { id: quoteId },
    data: {
      status: 'quoted',
      unitPrice: data.unitPrice,
      totalPrice: data.totalPrice,
      priceBreakdown: data.priceBreakdown ? JSON.stringify(data.priceBreakdown) : null,
      validUntil: new Date(data.validUntil),
      adminNote: data.adminNote,
      quotedAt: new Date(),
    },
    include: {
      files: true,
    },
  });

  return updated as unknown as PrintQuote;
}

/**
 * 拒绝询价（管理员）
 */
export async function rejectQuote(
  quoteId: string,
  reason: string
): Promise<PrintQuote> {
  const quote = await prisma.printQuote.findUnique({
    where: { id: quoteId },
  });

  if (!quote) {
    throw new Error('询价不存在');
  }

  if (!isValidStatusTransition(quote.status as QuoteStatus, 'rejected')) {
    throw new Error(`当前状态 ${quote.status} 不允许拒绝`);
  }

  if (!reason || reason.trim() === '') {
    throw new Error('拒绝原因为必填项');
  }

  const updated = await prisma.printQuote.update({
    where: { id: quoteId },
    data: {
      status: 'rejected',
      rejectionReason: reason,
    },
    include: {
      files: true,
    },
  });

  return updated as unknown as PrintQuote;
}


/**
 * 接受报价（客户）
 */
export async function acceptQuote(
  quoteId: string,
  customerId: string
): Promise<PrintQuote> {
  const quote = await prisma.printQuote.findFirst({
    where: { id: quoteId, customerId },
  });

  if (!quote) {
    throw new Error('询价不存在或无权操作');
  }

  if (!isValidStatusTransition(quote.status as QuoteStatus, 'accepted')) {
    throw new Error(`当前状态 ${quote.status} 不允许接受报价`);
  }

  // 检查报价是否过期
  if (quote.validUntil && new Date(quote.validUntil) < new Date()) {
    // 自动标记为过期
    await prisma.printQuote.update({
      where: { id: quoteId },
      data: { status: 'expired' },
    });
    throw new Error('报价已过期，请联系商家重新报价');
  }

  const updated = await prisma.printQuote.update({
    where: { id: quoteId },
    data: {
      status: 'accepted',
      acceptedAt: new Date(),
    },
    include: {
      files: true,
    },
  });

  return updated as unknown as PrintQuote;
}

/**
 * 请求修改报价（客户）
 */
export async function reviseQuote(
  quoteId: string,
  customerId: string,
  comment: string
): Promise<PrintQuote> {
  const quote = await prisma.printQuote.findFirst({
    where: { id: quoteId, customerId },
  });

  if (!quote) {
    throw new Error('询价不存在或无权操作');
  }

  if (!isValidStatusTransition(quote.status as QuoteStatus, 'revised')) {
    throw new Error(`当前状态 ${quote.status} 不允许请求修改`);
  }

  // 将评论追加到 requirements 字段
  const existingRequirements = quote.requirements || '';
  const newRequirements = existingRequirements
    ? `${existingRequirements}\n\n[修改请求 ${new Date().toLocaleString()}]: ${comment}`
    : `[修改请求 ${new Date().toLocaleString()}]: ${comment}`;

  const updated = await prisma.printQuote.update({
    where: { id: quoteId },
    data: {
      status: 'revised',
      requirements: newRequirements,
      // 清除之前的报价信息
      unitPrice: null,
      totalPrice: null,
      priceBreakdown: null,
      validUntil: null,
      quotedAt: null,
    },
    include: {
      files: true,
    },
  });

  return updated as unknown as PrintQuote;
}

/**
 * 标记报价过期
 */
export async function expireQuote(quoteId: string): Promise<PrintQuote> {
  const quote = await prisma.printQuote.findUnique({
    where: { id: quoteId },
  });

  if (!quote) {
    throw new Error('询价不存在');
  }

  if (!isValidStatusTransition(quote.status as QuoteStatus, 'expired')) {
    throw new Error(`当前状态 ${quote.status} 不允许标记过期`);
  }

  const updated = await prisma.printQuote.update({
    where: { id: quoteId },
    data: {
      status: 'expired',
    },
    include: {
      files: true,
    },
  });

  return updated as unknown as PrintQuote;
}

/**
 * 标记询价已下单
 */
export async function markQuoteOrdered(quoteId: string): Promise<PrintQuote> {
  const quote = await prisma.printQuote.findUnique({
    where: { id: quoteId },
  });

  if (!quote) {
    throw new Error('询价不存在');
  }

  if (!isValidStatusTransition(quote.status as QuoteStatus, 'ordered')) {
    throw new Error(`当前状态 ${quote.status} 不允许标记已下单`);
  }

  const updated = await prisma.printQuote.update({
    where: { id: quoteId },
    data: {
      status: 'ordered',
    },
    include: {
      files: true,
    },
  });

  return updated as unknown as PrintQuote;
}

/**
 * 检查并更新过期报价
 */
export async function checkAndExpireQuotes(): Promise<number> {
  const result = await prisma.printQuote.updateMany({
    where: {
      status: 'quoted',
      validUntil: {
        lt: new Date(),
      },
    },
    data: {
      status: 'expired',
    },
  });

  return result.count;
}

/**
 * 添加文件到询价
 */
export async function addFileToQuote(
  quoteId: string,
  file: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }
): Promise<void> {
  await prisma.printQuoteFile.create({
    data: {
      quoteId,
      fileName: file.fileName,
      fileUrl: file.fileUrl,
      fileSize: file.fileSize,
      fileType: file.fileType,
    },
  });
}

/**
 * 删除询价文件
 */
export async function removeFileFromQuote(fileId: string): Promise<void> {
  await prisma.printQuoteFile.delete({
    where: { id: fileId },
  });
}
