// 直播设备产品市场类型定义

// 用户群体类型
export type UserSegment = 'PERSONAL' | 'PROFESSIONAL' | 'ENTERPRISE';

// 设备分类类型
export type EquipmentCategoryType =
  | 'LIGHTING'
  | 'COMPUTER'
  | 'CAMERA'
  | 'MICROPHONE'
  | 'AUDIO_INTERFACE'
  | 'STAND'
  | 'ACCESSORY';

// 价格档次
export type PriceTier = 'ENTRY' | 'MID' | 'HIGH';

// 产品状态
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

// 订单状态
export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

// 设备分类接口
export interface EquipmentCategory {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  description?: string | null;
  icon?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 设备接口
export interface Equipment {
  id: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  price: number;
  originalPrice?: number | null;
  categoryId: string;
  targetSegments: UserSegment[];
  priceTier: PriceTier;
  specifications: Record<string, string>;
  images: string[];
  stock: number;
  status: ProductStatus;
  brand?: string | null;
  model?: string | null;
  rating?: number | null;
  reviewCount: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: EquipmentCategory;
}

// 数据库返回的设备（JSON字段为字符串）
export interface EquipmentDB {
  id: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  price: number;
  originalPrice?: number | null;
  categoryId: string;
  targetSegments: string; // JSON string
  priceTier: string;
  specifications?: string | null; // JSON string
  images?: string | null; // JSON string
  stock: number;
  status: string;
  brand?: string | null;
  model?: string | null;
  rating?: number | null;
  reviewCount: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: EquipmentCategory;
}

// 套餐项接口
export interface BundleItem {
  id: string;
  bundleId: string;
  equipmentId: string;
  quantity: number;
  equipment?: Equipment;
}

// 设备套餐接口
export interface EquipmentBundle {
  id: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  price: number;
  originalPrice: number;
  targetSegment: UserSegment;
  images: string[];
  status: ProductStatus;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  items?: BundleItem[];
  savings?: number;
}

// 数据库返回的套餐
export interface EquipmentBundleDB {
  id: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  price: number;
  originalPrice: number;
  targetSegment: string;
  images?: string | null; // JSON string
  status: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  items?: BundleItem[];
}

// 购物车项接口
export interface CartItem {
  id: string;
  cartId: string;
  equipmentId?: string | null;
  bundleId?: string | null;
  quantity: number;
  productType: 'EQUIPMENT' | 'BUNDLE';
  product: Equipment | EquipmentBundle;
  createdAt: Date;
  updatedAt: Date;
}

// 购物车接口
export interface Cart {
  id: string;
  userId?: string | null;
  sessionId?: string | null;
  items: CartItem[];
  subtotal: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

// 收货地址接口
export interface ShippingAddress {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  postalCode?: string;
}

// 订单项接口
export interface OrderItem {
  id: string;
  orderId: string;
  equipmentId?: string | null;
  bundleId?: string | null;
  name: string;
  price: number;
  quantity: number;
  productType: 'EQUIPMENT' | 'BUNDLE';
  equipment?: Equipment | null;
  bundle?: EquipmentBundle | null;
  createdAt: Date;
}

// 订单接口
export interface MarketplaceOrder {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  shippingAddress?: ShippingAddress | null;
  paymentMethod?: string | null;
  paymentId?: string | null;
  paidAt?: Date | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  cancelledAt?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// API 请求/响应类型

// 产品列表筛选参数
export interface ProductFilterParams {
  segment?: UserSegment;
  category?: string;
  priceTier?: PriceTier;
  search?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 添加到购物车请求
export interface AddToCartRequest {
  productId: string;
  productType: 'EQUIPMENT' | 'BUNDLE';
  quantity: number;
}

// 更新购物车项请求
export interface UpdateCartItemRequest {
  quantity: number;
}

// 创建订单请求
export interface CreateOrderRequest {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  notes?: string;
}

// 产品管理请求
export interface CreateEquipmentRequest {
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  targetSegments: UserSegment[];
  priceTier: PriceTier;
  specifications?: Record<string, string>;
  images?: string[];
  stock: number;
  status?: ProductStatus;
  brand?: string;
  model?: string;
  featured?: boolean;
}

export interface UpdateEquipmentRequest extends Partial<CreateEquipmentRequest> {
  id: string;
}

// 分类管理请求
export interface CreateCategoryRequest {
  name: string;
  nameEn?: string;
  slug: string;
  description?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}

// 套餐管理请求
export interface CreateBundleRequest {
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  price: number;
  originalPrice: number;
  targetSegment: UserSegment;
  images?: string[];
  status?: ProductStatus;
  featured?: boolean;
  items: { equipmentId: string; quantity: number }[];
}

export interface UpdateBundleRequest extends Partial<CreateBundleRequest> {
  id: string;
}

// 搜索建议
export interface SearchSuggestion {
  type: 'product' | 'category' | 'bundle';
  id: string;
  name: string;
  image?: string;
}

// 比较产品
export interface CompareProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  specifications: Record<string, string>;
  category: string;
}

// 工具函数：解析设备数据
export function parseEquipment(db: EquipmentDB): Equipment {
  return {
    ...db,
    targetSegments: JSON.parse(db.targetSegments) as UserSegment[],
    priceTier: db.priceTier as PriceTier,
    specifications: db.specifications ? JSON.parse(db.specifications) : {},
    images: db.images ? JSON.parse(db.images) : [],
    status: db.status as ProductStatus,
  };
}

// 工具函数：解析套餐数据
export function parseBundle(db: EquipmentBundleDB): EquipmentBundle {
  return {
    ...db,
    targetSegment: db.targetSegment as UserSegment,
    images: db.images ? JSON.parse(db.images) : [],
    status: db.status as ProductStatus,
    savings: db.originalPrice - db.price,
  };
}

// 错误码定义
export const MarketplaceErrorCodes = {
  // 产品相关
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  PRODUCT_OUT_OF_STOCK: 'PRODUCT_OUT_OF_STOCK',
  PRODUCT_INACTIVE: 'PRODUCT_INACTIVE',

  // 购物车相关
  CART_NOT_FOUND: 'CART_NOT_FOUND',
  CART_ITEM_NOT_FOUND: 'CART_ITEM_NOT_FOUND',
  CART_EMPTY: 'CART_EMPTY',
  INVALID_QUANTITY: 'INVALID_QUANTITY',

  // 订单相关
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  ORDER_ALREADY_PAID: 'ORDER_ALREADY_PAID',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  INVALID_ORDER_STATUS: 'INVALID_ORDER_STATUS',

  // 分类相关
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
  CATEGORY_HAS_PRODUCTS: 'CATEGORY_HAS_PRODUCTS',
  CATEGORY_SLUG_EXISTS: 'CATEGORY_SLUG_EXISTS',

  // 套餐相关
  BUNDLE_NOT_FOUND: 'BUNDLE_NOT_FOUND',

  // 验证相关
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // 权限相关
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
} as const;

export type MarketplaceErrorCode = typeof MarketplaceErrorCodes[keyof typeof MarketplaceErrorCodes];
