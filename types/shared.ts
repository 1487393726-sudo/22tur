/**
 * 共享类型定义
 * 用于统一项目中的类型定义，避免与 Prisma 类型冲突
 */

import type {
  User,
  Project,
  Client,
  Task,
  Department,
  Contract,
  Invoice,
  Expense,
  Document as PrismaDocument,
  Transaction,
} from "@prisma/client";

// ============ 枚举类型 ============
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
export type ClientStatus = "ACTIVE" | "INACTIVE" | "PROSPECT" | "CHURNED";
export type ContractStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";
export type DocumentType =
  | "CONTRACT"
  | "REPORT"
  | "PROPOSAL"
  | "DESIGN"
  | "TECHNICAL"
  | "OTHER";
export type DocumentPermission = "PRIVATE" | "INTERNAL" | "PUBLIC";

// ============ 扩展的用户类型 ============
export interface UserWithDepartment extends User {
  department?: Department | null;
}

export interface UserBasicInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
}

// ============ 扩展的项目类型 ============
export interface ProjectWithDetails extends Project {
  client: Client;
  department?: Department | null;
  members: ProjectMemberWithUser[];
  tasks: Task[];
  _count: {
    members: number;
    tasks: number;
  };
}

export interface ProjectMemberWithUser {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  joinedAt: Date;
  user: UserBasicInfo;
}

// ============ 扩展的任务类型 ============
export interface TaskWithDetails extends Task {
  project: Project;
  assignee?: UserBasicInfo | null;
  creator: UserBasicInfo;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: string;
  assigneeId: string | null;
  creatorId: string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignee?: UserBasicInfo | null;
  creator?: UserBasicInfo;
  project?: {
    id: string;
    name: string;
  };
}

// ============ 扩展的客户类型 ============
export interface ClientWithProjects extends Client {
  _count: {
    projects: number;
    contracts?: number;
    invoices?: number;
  };
  totalProjectValue?: number;
  website?: string;
  contactPerson?: string;
  position?: string;
}

// ============ 扩展的文档类型 ============
export interface DocumentWithRelations {
  id: string;
  title: string;
  description?: string | null;
  filePath: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  size: string;
  type: string;
  category: string;
  version: string;
  status: string;
  downloadCount: number;
  uploadDate: Date;
  thumbnailPath?: string | null;
  authorId: string;
  uploadedById?: string;
  projectId?: string | null;
  isPublic: boolean;
  tags?: string | null;
  permission?: DocumentPermission;
  uploadedBy?: UserBasicInfo;
  author?: UserBasicInfo;
  client?: {
    name: string;
  };
  project?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============ 扩展的交易类型 ============
export interface TransactionWithRelations extends Transaction {
  client?: Client | null;
  project?: Project | null;
  contract?: Contract | null;
  invoice?: Invoice | null;
}

// ============ 扩展的发票类型 ============
export interface InvoiceWithRelations extends Invoice {
  client?: Client | null;
  project?: Project | null;
  transactions?: Transaction[];
}

// ============ 部门类型 ============
export interface DepartmentWithDetails extends Department {
  manager?: UserBasicInfo | null;
  _count: {
    employees: number;
    projects: number;
  };
}

// ============ API 响应类型 ============
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// ============ 表单数据类型 ============
export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  departmentId?: string;
  position?: string;
  hireDate?: Date;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  clientId: string;
  departmentId?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  priority: Priority;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  dueDate?: Date;
  priority: Priority;
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  industry?: string;
}

// ============ 过滤器类型 ============
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: Priority[];
  assigneeId?: string;
  projectId?: string;
  dueDate?: {
    from?: Date;
    to?: Date;
  };
}

export interface ProjectFilters {
  status?: ProjectStatus[];
  priority?: Priority[];
  clientId?: string;
  departmentId?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

// ============ 统计数据类型 ============
export interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalClients: number;
  activeTasks: number;
  totalRevenue: number;
  totalExpenses: number;
  recentProjects: Project[];
  upcomingTasks: Task[];
}

// ============ 文件上传类型 ============
export interface FileUpload {
  file: File;
  title: string;
  description?: string;
  category: string;
  projectId?: string;
  isPublic: boolean;
}
