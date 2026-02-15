/**
 * Dashboard 类型定义
 * 
 * 定义 Order, Project, Contract, CartItem, Appointment 等接口
 */

// ============ 订单相关类型 ============

export type OrderStatus = 
  | "PENDING" 
  | "CONFIRMED" 
  | "IN_PROGRESS" 
  | "REVIEW" 
  | "COMPLETED" 
  | "CANCELLED";

export type PaymentStatus = 
  | "UNPAID" 
  | "PARTIAL" 
  | "PAID" 
  | "REFUNDED";

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  service: {
    id: string;
    name: string;
    nameEn?: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt?: string;
  estimatedDelivery?: string;
  items: OrderItem[];
  package?: {
    name: string;
  } | null;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

// ============ 项目相关类型 ============

export type ProjectStatus = 
  | "PLANNING" 
  | "IN_PROGRESS" 
  | "REVIEW" 
  | "COMPLETED" 
  | "ON_HOLD" 
  | "CANCELLED";

export interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  description?: string;
}

export interface ProjectUpdate {
  id: string;
  content: string;
  timestamp: string;
  author?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  orderId?: string;
  orderNumber?: string;
  status: ProjectStatus;
  startDate: string;
  expectedEndDate?: string;
  progress: number;
  currentPhase?: string;
  milestones: Milestone[];
  updates: ProjectUpdate[];
  budget?: number;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// ============ 合同相关类型 ============

export type ContractStatus = 
  | "DRAFT" 
  | "PENDING_CLIENT" 
  | "PENDING_COMPANY" 
  | "SIGNED" 
  | "CANCELLED" 
  | "EXPIRED";

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  status: ContractStatus;
  orderId?: string;
  orderNumber?: string;
  amount: number;
  clientSignedAt?: string | null;
  companySignedAt?: string | null;
  expirationDate?: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt?: string;
  order?: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    client?: {
      firstName: string;
      lastName: string;
    };
  };
}

// ============ 购物车相关类型 ============

export interface CartItem {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceNameEn?: string;
  description?: string;
  categorySlug?: string;
  unitPrice: number;
  quantity: number;
  options?: Record<string, CartItemOption>;
  note?: string;
}

export interface CartItemOption {
  name: string;
  value: string;
  priceImpact?: number;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount?: number;
  total: number;
}

// ============ 预约相关类型 ============

export type AppointmentStatus = 
  | "SCHEDULED" 
  | "CONFIRMED" 
  | "COMPLETED" 
  | "CANCELLED";

export type AppointmentType = 
  | "CONSULTATION" 
  | "MEETING" 
  | "REVIEW";

export interface TimeSlot {
  start: string;
  end: string;
  available?: boolean;
}

export interface Appointment {
  id: string;
  type: AppointmentType;
  scheduledAt: string;
  duration: number;
  status: AppointmentStatus;
  topic?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentFormData {
  type: AppointmentType;
  scheduledAt: string;
  duration: number;
  topic?: string;
  notes?: string;
}

// ============ 用户设置相关类型 ============

export interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  userType?: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  taskEnabled: boolean;
  eventEnabled: boolean;
  reminderEnabled: boolean;
  reportEnabled: boolean;
  frequency: "IMMEDIATE" | "HOURLY" | "DAILY" | "WEEKLY";
}

export interface PreferenceSettings {
  language: "zh" | "en" | "ug";
  theme: "light" | "dark" | "system";
}

export interface UserSettings {
  profile: UserProfile;
  security: SecuritySettings;
  notifications: NotificationSettings;
  preferences: PreferenceSettings;
}

// ============ 统计相关类型 ============

export interface OrderStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface DashboardStats {
  orders: OrderStats;
  unreadMessages: number;
  totalInvestment?: number;
  totalReturns?: number;
  upcomingAppointments: number;
}

// ============ 分页相关类型 ============

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============ 过滤相关类型 ============

export interface OrderFilter {
  status?: OrderStatus | "all";
  paymentStatus?: PaymentStatus | "all";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ContractFilter {
  status?: ContractStatus | "all";
  search?: string;
}

export interface AppointmentFilter {
  status?: AppointmentStatus | "all";
  type?: AppointmentType | "all";
  dateFrom?: string;
  dateTo?: string;
}
