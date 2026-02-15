import {
  User,
  Project,
  Client,
  Task,
  Department,
  Contract,
  Invoice,
  Expense,
  Document,
} from "@prisma/client";

// 重新导出共享类型
export * from "@/types/shared";

// 定义本地枚举类型（Prisma schema 使用 String 类型）
export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE" | "CLIENT";
export type ProjectStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";
export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "REVIEW"
  | "COMPLETED"
  | "CANCELLED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type ClientStatus = "ACTIVE" | "INACTIVE" | "PROSPECT";
export type ContractStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

// 扩展 NextAuth 类型
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role
    }
  }

  interface User {
    role: Role
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role
  }
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 分页参数
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 扩展的用户类型
export type UserWithDepartment = User & {
  department?: Department | null
}

// 扩展的项目类型
export type ProjectWithDetails = Project & {
  client: Client
  department?: Department | null
  members: (ProjectMember & { user: User })[]
  tasks: Task[]
  _count: {
    members: number
    tasks: number
  }
}

// 扩展的任务类型
export type TaskWithDetails = Task & {
  project: Project
  assignee?: User | null
  creator: User
}

// 扩展的客户类型
export type ClientWithProjects = Client & {
  _count: {
    projects: number
    contracts: number
    invoices: number
  }
}

// 扩展的部门类型
export type DepartmentWithDetails = Department & {
  manager?: User | null
  _count: {
    employees: number
    projects: number
  }
}

// 统计数据类型
export interface DashboardStats {
  totalUsers: number
  totalProjects: number
  totalClients: number
  activeTasks: number
  totalRevenue: number
  totalExpenses: number
  recentProjects: Project[]
  upcomingTasks: Task[]
}

// 表单数据类型
export interface CreateUserData {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: Role
  departmentId?: string
  position?: string
  hireDate?: Date
}

export interface CreateProjectData {
  name: string
  description?: string
  clientId: string
  departmentId?: string
  startDate?: Date
  endDate?: Date
  budget?: number
  priority: Priority
}

export interface CreateTaskData {
  title: string
  description?: string
  projectId: string
  assigneeId?: string
  dueDate?: Date
  priority: Priority
}

export interface CreateClientData {
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
  industry?: string
}

// 项目成员类型
export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  role: string
  joinedAt: Date
  user: User
}

// 过滤器类型
export interface TaskFilters {
  status?: TaskStatus[]
  priority?: Priority[]
  assigneeId?: string
  projectId?: string
  dueDate?: {
    from?: Date
    to?: Date
  }
}

export interface ProjectFilters {
  status?: ProjectStatus[]
  priority?: Priority[]
  clientId?: string
  departmentId?: string
  dateRange?: {
    from?: Date
    to?: Date
  }
}

// 文件上传类型
export interface FileUpload {
  file: File
  title: string
  description?: string
  category: string
  projectId?: string
  isPublic: boolean
}