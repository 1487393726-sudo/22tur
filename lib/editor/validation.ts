/**
 * 编辑器验证工具
 * Editor Validation Utilities
 */

import { z } from 'zod';
import type {
  ValidationResult,
  ValidationError,
  TemplateType,
  TextStyle,
} from '@/types/editor';
import type {
  UserSegment,
  PriceTier,
  ProductStatus,
} from '@/types/marketplace';

// ============================================
// 枚举值定义
// ============================================

const UserSegmentValues = ['PERSONAL', 'PROFESSIONAL', 'ENTERPRISE'] as const;
const PriceTierValues = ['ENTRY', 'MID', 'HIGH'] as const;
const ProductStatusValues = ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'] as const;
const TemplateTypeValues = ['order_confirmation', 'shipping_notification', 'invoice'] as const;

// ============================================
// 产品验证 Schema
// ============================================

/**
 * 产品验证 Schema
 */
export const productSchema = z.object({
  name: z.string().min(1, '产品名称不能为空').max(200, '产品名称不能超过200个字符'),
  nameEn: z.string().max(200, '英文名称不能超过200个字符').optional().nullable(),
  description: z.string().max(5000, '描述不能超过5000个字符').optional().nullable(),
  descriptionEn: z.string().max(5000, '英文描述不能超过5000个字符').optional().nullable(),
  price: z.number().positive('价格必须大于0'),
  originalPrice: z.number().positive('原价必须大于0').optional().nullable(),
  categoryId: z.string().min(1, '请选择分类'),
  targetSegments: z.array(z.enum(UserSegmentValues)).min(1, '请至少选择一个目标用户群体'),
  priceTier: z.enum(PriceTierValues, { errorMap: () => ({ message: '请选择价格档次' }) }),
  specifications: z.record(z.string(), z.string()).optional().default({}),
  images: z.array(z.string().url('图片URL格式无效')).min(1, '至少需要一张产品图片'),
  stock: z.number().int('库存必须为整数').min(0, '库存不能为负数'),
  status: z.enum(ProductStatusValues, { errorMap: () => ({ message: '请选择产品状态' }) }),
  brand: z.string().max(100, '品牌名称不能超过100个字符').optional().nullable(),
  model: z.string().max(100, '型号不能超过100个字符').optional().nullable(),
  featured: z.boolean().optional().default(false),
});

/**
 * 产品创建 Schema（部分字段可选）
 */
export const createProductSchema = productSchema.extend({
  status: z.enum(ProductStatusValues).optional().default('ACTIVE'),
  featured: z.boolean().optional().default(false),
});

/**
 * 产品更新 Schema（所有字段可选）
 */
export const updateProductSchema = productSchema.partial().extend({
  id: z.string().min(1, '产品ID不能为空'),
});

// ============================================
// 套餐验证 Schema
// ============================================

/**
 * 套餐项 Schema
 */
export const bundleItemSchema = z.object({
  equipmentId: z.string().min(1, '请选择设备'),
  quantity: z.number().int('数量必须为整数').min(1, '数量至少为1'),
});

/**
 * 套餐基础 Schema（不含 refine）
 */
const bundleBaseSchema = z.object({
  name: z.string().min(1, '套餐名称不能为空').max(200, '套餐名称不能超过200个字符'),
  nameEn: z.string().max(200, '英文名称不能超过200个字符').optional().nullable(),
  description: z.string().max(5000, '描述不能超过5000个字符').optional().nullable(),
  descriptionEn: z.string().max(5000, '英文描述不能超过5000个字符').optional().nullable(),
  price: z.number().positive('套餐价格必须大于0'),
  originalPrice: z.number().positive('原价必须大于0'),
  targetSegment: z.enum(UserSegmentValues, { errorMap: () => ({ message: '请选择目标用户群体' }) }),
  images: z.array(z.string().url('图片URL格式无效')).optional().default([]),
  status: z.enum(ProductStatusValues, { errorMap: () => ({ message: '请选择状态' }) }),
  featured: z.boolean().optional().default(false),
  items: z.array(bundleItemSchema).min(1, '套餐至少需要包含一个设备'),
});

/**
 * 套餐价格验证 refinement
 */
const bundlePriceRefinement = <T extends { price: number; originalPrice: number }>(schema: z.ZodType<T>) =>
  schema.refine(
    (data) => data.price < data.originalPrice,
    {
      message: '套餐价格必须低于原价（各设备价格之和）',
      path: ['price'],
    }
  );

/**
 * 套餐验证 Schema
 */
export const bundleSchema = bundlePriceRefinement(bundleBaseSchema);

/**
 * 套餐创建 Schema
 */
export const createBundleSchema = bundlePriceRefinement(
  bundleBaseSchema.extend({
    status: z.enum(ProductStatusValues).optional().default('ACTIVE'),
  })
);

/**
 * 套餐更新 Schema
 */
export const updateBundleSchema = bundleBaseSchema.partial().extend({
  id: z.string().min(1, '套餐ID不能为空'),
});

// ============================================
// 模板验证 Schema
// ============================================

/**
 * 文本样式 Schema
 */
export const textStyleSchema = z.object({
  fontFamily: z.string().min(1, '请选择字体'),
  fontSize: z.number().min(8, '字号不能小于8').max(72, '字号不能大于72'),
  fontWeight: z.enum(['normal', 'bold']),
  fontStyle: z.enum(['normal', 'italic']),
  textDecoration: z.enum(['none', 'underline']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '颜色格式无效'),
  textAlign: z.enum(['left', 'center', 'right']),
});

/**
 * 模板占位符 Schema
 */
export const templatePlaceholderSchema = z.object({
  key: z.string().min(1, '占位符键不能为空'),
  label: z.string().min(1, '占位符标签不能为空'),
  defaultValue: z.string(),
});

/**
 * 模板验证 Schema
 */
export const templateSchema = z.object({
  name: z.string().min(1, '模板名称不能为空').max(100, '模板名称不能超过100个字符'),
  type: z.enum(TemplateTypeValues, { errorMap: () => ({ message: '请选择模板类型' }) }),
  content: z.string().min(1, '模板内容不能为空'),
  placeholders: z.array(templatePlaceholderSchema).optional().default([]),
  styles: z.record(z.string(), textStyleSchema).optional().default({}),
  isActive: z.boolean().optional().default(true),
});

/**
 * 模板创建 Schema
 */
export const createTemplateSchema = templateSchema;

/**
 * 模板更新 Schema
 */
export const updateTemplateSchema = templateSchema.partial().extend({
  id: z.string().min(1, '模板ID不能为空'),
});

// ============================================
// 验证函数
// ============================================

/**
 * 将 Zod 错误转换为 ValidationResult
 */
function zodErrorToValidationResult(error: z.ZodError): ValidationResult {
  const errors: ValidationError[] = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: getErrorCode(err.code),
  }));

  return {
    valid: false,
    errors,
  };
}

/**
 * 获取错误代码
 */
function getErrorCode(zodCode: string): ValidationError['code'] {
  switch (zodCode) {
    case 'invalid_type':
      return 'invalid_type';
    case 'too_small':
    case 'too_big':
      return 'out_of_range';
    case 'invalid_string':
      return 'invalid_format';
    default:
      return 'required';
  }
}

/**
 * 验证产品数据
 */
export function validateProduct(data: unknown): ValidationResult {
  const result = productSchema.safeParse(data);
  
  if (result.success) {
    return { valid: true, errors: [] };
  }
  
  return zodErrorToValidationResult(result.error);
}

/**
 * 验证套餐数据
 */
export function validateBundle(data: unknown): ValidationResult {
  const result = bundleSchema.safeParse(data);
  
  if (result.success) {
    return { valid: true, errors: [] };
  }
  
  return zodErrorToValidationResult(result.error);
}

/**
 * 验证模板数据
 */
export function validateTemplate(data: unknown): ValidationResult {
  const result = templateSchema.safeParse(data);
  
  if (result.success) {
    return { valid: true, errors: [] };
  }
  
  return zodErrorToValidationResult(result.error);
}

/**
 * 验证文本样式
 */
export function validateTextStyle(data: unknown): ValidationResult {
  const result = textStyleSchema.safeParse(data);
  
  if (result.success) {
    return { valid: true, errors: [] };
  }
  
  return zodErrorToValidationResult(result.error);
}

// ============================================
// 套餐价格验证
// ============================================

/**
 * 计算套餐原价（各设备价格之和）
 */
export function calculateBundleOriginalPrice(
  items: Array<{ equipmentId: string; quantity: number; equipment?: { price: number } }>
): number {
  return items.reduce((sum, item) => {
    const price = item.equipment?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);
}

/**
 * 验证套餐价格是否有效（必须低于原价）
 */
export function validateBundlePrice(bundlePrice: number, originalPrice: number): boolean {
  return bundlePrice > 0 && bundlePrice < originalPrice;
}

/**
 * 计算套餐节省金额
 */
export function calculateBundleSavings(bundlePrice: number, originalPrice: number): number {
  return Math.max(0, originalPrice - bundlePrice);
}

// ============================================
// 规格验证
// ============================================

/**
 * 验证规格键值对
 */
export function validateSpecification(key: string, value: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!key || key.trim().length === 0) {
    errors.push({
      field: 'key',
      message: '规格名称不能为空',
      code: 'required',
    });
  } else if (key.length > 50) {
    errors.push({
      field: 'key',
      message: '规格名称不能超过50个字符',
      code: 'out_of_range',
    });
  }

  if (!value || value.trim().length === 0) {
    errors.push({
      field: 'value',
      message: '规格值不能为空',
      code: 'required',
    });
  } else if (value.length > 200) {
    errors.push({
      field: 'value',
      message: '规格值不能超过200个字符',
      code: 'out_of_range',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// 表单状态操作
// ============================================

/**
 * 更新产品表单的分类ID
 * 用于属性测试验证分类变更是否正确更新表单状态
 */
export function updateProductCategory<T extends { categoryId: string }>(
  formState: T,
  newCategoryId: string
): T {
  return {
    ...formState,
    categoryId: newCategoryId,
  };
}

/**
 * 验证分类ID是否有效
 */
export function isValidCategoryId(categoryId: string): boolean {
  return typeof categoryId === 'string' && categoryId.trim().length > 0;
}

// ============================================
// 导出类型
// ============================================

export type ProductInput = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type BundleInput = z.infer<typeof bundleSchema>;
export type CreateBundleInput = z.infer<typeof createBundleSchema>;
export type UpdateBundleInput = z.infer<typeof updateBundleSchema>;
export type TemplateInput = z.infer<typeof templateSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type TextStyleInput = z.infer<typeof textStyleSchema>;

// ============================================
// 服务市场内容验证 Schema
// ============================================

/**
 * 服务市场项目验证 Schema
 */
export const serviceMarketItemSchema = z.object({
  name: z.string().min(1, '中文名称不能为空'),
  nameEn: z.string().min(1, '英文名称不能为空'),
  description: z.string().min(1, '中文描述不能为空'),
  descriptionEn: z.string().min(1, '英文描述不能为空'),
  price: z.number().min(0, '价格不能为负数'),
  category: z.string().min(1, '分类不能为空'),
  iconType: z.string().min(1, '图标类型不能为空'),
  order: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

/**
 * 精选作品验证 Schema
 */
export const featuredWorkSchema = z.object({
  title: z.string().min(1, '中文标题不能为空'),
  titleEn: z.string().min(1, '英文标题不能为空'),
  slug: z.string().min(1, 'URL slug不能为空').regex(/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符'),
  description: z.string().min(1, '中文描述不能为空'),
  descriptionEn: z.string().min(1, '英文描述不能为空'),
  image: z.string().min(1, '封面图片不能为空'),
  images: z.string().min(2, '图片列表不能为空').default('[]'), // JSON array
  author: z.string().min(1, '作者不能为空'),
  teamName: z.string().min(1, '团队名称不能为空'),
  category: z.string().min(1, '分类不能为空'),
  tags: z.string().min(2, '标签不能为空').default('[]'), // JSON array
  viewCount: z.number().int().min(0).optional().default(0),
  likeCount: z.number().int().min(0).optional().default(0),
  featured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional().default(0),
});

/**
 * 服务定价验证 Schema
 */
export const servicePricingSchema = z.object({
  name: z.string().min(1, '中文名称不能为空'),
  nameEn: z.string().min(1, '英文名称不能为空'),
  description: z.string().min(1, '中文描述不能为空'),
  descriptionEn: z.string().min(1, '英文描述不能为空'),
  price: z.number().min(0, '价格不能为负数'),
  originalPrice: z.number().min(0, '原价不能为负数'),
  discountPercent: z.number().min(0).max(100, '折扣百分比必须在0-100之间').optional().default(0),
  features: z.string().min(2, '功能列表不能为空').default('[]'), // JSON array
  featuresEn: z.string().min(2, '英文功能列表不能为空').default('[]'), // JSON array
  category: z.string().min(1, '分类不能为空'),
  recommended: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional().default(0),
});

/**
 * 服务项目验证 Schema
 */
export const serviceProjectSchema = z.object({
  name: z.string().min(1, '中文名称不能为空'),
  nameEn: z.string().min(1, '英文名称不能为空'),
  description: z.string().min(1, '中文描述不能为空'),
  descriptionEn: z.string().min(1, '英文描述不能为空'),
  startingPrice: z.string().min(1, '起始价格不能为空'),
  iconName: z.string().min(1, '图标名称不能为空'),
  categoryTag: z.string().optional().default(''),
  order: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

// ============================================
// 服务市场内容验证函数
// ============================================

/**
 * 验证服务市场项目数据
 */
export function validateServiceMarketItem(data: unknown): ValidationResult {
  const result = serviceMarketItemSchema.safeParse(data);
  
  if (result.success) {
    return { valid: true, errors: [] };
  }
  
  return zodErrorToValidationResult(result.error);
}

/**
 * 验证精选作品数据
 */
export function validateFeaturedWork(data: unknown): ValidationResult {
  const result = featuredWorkSchema.safeParse(data);
  
  if (result.success) {
    return { valid: true, errors: [] };
  }
  
  return zodErrorToValidationResult(result.error);
}

/**
 * 验证服务定价数据
 */
export function validateServicePricing(data: unknown): ValidationResult {
  const result = servicePricingSchema.safeParse(data);
  
  if (result.success) {
    return { valid: true, errors: [] };
  }
  
  return zodErrorToValidationResult(result.error);
}

/**
 * 验证服务项目数据
 */
export function validateServiceProject(data: unknown): ValidationResult {
  const result = serviceProjectSchema.safeParse(data);
  
  if (result.success) {
    return { valid: true, errors: [] };
  }
  
  return zodErrorToValidationResult(result.error);
}

// ============================================
// 服务市场内容导出类型
// ============================================

export type ServiceMarketItemInput = z.infer<typeof serviceMarketItemSchema>;
export type FeaturedWorkInput = z.infer<typeof featuredWorkSchema>;
export type ServicePricingInput = z.infer<typeof servicePricingSchema>;
export type ServiceProjectInput = z.infer<typeof serviceProjectSchema>;
