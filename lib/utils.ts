import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { Role, ProjectStatus, TaskStatus, Priority, ClientStatus, ContractStatus, InvoiceStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化日期
export function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 格式化日期时间
export function formatDateTime(date: Date | string | null): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化货币
export function formatCurrency(amount: number | null): string {
  if (amount === null) return '¥0.00'
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取状态显示文本
export function getRoleText(role: Role): string {
  const roleMap: Record<Role, string> = {
    ADMIN: '管理员',
    MANAGER: '经理',
    EMPLOYEE: '员工',
    CLIENT: '客户'
  }
  return roleMap[role] || role
}

export function getProjectStatusText(status: ProjectStatus): string {
  const statusMap: Record<ProjectStatus, string> = {
    PLANNING: '计划中',
    IN_PROGRESS: '进行中',
    ON_HOLD: '暂停',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return statusMap[status] || status
}

export function getTaskStatusText(status: TaskStatus): string {
  const statusMap: Record<TaskStatus, string> = {
    TODO: '待办',
    IN_PROGRESS: '进行中',
    REVIEW: '待审核',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return statusMap[status] || status
}

export function getPriorityText(priority: Priority): string {
  const priorityMap: Record<Priority, string> = {
    LOW: '低',
    MEDIUM: '中',
    HIGH: '高',
    URGENT: '紧急'
  }
  return priorityMap[priority] || priority
}

export function getClientStatusText(status: ClientStatus): string {
  const statusMap: Record<ClientStatus, string> = {
    ACTIVE: '活跃',
    INACTIVE: '非活跃',
    PROSPECT: '潜在客户'
  }
  return statusMap[status] || status
}

// 获取状态颜色
export function getStatusColor(status: ProjectStatus | TaskStatus): string {
  const colorMap: Record<string, string> = {
    PLANNING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    ON_HOLD: 'bg-orange-100 text-orange-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    TODO: 'bg-gray-100 text-gray-800',
    REVIEW: 'bg-purple-100 text-purple-800'
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}

export function getPriorityColor(priority: Priority): string {
  const colorMap: Record<string, string> = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800'
  }
  return colorMap[priority] || 'bg-gray-100 text-gray-800'
}

// 计算进度百分比
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

// 角色枚举值
const RoleValues = ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CLIENT'] as const
const PriorityValues = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

// 验证 schemas
export const userSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  username: z.string().min(3, '用户名至少3个字符'),
  password: z.string().min(6, '密码至少6个字符'),
  firstName: z.string().min(1, '请输入姓'),
  lastName: z.string().min(1, '请输入名'),
  phone: z.string().optional(),
  role: z.enum(RoleValues),
  departmentId: z.string().optional(),
  position: z.string().optional()
})

export const projectSchema = z.object({
  name: z.string().min(1, '项目名称不能为空'),
  description: z.string().optional(),
  clientId: z.string().min(1, '请选择客户'),
  departmentId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z.number().min(0, '预算必须大于等于0').optional(),
  priority: z.enum(PriorityValues)
})

export const taskSchema = z.object({
  title: z.string().min(1, '任务标题不能为空'),
  description: z.string().optional(),
  projectId: z.string().min(1, '请选择项目'),
  assigneeId: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(PriorityValues)
})

export const clientSchema = z.object({
  name: z.string().min(1, '客户名称不能为空'),
  email: z.string().email('请输入有效的邮箱地址'),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  industry: z.string().optional()
})

// 生成随机颜色
export function generateRandomColor(): string {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6366f1'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 检查日期是否过期
export function isOverdue(date: Date | null): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

// 获取相对时间
export function getRelativeTime(date: Date | string | null): string {
  if (!date) return '-'
  
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
  return `${Math.floor(diffDays / 365)}年前`
}