// 任务状态枚举
export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"

// 任务优先级枚举
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

// 交易类型枚举
export type TransactionType = "INCOME" | "EXPENSE"

// 发票状态枚举
export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"

// 项目状态枚举
export type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED"

// 项目优先级枚举
export type ProjectPriority = "LOW" | "MEDIUM" | "HIGH"

// 用户角色枚举
export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE"

// 用户状态枚举
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED"

// 任务接口
export interface TaskItem {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  assigneeId?: string
  creatorId: string
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

// 项目接口
export interface ProjectItem {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  priority: ProjectPriority
  startDate?: Date
  endDate?: Date
  budget?: number
  clientId: string
  departmentId?: string
  createdAt: Date
  updatedAt: Date
}

// 发票接口
export interface InvoiceItem {
  id: string
  number: string
  clientId: string
  projectId?: string
  amount: number
  status: InvoiceStatus
  dueDate: Date
  paidAt?: Date
  description?: string
  createdAt: Date
  updatedAt: Date
}


// API Management types
export * from './api-management';

// Authentication types
export * from './auth';
