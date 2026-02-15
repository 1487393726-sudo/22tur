import { z } from 'zod';

// ============================================
// Team Member Schemas
// ============================================

export const teamMemberSchema = z.object({
  name: z.string().min(1, '中文名不能为空'),
  nameEn: z.string().min(1, '英文名不能为空'),
  role: z.string().min(1, '中文职位不能为空'),
  roleEn: z.string().min(1, '英文职位不能为空'),
  bio: z.string().min(1, '中文简介不能为空'),
  bioEn: z.string().min(1, '英文简介不能为空'),
  avatar: z.string().min(1, '头像URL不能为空'),
  order: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const teamMemberUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  roleEn: z.string().min(1).optional(),
  bio: z.string().min(1).optional(),
  bioEn: z.string().min(1).optional(),
  avatar: z.string().min(1).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// Blog Post Schemas
// ============================================

export const blogPostSchema = z.object({
  title: z.string().min(1, '中文标题不能为空'),
  titleEn: z.string().min(1, '英文标题不能为空'),
  slug: z.string().min(1, 'URL slug不能为空').regex(/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符'),
  excerpt: z.string().min(1, '中文摘要不能为空'),
  excerptEn: z.string().min(1, '英文摘要不能为空'),
  content: z.string().min(1, '中文内容不能为空'),
  contentEn: z.string().optional(),
  image: z.string().min(1, '封面图片不能为空'),
  category: z.string().min(1, '分类不能为空'),
  author: z.string().min(1, '作者不能为空'),
  readTime: z.string().min(1, '阅读时间不能为空'),
  publishedAt: z.string().transform((val) => new Date(val)),
  isPublished: z.boolean().optional().default(false),
});

export const blogPostUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  titleEn: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符').optional(),
  excerpt: z.string().min(1).optional(),
  excerptEn: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  contentEn: z.string().optional(),
  image: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  readTime: z.string().min(1).optional(),
  publishedAt: z.string().transform((val) => new Date(val)).optional(),
  isPublished: z.boolean().optional(),
});

// ============================================
// Portfolio Item Schemas
// ============================================

export const portfolioItemSchema = z.object({
  title: z.string().min(1, '中文标题不能为空'),
  titleEn: z.string().min(1, '英文标题不能为空'),
  slug: z.string().min(1, 'URL slug不能为空').regex(/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符'),
  description: z.string().min(1, '中文描述不能为空'),
  descriptionEn: z.string().min(1, '英文描述不能为空'),
  image: z.string().min(1, '封面图片不能为空'),
  category: z.string().min(1, '分类不能为空'),
  tags: z.string().min(2, '标签不能为空'), // JSON array string
  client: z.string().optional(),
  link: z.string().optional(),
  featured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional().default(0),
});

export const portfolioItemUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  titleEn: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符').optional(),
  description: z.string().min(1).optional(),
  descriptionEn: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  tags: z.string().optional(),
  client: z.string().optional(),
  link: z.string().optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

// ============================================
// Reorder Schema
// ============================================

export const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1),
    order: z.number().int().min(0),
  })).min(1, '至少需要一个项目'),
});

// ============================================
// Validation Error Handling
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

export function handleValidationError(error: z.ZodError): ValidationError[] {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(e => `${e.field}: ${e.message}`).join('; ');
}

// Type exports
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
export type TeamMemberUpdateInput = z.infer<typeof teamMemberUpdateSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>;
export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>;
export type PortfolioItemUpdateInput = z.infer<typeof portfolioItemUpdateSchema>;
export type ReorderInput = z.infer<typeof reorderSchema>;
