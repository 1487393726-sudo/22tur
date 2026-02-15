/**
 * Dashboard 统一样式系统
 * 
 * 定义卡片、表格、页面标题等统一样式常量
 * 实现状态映射函数
 */

// 统一样式配置
export const dashboardStyles = {
  card: {
    base: "bg-card/60 hover:bg-card/90 transition-colors rounded-xl border border-border/20",
    header: "flex flex-row items-center justify-between space-y-0 pb-2",
    title: "text-sm font-medium",
    content: "p-4 md:p-6",
  },
  table: {
    wrapper: "border rounded-lg overflow-hidden",
    header: "bg-muted/30",
    row: "border-b border-border/20 last:border-0",
    cell: "p-4",
  },
  page: {
    title: "text-3xl font-bold",
    description: "text-muted-foreground",
    section: "space-y-6",
  },
  button: {
    primary: "bg-primary text-white hover:opacity-90",
    secondary: "bg-muted text-muted-foreground hover:bg-muted/50",
    ghost: "hover:bg-muted/50",
  },
} as const;

// Badge 变体类型
export type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

// 状态到 Badge 变体的映射
const statusVariantMap: Record<string, BadgeVariant> = {
  // 中文状态
  "已完成": "default",
  "设计中": "secondary",
  "进行中": "secondary",
  "需求沟通": "outline",
  "待处理": "outline",
  "待确认": "outline",
  "待签署": "outline",
  "已取消": "destructive",
  "已过期": "destructive",
  "已拒绝": "destructive",
  // 英文状态
  "completed": "default",
  "COMPLETED": "default",
  "signed": "default",
  "SIGNED": "default",
  "in_progress": "secondary",
  "IN_PROGRESS": "secondary",
  "processing": "secondary",
  "PROCESSING": "secondary",
  "confirmed": "secondary",
  "CONFIRMED": "secondary",
  "pending": "outline",
  "PENDING": "outline",
  "PENDING_CLIENT": "outline",
  "PENDING_COMPANY": "outline",
  "draft": "outline",
  "DRAFT": "outline",
  "scheduled": "outline",
  "SCHEDULED": "outline",
  "cancelled": "destructive",
  "CANCELLED": "destructive",
  "expired": "destructive",
  "EXPIRED": "destructive",
  "rejected": "destructive",
  "REJECTED": "destructive",
};

/**
 * 获取状态对应的 Badge 变体
 * @param status 状态字符串
 * @returns Badge 变体
 */
export function getStatusVariant(status: string): BadgeVariant {
  return statusVariantMap[status] || "outline";
}

/**
 * 获取所有已知的状态列表
 * @returns 状态字符串数组
 */
export function getKnownStatuses(): string[] {
  return Object.keys(statusVariantMap);
}

/**
 * 检查状态是否为已知状态
 * @param status 状态字符串
 * @returns 是否为已知状态
 */
export function isKnownStatus(status: string): boolean {
  return status in statusVariantMap;
}

// 订单状态配置
export const orderStatusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: "待确认", variant: "outline" },
  CONFIRMED: { label: "已确认", variant: "secondary" },
  IN_PROGRESS: { label: "进行中", variant: "secondary" },
  REVIEW: { label: "待验收", variant: "outline" },
  COMPLETED: { label: "已完成", variant: "default" },
  CANCELLED: { label: "已取消", variant: "destructive" },
};

// 合同状态配置
export const contractStatusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  DRAFT: { label: "草稿", variant: "outline" },
  PENDING_CLIENT: { label: "待客户签署", variant: "outline" },
  PENDING_COMPANY: { label: "待公司签署", variant: "outline" },
  SIGNED: { label: "已签署", variant: "default" },
  CANCELLED: { label: "已取消", variant: "destructive" },
  EXPIRED: { label: "已过期", variant: "destructive" },
};

// 预约状态配置
export const appointmentStatusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  SCHEDULED: { label: "已预约", variant: "outline" },
  CONFIRMED: { label: "已确认", variant: "secondary" },
  COMPLETED: { label: "已完成", variant: "default" },
  CANCELLED: { label: "已取消", variant: "destructive" },
};

// 支付状态配置
export const paymentStatusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  UNPAID: { label: "未支付", variant: "destructive" },
  PARTIAL: { label: "部分支付", variant: "outline" },
  PAID: { label: "已支付", variant: "default" },
  REFUNDED: { label: "已退款", variant: "secondary" },
};
