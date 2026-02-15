/**
 * 内容编辑系统类型定义
 * Content Editor System Type Definitions
 */

import type {
  Equipment,
  EquipmentBundle,
  EquipmentCategory,
  UserSegment,
  PriceTier,
  ProductStatus,
  CreateEquipmentRequest,
  UpdateEquipmentRequest,
  CreateBundleRequest,
  UpdateBundleRequest,
} from './marketplace';

// ============================================
// ProductForm 组件类型
// ============================================

/**
 * 产品表单属性
 */
export interface ProductFormProps {
  product?: Equipment;
  categories: EquipmentCategory[];
  onSave: (data: CreateEquipmentRequest | UpdateEquipmentRequest) => Promise<void>;
  onCancel: () => void;
}

/**
 * 产品表单状态
 */
export interface ProductFormState {
  formData: Partial<Equipment>;
  isDirty: boolean;
  errors: Record<string, string>;
  isSubmitting: boolean;
  lastSaved: Date | null;
}

/**
 * 产品表单数据（用于表单提交）
 */
export interface ProductFormData {
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  targetSegments: UserSegment[];
  priceTier: PriceTier;
  specifications: Record<string, string>;
  images: string[];
  stock: number;
  status: ProductStatus;
  brand?: string;
  model?: string;
  featured: boolean;
}

// ============================================
// MediaManager 组件类型
// ============================================

/**
 * 媒体项类型
 */
export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  thumbnail?: string;
  order: number;
}

/**
 * 媒体管理器属性
 */
export interface MediaManagerProps {
  images: string[];
  videos?: string[];
  onImagesChange: (images: string[]) => void;
  onVideosChange?: (videos: string[]) => void;
  maxImages?: number;
  maxVideos?: number;
}

/**
 * 媒体切换器属性
 */
export interface MediaSwitcherProps {
  currentMode: 'image' | 'video';
  onModeChange: (mode: 'image' | 'video') => void;
  imageControls: React.ReactNode;
  videoControls: React.ReactNode;
}

// ============================================
// AssetUploader 组件类型
// ============================================

/**
 * 资源类型
 */
export type AssetType = 'image' | 'video' | 'document';

/**
 * 资源元数据
 */
export interface AssetMetadata {
  filename: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
}

/**
 * 资源上传器属性
 */
export interface AssetUploaderProps {
  type: AssetType;
  onUploadComplete: (url: string, metadata: AssetMetadata) => void;
  onUploadError: (error: string) => void;
  maxSize?: number;
  accept?: string[];
}

/**
 * 上传进度状态
 */
export interface UploadProgress {
  id: string;
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

// ============================================
// FontEditor 组件类型
// ============================================

/**
 * 文本样式
 */
export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

/**
 * 字体编辑器属性
 */
export interface FontEditorProps {
  value: TextStyle;
  onChange: (style: TextStyle) => void;
  presetColors?: string[];
}

/**
 * 默认文本样式
 */
export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  color: '#000000',
  textAlign: 'left',
};

/**
 * 可用字体列表
 */
export const AVAILABLE_FONTS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: '"Noto Sans SC", sans-serif', label: '思源黑体' },
  { value: '"Noto Serif SC", serif', label: '思源宋体' },
] as const;

// ============================================
// TemplateEditor 组件类型
// ============================================

/**
 * 模板类型
 */
export type TemplateType = 'order_confirmation' | 'shipping_notification' | 'invoice';

/**
 * 模板占位符
 */
export interface TemplatePlaceholder {
  key: string;
  label: string;
  defaultValue: string;
}

/**
 * 模板接口
 */
export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  content: string;
  placeholders: TemplatePlaceholder[];
  styles: Record<string, TextStyle>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 模板编辑器属性
 */
export interface TemplateEditorProps {
  template?: Template;
  onSave: (template: Template) => Promise<void>;
  onPreview: (template: Template) => void;
}

/**
 * 模板编辑器状态
 */
export interface TemplateEditorState {
  content: string;
  styles: Record<string, TextStyle>;
  isDirty: boolean;
  history: string[];
  historyIndex: number;
}

/**
 * 默认模板占位符
 */
export const DEFAULT_PLACEHOLDERS: Record<TemplateType, TemplatePlaceholder[]> = {
  order_confirmation: [
    { key: '{{orderNumber}}', label: '订单号', defaultValue: 'ORD-2024-001' },
    { key: '{{customerName}}', label: '客户姓名', defaultValue: '张三' },
    { key: '{{orderDate}}', label: '订单日期', defaultValue: '2024-12-17' },
    { key: '{{totalAmount}}', label: '订单金额', defaultValue: '¥1,299.00' },
    { key: '{{items}}', label: '商品列表', defaultValue: '商品A x 1' },
  ],
  shipping_notification: [
    { key: '{{orderNumber}}', label: '订单号', defaultValue: 'ORD-2024-001' },
    { key: '{{customerName}}', label: '客户姓名', defaultValue: '张三' },
    { key: '{{trackingNumber}}', label: '物流单号', defaultValue: 'SF1234567890' },
    { key: '{{carrier}}', label: '物流公司', defaultValue: '顺丰速运' },
    { key: '{{estimatedDelivery}}', label: '预计送达', defaultValue: '2024-12-20' },
  ],
  invoice: [
    { key: '{{invoiceNumber}}', label: '发票号', defaultValue: 'INV-2024-001' },
    { key: '{{customerName}}', label: '客户姓名', defaultValue: '张三' },
    { key: '{{invoiceDate}}', label: '开票日期', defaultValue: '2024-12-17' },
    { key: '{{subtotal}}', label: '小计', defaultValue: '¥1,199.00' },
    { key: '{{tax}}', label: '税额', defaultValue: '¥100.00' },
    { key: '{{total}}', label: '总计', defaultValue: '¥1,299.00' },
  ],
};

// ============================================
// BundleForm 组件类型
// ============================================

/**
 * 套餐表单属性
 */
export interface BundleFormProps {
  bundle?: EquipmentBundle;
  availableEquipment: Equipment[];
  onSave: (data: CreateBundleRequest | UpdateBundleRequest) => Promise<void>;
  onCancel: () => void;
}

/**
 * 套餐项输入
 */
export interface BundleItemInput {
  equipmentId: string;
  quantity: number;
  equipment?: Equipment;
}

/**
 * 套餐表单数据
 */
export interface BundleFormData {
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  price: number;
  originalPrice: number;
  targetSegment: UserSegment;
  images: string[];
  status: ProductStatus;
  featured: boolean;
  items: BundleItemInput[];
}

// ============================================
// ProductPreview 组件类型
// ============================================

/**
 * 视口类型
 */
export type ViewportType = 'desktop' | 'tablet' | 'mobile';

/**
 * 视口尺寸配置
 */
export const VIEWPORT_SIZES: Record<ViewportType, number> = {
  desktop: 1920,
  tablet: 768,
  mobile: 375,
} as const;

/**
 * 产品预览属性
 */
export interface ProductPreviewProps {
  product: Equipment;
  viewport: ViewportType;
}

// ============================================
// Auto-Save 相关类型
// ============================================

/**
 * 自动保存实体类型
 */
export type AutoSaveEntityType = 'equipment' | 'bundle' | 'template';

/**
 * 自动保存草稿
 */
export interface AutoSaveDraft {
  id: string;
  entityType: AutoSaveEntityType;
  entityId: string | null;
  data: string; // JSON string
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * useAutoSave Hook 选项
 */
export interface UseAutoSaveOptions<T> {
  entityType: AutoSaveEntityType;
  entityId: string | null;
  data: T;
  interval?: number; // default: 30000ms (30 seconds)
  onSave?: (draft: AutoSaveDraft) => void;
  onError?: (error: Error) => void;
}

/**
 * useAutoSave Hook 返回值
 */
export interface UseAutoSaveReturn<T> {
  lastSaved: Date | null;
  isSaving: boolean;
  hasDraft: boolean;
  saveDraft: () => Promise<void>;
  discardDraft: () => Promise<void>;
  restoreDraft: () => T | null;
}

// ============================================
// Navigation Guard 相关类型
// ============================================

/**
 * 导航保护属性
 */
export interface NavigationGuardProps {
  isDirty: boolean;
  onSave: () => Promise<void>;
  onDiscard: () => void;
  message?: string;
}

/**
 * 未保存更改对话框属性
 */
export interface UnsavedChangesDialogProps {
  open: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

/**
 * 草稿恢复对话框属性
 */
export interface DraftRestoreDialogProps {
  open: boolean;
  draftTimestamp: Date;
  onRestore: () => void;
  onDiscard: () => void;
}

// ============================================
// Image Editing 相关类型
// ============================================

/**
 * 裁剪宽高比
 */
export type CropAspectRatio = '1:1' | '4:3' | '16:9' | 'free';

/**
 * 裁剪配置
 */
export interface CropConfig {
  aspectRatio: CropAspectRatio;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 旋转角度（90度增量）
 */
export type RotationAngle = 0 | 90 | 180 | 270;

/**
 * 图片编辑状态
 */
export interface ImageEditState {
  crop?: CropConfig;
  rotation: RotationAngle;
  originalUrl: string;
  editedUrl?: string;
}

// ============================================
// 验证错误类型
// ============================================

/**
 * 验证错误
 */
export interface ValidationError {
  field: string;
  message: string;
  code: 'required' | 'invalid_type' | 'out_of_range' | 'invalid_format';
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ============================================
// API 响应类型
// ============================================

/**
 * 模板 API 响应
 */
export interface TemplateResponse {
  template: Template;
}

/**
 * 模板列表 API 响应
 */
export interface TemplateListResponse {
  templates: Template[];
  total: number;
}

/**
 * 草稿 API 响应
 */
export interface DraftResponse {
  draft: AutoSaveDraft | null;
}

/**
 * 上传 API 响应
 */
export interface UploadResponse {
  url: string;
  metadata: AssetMetadata;
}

// ============================================
// 服务市场内容类型 - Service Market Content Types
// ============================================

/**
 * 服务市场项目
 */
export interface ServiceMarketItem {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  category: string;
  iconType: string; // Lucide icon name
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 精选作品
 */
export interface FeaturedWork {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  description: string;
  descriptionEn: string;
  image: string;
  images: string; // JSON array of image URLs
  author: string;
  teamName: string;
  category: string;
  tags: string; // JSON array
  viewCount: number;
  likeCount: number;
  featured: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 服务定价
 */
export interface ServicePricing {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  features: string; // JSON array of feature strings
  featuresEn: string; // JSON array of feature strings in English
  category: string;
  recommended: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 服务项目
 */
export interface ServiceProject {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  startingPrice: string; // e.g., "$5,000" or "Custom Quote"
  iconName: string; // Lucide icon name
  categoryTag: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// 服务市场内容表单类型
// ============================================

/**
 * 服务市场项目表单数据
 */
export interface ServiceMarketItemFormData {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  category: string;
  iconType: string;
  order?: number;
  isActive?: boolean;
}

/**
 * 精选作品表单数据
 */
export interface FeaturedWorkFormData {
  title: string;
  titleEn: string;
  slug: string;
  description: string;
  descriptionEn: string;
  image: string;
  images: string[];
  author: string;
  teamName: string;
  category: string;
  tags: string[];
  viewCount?: number;
  likeCount?: number;
  featured?: boolean;
  isActive?: boolean;
  order?: number;
}

/**
 * 服务定价表单数据
 */
export interface ServicePricingFormData {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  originalPrice: number;
  discountPercent?: number;
  features: string[];
  featuresEn: string[];
  category: string;
  recommended?: boolean;
  isActive?: boolean;
  order?: number;
}

/**
 * 服务项目表单数据
 */
export interface ServiceProjectFormData {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  startingPrice: string;
  iconName: string;
  categoryTag?: string;
  order?: number;
  isActive?: boolean;
}

// ============================================
// 服务市场内容 API 响应类型
// ============================================

/**
 * 服务市场项目列表响应
 */
export interface ServiceMarketItemListResponse {
  items: ServiceMarketItem[];
  total: number;
}

/**
 * 精选作品列表响应
 */
export interface FeaturedWorkListResponse {
  items: FeaturedWork[];
  total: number;
}

/**
 * 服务定价列表响应
 */
export interface ServicePricingListResponse {
  items: ServicePricing[];
  total: number;
}

/**
 * 服务项目列表响应
 */
export interface ServiceProjectListResponse {
  items: ServiceProject[];
  total: number;
}

/**
 * 内容编辑器分类
 */
export type ContentEditorCategory = 
  | 'web'
  | 'mobile'
  | 'ui'
  | 'branding'
  | 'marketing'
  | 'consulting'
  | 'development'
  | 'design'
  | 'other';

/**
 * 内容编辑器分类选项
 */
export const CONTENT_EDITOR_CATEGORIES: Array<{ value: ContentEditorCategory; label: string; labelEn: string }> = [
  { value: 'web', label: '网站开发', labelEn: 'Web Development' },
  { value: 'mobile', label: '移动应用', labelEn: 'Mobile Development' },
  { value: 'ui', label: 'UI/UX设计', labelEn: 'UI/UX Design' },
  { value: 'branding', label: '品牌设计', labelEn: 'Branding' },
  { value: 'marketing', label: '数字营销', labelEn: 'Digital Marketing' },
  { value: 'consulting', label: '咨询服务', labelEn: 'Consulting' },
  { value: 'development', label: '软件开发', labelEn: 'Software Development' },
  { value: 'design', label: '创意设计', labelEn: 'Creative Design' },
  { value: 'other', label: '其他', labelEn: 'Other' },
];
