/**
 * Dashboard 总览工具函数
 * 
 * 实现订单统计、最近订单获取等函数
 */

import type { 
  Order, 
  OrderStatus, 
  OrderStats, 
  DashboardStats,
  OrderFilter 
} from "@/types/dashboard";

/**
 * 计算订单统计数据
 * 
 * @param orders 订单列表
 * @returns 订单统计数据
 */
export function calculateOrderStats(orders: Order[]): OrderStats {
  const stats: OrderStats = {
    total: orders.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  };

  orders.forEach(order => {
    switch (order.status) {
      case "PENDING":
      case "CONFIRMED":
        stats.pending++;
        break;
      case "IN_PROGRESS":
      case "REVIEW":
        stats.inProgress++;
        break;
      case "COMPLETED":
        stats.completed++;
        break;
      case "CANCELLED":
        stats.cancelled++;
        break;
    }
  });

  return stats;
}

/**
 * 验证订单统计数据的一致性
 * 各状态数量之和应等于总数
 * 
 * @param stats 订单统计数据
 * @returns 是否一致
 */
export function validateOrderStats(stats: OrderStats): boolean {
  const sum = stats.pending + stats.inProgress + stats.completed + stats.cancelled;
  return sum === stats.total;
}

/**
 * 获取最近订单
 * 
 * @param orders 订单列表
 * @param limit 限制数量（默认5）
 * @returns 按日期降序排列的最近订单
 */
export function getRecentOrders(orders: Order[], limit: number = 5): Order[] {
  return [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

/**
 * 验证最近订单排序是否正确
 * 
 * @param orders 订单列表
 * @returns 是否按日期降序排列
 */
export function isOrdersSortedByDateDesc(orders: Order[]): boolean {
  for (let i = 1; i < orders.length; i++) {
    const prevDate = new Date(orders[i - 1].createdAt).getTime();
    const currDate = new Date(orders[i].createdAt).getTime();
    if (prevDate < currDate) {
      return false;
    }
  }
  return true;
}

/**
 * 过滤订单
 * 
 * @param orders 订单列表
 * @param filter 过滤条件
 * @returns 过滤后的订单列表
 */
export function filterOrders(orders: Order[], filter: OrderFilter): Order[] {
  return orders.filter(order => {
    // 状态过滤
    if (filter.status && filter.status !== "all" && order.status !== filter.status) {
      return false;
    }

    // 支付状态过滤
    if (filter.paymentStatus && filter.paymentStatus !== "all" && order.paymentStatus !== filter.paymentStatus) {
      return false;
    }

    // 日期范围过滤
    if (filter.dateFrom) {
      const orderDate = new Date(order.createdAt);
      const fromDate = new Date(filter.dateFrom);
      if (orderDate < fromDate) {
        return false;
      }
    }

    if (filter.dateTo) {
      const orderDate = new Date(order.createdAt);
      const toDate = new Date(filter.dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (orderDate > toDate) {
        return false;
      }
    }

    // 搜索过滤
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const matchesOrderNumber = order.orderNumber.toLowerCase().includes(searchLower);
      const matchesItems = order.items.some(item => 
        item.service.name.toLowerCase().includes(searchLower)
      );
      if (!matchesOrderNumber && !matchesItems) {
        return false;
      }
    }

    return true;
  });
}

/**
 * 计算订单总金额
 * 
 * @param orders 订单列表
 * @returns 总金额
 */
export function calculateTotalAmount(orders: Order[]): number {
  return orders.reduce((total, order) => total + order.total, 0);
}

/**
 * 按状态分组订单
 * 
 * @param orders 订单列表
 * @returns 按状态分组的订单
 */
export function groupOrdersByStatus(orders: Order[]): Record<OrderStatus, Order[]> {
  const groups: Record<OrderStatus, Order[]> = {
    PENDING: [],
    CONFIRMED: [],
    IN_PROGRESS: [],
    REVIEW: [],
    COMPLETED: [],
    CANCELLED: [],
  };

  orders.forEach(order => {
    if (groups[order.status]) {
      groups[order.status].push(order);
    }
  });

  return groups;
}

/**
 * 按日期分组订单
 * 
 * @param orders 订单列表
 * @returns 按日期分组的订单
 */
export function groupOrdersByDate(orders: Order[]): Record<string, Order[]> {
  return orders.reduce((groups, order) => {
    const dateKey = new Date(order.createdAt).toISOString().split("T")[0];
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(order);
    return groups;
  }, {} as Record<string, Order[]>);
}

/**
 * 获取订单状态标签
 * 
 * @param status 订单状态
 * @returns 状态标签
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDING: "待确认",
    CONFIRMED: "已确认",
    IN_PROGRESS: "进行中",
    REVIEW: "待验收",
    COMPLETED: "已完成",
    CANCELLED: "已取消",
  };
  return labels[status] || status;
}

/**
 * 计算投资统计数据
 * 
 * @param investments 投资记录
 * @returns 投资统计
 */
export function calculateInvestmentStats(
  investments: Array<{ amount: number; expectedReturn?: number; status: string }>
): { totalInvestment: number; totalReturns: number } {
  let totalInvestment = 0;
  let totalReturns = 0;

  investments.forEach(inv => {
    if (inv.status === "ACTIVE" || inv.status === "COMPLETED") {
      totalInvestment += inv.amount;
      if (inv.expectedReturn) {
        totalReturns += inv.expectedReturn;
      }
    }
  });

  return { totalInvestment, totalReturns };
}

/**
 * 格式化金额显示
 * 
 * @param amount 金额
 * @param currency 货币符号
 * @returns 格式化的金额字符串
 */
export function formatAmount(amount: number, currency: string = "¥"): string {
  return `${currency}${amount.toLocaleString("zh-CN", { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
}

/**
 * 格式化日期显示
 * 
 * @param date 日期
 * @param format 格式类型
 * @returns 格式化的日期字符串
 */
export function formatDate(
  date: Date | string, 
  format: "full" | "date" | "time" | "relative" = "date"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  switch (format) {
    case "full":
      return d.toLocaleString("zh-CN");
    case "time":
      return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    case "relative":
      return getRelativeTime(d);
    case "date":
    default:
      return d.toLocaleDateString("zh-CN");
  }
}

/**
 * 获取相对时间描述
 * 
 * @param date 日期
 * @returns 相对时间描述
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "刚刚";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  }
  if (diffHours < 24) {
    return `${diffHours}小时前`;
  }
  if (diffDays < 7) {
    return `${diffDays}天前`;
  }
  return date.toLocaleDateString("zh-CN");
}

/**
 * 生成快捷操作配置
 */
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color?: string;
}

export const defaultQuickActions: QuickAction[] = [
  {
    id: "new-order",
    title: "浏览服务",
    description: "查看可用服务并下单",
    icon: "ShoppingBag",
    href: "/pricing",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "my-orders",
    title: "我的订单",
    description: "查看订单状态和进度",
    icon: "Package",
    href: "/client/orders",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "projects",
    title: "项目进度",
    description: "跟踪项目里程碑",
    icon: "FolderKanban",
    href: "/client/projects",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "support",
    title: "联系客服",
    description: "获取帮助和支持",
    icon: "MessageSquare",
    href: "/support",
    color: "from-orange-500 to-amber-500",
  },
];
