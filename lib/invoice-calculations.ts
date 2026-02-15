/**
 * 发票计算工具库
 * 提供发票相关的计算功能
 */

export interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
  subtotal?: number
}

export interface InvoiceCalculation {
  subtotal: number
  taxAmount: number
  totalAmount: number
}

export interface InvoiceCalculationDetails extends InvoiceCalculation {
  items: Array<InvoiceLineItem & { subtotal: number }>
  taxRate: number
}

/**
 * 计算单行小计
 * @param quantity 数量
 * @param unitPrice 单价
 * @returns 小计金额
 */
export function calculateLineSubtotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100
}

/**
 * 计算所有行的小计总和
 * @param items 明细行数组
 * @returns 小计总额
 */
export function calculateSubtotal(items: InvoiceLineItem[]): number {
  return items.reduce((sum, item) => {
    const lineSubtotal = calculateLineSubtotal(item.quantity, item.unitPrice)
    return sum + lineSubtotal
  }, 0)
}

/**
 * 计算税额
 * @param subtotal 小计金额
 * @param taxRate 税率（百分比，如 13 表示 13%）
 * @returns 税额
 */
export function calculateTaxAmount(subtotal: number, taxRate: number): number {
  return Math.round(subtotal * (taxRate / 100) * 100) / 100
}

/**
 * 计算总额
 * @param subtotal 小计金额
 * @param taxAmount 税额
 * @returns 总额
 */
export function calculateTotalAmount(subtotal: number, taxAmount: number): number {
  return Math.round((subtotal + taxAmount) * 100) / 100
}

/**
 * 计算发票完整金额（一次性计算所有）
 * @param items 明细行数组
 * @param taxRate 税率（百分比）
 * @returns 包含小计、税额、总额的对象
 */
export function calculateInvoiceAmount(
  items: InvoiceLineItem[],
  taxRate: number
): InvoiceCalculation {
  const subtotal = calculateSubtotal(items)
  const taxAmount = calculateTaxAmount(subtotal, taxRate)
  const totalAmount = calculateTotalAmount(subtotal, taxAmount)

  return {
    subtotal,
    taxAmount,
    totalAmount,
  }
}

/**
 * 计算发票详细信息（包含每行小计）
 * @param items 明细行数组
 * @param taxRate 税率（百分比）
 * @returns 包含详细计算结果的对象
 */
export function calculateInvoiceDetails(
  items: InvoiceLineItem[],
  taxRate: number
): InvoiceCalculationDetails {
  // 计算每行小计
  const itemsWithSubtotal = items.map((item) => ({
    ...item,
    subtotal: calculateLineSubtotal(item.quantity, item.unitPrice),
  }))

  // 计算总计
  const subtotal = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0)
  const taxAmount = calculateTaxAmount(subtotal, taxRate)
  const totalAmount = calculateTotalAmount(subtotal, taxAmount)

  return {
    items: itemsWithSubtotal,
    taxRate,
    subtotal,
    taxAmount,
    totalAmount,
  }
}

/**
 * 格式化金额为货币字符串
 * @param amount 金额
 * @param currency 货币符号（默认 ¥）
 * @returns 格式化后的字符串
 */
export function formatCurrency(amount: number, currency: string = "¥"): string {
  return `${currency}${amount.toFixed(2)}`
}

/**
 * 验证发票金额计算是否正确
 * @param items 明细行数组
 * @param taxRate 税率
 * @param expectedTotal 预期总额
 * @returns 是否匹配
 */
export function validateInvoiceAmount(
  items: InvoiceLineItem[],
  taxRate: number,
  expectedTotal: number
): boolean {
  const { totalAmount } = calculateInvoiceAmount(items, taxRate)
  return Math.abs(totalAmount - expectedTotal) < 0.01 // 允许 0.01 的误差
}

/**
 * 计算折扣后的金额
 * @param amount 原金额
 * @param discountPercent 折扣百分比（如 10 表示 10% 折扣）
 * @returns 折扣后金额
 */
export function calculateDiscountAmount(
  amount: number,
  discountPercent: number
): number {
  const discountAmount = amount * (discountPercent / 100)
  return Math.round((amount - discountAmount) * 100) / 100
}

/**
 * 计算应付金额（含折扣）
 * @param items 明细行数组
 * @param taxRate 税率
 * @param discountPercent 折扣百分比（可选）
 * @returns 应付金额
 */
export function calculatePayableAmount(
  items: InvoiceLineItem[],
  taxRate: number,
  discountPercent?: number
): number {
  const { totalAmount } = calculateInvoiceAmount(items, taxRate)
  
  if (discountPercent && discountPercent > 0) {
    return calculateDiscountAmount(totalAmount, discountPercent)
  }
  
  return totalAmount
}

/**
 * 根据总额反推税前金额
 * @param totalAmount 含税总额
 * @param taxRate 税率
 * @returns 税前金额
 */
export function calculateAmountBeforeTax(
  totalAmount: number,
  taxRate: number
): number {
  return Math.round((totalAmount / (1 + taxRate / 100)) * 100) / 100
}

/**
 * 计算发票统计信息
 * @param items 明细行数组
 * @returns 统计信息
 */
export function calculateInvoiceStats(items: InvoiceLineItem[]) {
  const totalItems = items.length
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const averageUnitPrice = items.length > 0
    ? items.reduce((sum, item) => sum + item.unitPrice, 0) / items.length
    : 0

  return {
    totalItems,
    totalQuantity,
    averageUnitPrice: Math.round(averageUnitPrice * 100) / 100,
  }
}
