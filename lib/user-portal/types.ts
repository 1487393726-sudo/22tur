/**
 * User Portal System - Core Type Definitions
 * Defines all data models and interfaces for the user portal system
 */

// User Profile
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  userId: string
  theme: 'light' | 'dark'
  language: string
  notifications: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  createdAt: Date
  updatedAt: Date
}

// Order Management
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  status: OrderStatus
  totalAmount: number
  shippingAddress: Address
  trackingNumber?: string
  estimatedDelivery?: Date
  createdAt: Date
  updatedAt: Date
}

export interface OrderDetail extends Order {
  paymentMethod: string
  paymentStatus: 'pending' | 'completed' | 'failed'
  shippingCost: number
  tax: number
}

export interface OrderFilters {
  status?: OrderStatus
  dateFrom?: Date
  dateTo?: Date
  minAmount?: number
  maxAmount?: number
}

// Shopping Cart
export interface CartItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  image?: string
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
  couponCode?: string
  updatedAt: Date
}

export interface CheckoutData {
  shippingAddress: Address
  paymentMethod: string
  couponCode?: string
}

// Favorites
export interface Favorite {
  id: string
  userId: string
  itemId: string
  itemName: string
  itemPrice: number
  availability: boolean
  priceHistory: PricePoint[]
  createdAt: Date
}

export interface PricePoint {
  date: Date
  price: number
}

// Points System
export type PointsTransactionType = 'earn' | 'redeem' | 'expire'

export interface PointsTransaction {
  id: string
  userId: string
  type: PointsTransactionType
  amount: number
  reason: string
  balance: number
  createdAt: Date
}

// Messaging
export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  isRead: boolean
  createdAt: Date
}

export interface Conversation {
  id: string
  userId: string
  participantId: string
  participantName: string
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

// After-Sales Service
export type ReturnStatus = 'pending' | 'approved' | 'shipped' | 'received' | 'refunded' | 'rejected'

export interface ReturnRequest {
  id: string
  userId: string
  orderId: string
  reason: string
  status: ReturnStatus
  shippingLabel?: string
  refundAmount: number
  estimatedRefundDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ReturnDetail extends ReturnRequest {
  orderItems: OrderItem[]
  documentation?: string[]
}

export interface ReturnTracking {
  returnId: string
  status: ReturnStatus
  currentLocation?: string
  estimatedDelivery?: Date
  trackingNumber?: string
  updates: TrackingUpdate[]
}

export interface TrackingUpdate {
  timestamp: Date
  status: ReturnStatus
  location?: string
  message: string
}

// Reviews
export interface Review {
  id: string
  userId: string
  productId: string
  orderId: string
  rating: number
  title: string
  content: string
  photos?: string[]
  helpful: number
  createdAt: Date
  updatedAt: Date
}

export interface PendingReview {
  orderId: string
  itemId: string
  itemName: string
  itemImage?: string
}

export interface ReviewData {
  rating: number
  title: string
  content: string
  photos?: string[]
}

// Help & Support
export interface FAQ {
  id: string
  category: string
  question: string
  answer: string
  helpful: number
  createdAt: Date
  updatedAt: Date
}

export interface Guide {
  id: string
  category: string
  title: string
  content: string
  steps?: GuideStep[]
  createdAt: Date
  updatedAt: Date
}

export interface GuideStep {
  order: number
  title: string
  description: string
  image?: string
}

export interface SearchResult {
  id: string
  type: 'faq' | 'guide' | 'article'
  title: string
  excerpt: string
  url: string
}

export interface SupportTicket {
  id: string
  userId: string
  subject: string
  description: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
}

export interface TicketData {
  subject: string
  description: string
  priority: 'low' | 'medium' | 'high'
  attachments?: string[]
}

// Address
export interface Address {
  id?: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault?: boolean
}

// Dashboard
export interface DashboardData {
  user: User
  recentOrders: Order[]
  pendingMessages: number
  pointsBalance: number
  favorites: Favorite[]
  pendingReviews: PendingReview[]
}

// API Response
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
  timestamp: Date
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
