/**
 * Content Management Utility Functions
 * 内容管理工具函数
 */

// ============================================
// Slug Generation
// ============================================

/**
 * Generate URL-friendly slug from title
 * 从标题生成 URL 友好的 slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Remove Chinese characters and replace with pinyin or empty
    .replace(/[\u4e00-\u9fa5]/g, '')
    // Replace spaces and special chars with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Collapse multiple hyphens
    .replace(/-+/g, '-');
}

/**
 * Generate slug from English title (preferred)
 */
export function generateSlugFromEn(titleEn: string): string {
  return titleEn
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

// ============================================
// Tags Handling
// ============================================

/**
 * Parse JSON tags string to array
 * 解析 JSON 标签字符串为数组
 */
export function parseTags(tagsJson: string): string[] {
  if (!tagsJson || tagsJson.trim() === '') {
    return [];
  }
  try {
    const parsed = JSON.parse(tagsJson);
    if (Array.isArray(parsed)) {
      return parsed.filter(tag => typeof tag === 'string' && tag.trim() !== '');
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Stringify tags array to JSON
 * 将标签数组序列化为 JSON 字符串
 */
export function stringifyTags(tags: string[]): string {
  return JSON.stringify(tags.filter(tag => tag.trim() !== ''));
}

// ============================================
// Array Reordering
// ============================================

/**
 * Reorder array by moving item from one index to another
 * 通过将项目从一个索引移动到另一个索引来重新排序数组
 */
export function reorderArray<T extends { id: string }>(
  items: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  if (fromIndex < 0 || fromIndex >= items.length) {
    return items;
  }
  if (toIndex < 0 || toIndex >= items.length) {
    return items;
  }
  if (fromIndex === toIndex) {
    return items;
  }

  const result = [...items];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Update order values for items after reordering
 * 重新排序后更新项目的 order 值
 */
export function updateOrderValues<T extends { id: string; order?: number }>(
  items: T[]
): Array<T & { order: number }> {
  return items.map((item, index) => ({
    ...item,
    order: index,
  }));
}

// ============================================
// Blog Post Filtering
// ============================================

export interface BlogPostFilterOptions {
  status?: 'all' | 'published' | 'draft';
  category?: string;
}

export interface BlogPostLike {
  isPublished: boolean;
  category: string;
}

/**
 * Filter blog posts by status and category
 * 按状态和分类过滤博客文章
 */
export function filterBlogPosts<T extends BlogPostLike>(
  posts: T[],
  filters: BlogPostFilterOptions
): T[] {
  return posts.filter(post => {
    // Filter by status
    if (filters.status === 'published' && !post.isPublished) {
      return false;
    }
    if (filters.status === 'draft' && post.isPublished) {
      return false;
    }
    
    // Filter by category
    if (filters.category && filters.category !== '' && post.category !== filters.category) {
      return false;
    }
    
    return true;
  });
}

// ============================================
// Content Helpers
// ============================================

/**
 * Get unique categories from posts
 * 从文章中获取唯一的分类
 */
export function getUniqueCategories<T extends { category: string }>(items: T[]): string[] {
  const categories = new Set(items.map(item => item.category));
  return Array.from(categories).sort();
}

/**
 * Calculate read time from content
 * 根据内容计算阅读时间
 */
export function calculateReadTime(content: string, wordsPerMinute = 200): string {
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Truncate text to specified length
 * 将文本截断到指定长度
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength).trim() + '...';
}

// ============================================
// Bilingual Content Helpers
// ============================================

export type Locale = 'zh' | 'en';

/**
 * Get localized content field
 * 获取本地化内容字段
 */
export function getLocalizedField<T extends Record<string, unknown>>(
  item: T,
  field: string,
  locale: Locale
): string {
  const enField = `${field}En`;
  if (locale === 'en' && enField in item && item[enField]) {
    return String(item[enField]);
  }
  if (field in item) {
    return String(item[field]);
  }
  return '';
}

/**
 * Get localized content for common fields
 * 获取常用字段的本地化内容
 */
export function getLocalizedContent<T extends {
  name?: string;
  nameEn?: string;
  title?: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  bio?: string;
  bioEn?: string;
  role?: string;
  roleEn?: string;
  excerpt?: string;
  excerptEn?: string;
}>(item: T, locale: Locale): {
  name?: string;
  title?: string;
  description?: string;
  bio?: string;
  role?: string;
  excerpt?: string;
} {
  return {
    name: locale === 'en' && item.nameEn ? item.nameEn : item.name,
    title: locale === 'en' && item.titleEn ? item.titleEn : item.title,
    description: locale === 'en' && item.descriptionEn ? item.descriptionEn : item.description,
    bio: locale === 'en' && item.bioEn ? item.bioEn : item.bio,
    role: locale === 'en' && item.roleEn ? item.roleEn : item.role,
    excerpt: locale === 'en' && item.excerptEn ? item.excerptEn : item.excerpt,
  };
}
