/**
 * 内容编辑器工具函数
 * Content Editor Utility Functions
 */

// 复用 lib/content/utils.ts 中的函数
export { 
  generateSlug, 
  generateSlugFromEn, 
  reorderArray, 
  updateOrderValues,
  parseTags,
  stringifyTags,
  getLocalizedField,
  getLocalizedContent,
} from '@/lib/content/utils';

// ============================================
// 分类过滤
// ============================================

/**
 * 按分类过滤内容项
 * Filter content items by category
 */
export function filterByCategory<T extends { category: string }>(
  items: T[],
  category: string | null | undefined
): T[] {
  if (!category || category === 'all' || category === '') {
    return items;
  }
  return items.filter(item => item.category === category);
}

/**
 * 获取唯一分类列表
 * Get unique categories from items
 */
export function getCategories<T extends { category: string }>(items: T[]): string[] {
  const categories = new Set(items.map(item => item.category));
  return Array.from(categories).sort();
}

// ============================================
// 价格计算
// ============================================

/**
 * 计算折扣后价格
 * Calculate discounted price
 */
export function calculateDiscountedPrice(originalPrice: number, discountPercent: number): number {
  if (discountPercent < 0 || discountPercent > 100) {
    return originalPrice;
  }
  return Math.round(originalPrice * (1 - discountPercent / 100));
}

/**
 * 计算折扣百分比
 * Calculate discount percentage from original and current price
 */
export function calculateDiscountPercent(originalPrice: number, currentPrice: number): number {
  if (originalPrice <= 0 || currentPrice < 0) {
    return 0;
  }
  if (currentPrice >= originalPrice) {
    return 0;
  }
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * 格式化价格显示
 * Format price for display
 */
export function formatPrice(price: number, currency: string = '¥'): string {
  return `${currency}${price.toLocaleString()}`;
}

/**
 * 格式化价格范围
 * Format price range for display
 */
export function formatPriceRange(minPrice: number, maxPrice: number, currency: string = '¥'): string {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, currency);
  }
  return `${currency}${minPrice.toLocaleString()} - ${currency}${maxPrice.toLocaleString()}`;
}

// ============================================
// JSON 数组处理
// ============================================

/**
 * 解析 JSON 数组字符串
 * Parse JSON array string
 */
export function parseJsonArray(jsonStr: string | null | undefined): string[] {
  if (!jsonStr || jsonStr.trim() === '') {
    return [];
  }
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      return parsed.filter(item => typeof item === 'string');
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * 序列化数组为 JSON 字符串
 * Stringify array to JSON string
 */
export function stringifyArray(arr: string[]): string {
  return JSON.stringify(arr.filter(item => item && item.trim() !== ''));
}

// ============================================
// 功能列表操作
// ============================================

/**
 * 添加功能到列表
 * Add feature to features list
 */
export function addFeature(featuresJson: string, feature: string): string {
  const features = parseJsonArray(featuresJson);
  if (feature.trim() && !features.includes(feature.trim())) {
    features.push(feature.trim());
  }
  return stringifyArray(features);
}

/**
 * 从列表移除功能
 * Remove feature from features list
 */
export function removeFeature(featuresJson: string, index: number): string {
  const features = parseJsonArray(featuresJson);
  if (index >= 0 && index < features.length) {
    features.splice(index, 1);
  }
  return stringifyArray(features);
}

/**
 * 更新列表中的功能
 * Update feature in features list
 */
export function updateFeature(featuresJson: string, index: number, newFeature: string): string {
  const features = parseJsonArray(featuresJson);
  if (index >= 0 && index < features.length && newFeature.trim()) {
    features[index] = newFeature.trim();
  }
  return stringifyArray(features);
}

// ============================================
// 排序操作
// ============================================

/**
 * 按 order 字段排序
 * Sort items by order field
 */
export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

/**
 * 精选优先排序
 * Sort with featured items first
 */
export function sortFeaturedFirst<T extends { featured: boolean; order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    // Featured items first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    // Then by order
    return a.order - b.order;
  });
}

/**
 * 推荐优先排序
 * Sort with recommended items first
 */
export function sortRecommendedFirst<T extends { recommended: boolean; order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    // Recommended items first
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    // Then by order
    return a.order - b.order;
  });
}

// ============================================
// 图标处理
// ============================================

/**
 * 内容编辑器分类列表
 * Content editor categories
 */
export const CONTENT_EDITOR_CATEGORIES = [
  { value: 'web', label: '网站开发' },
  { value: 'mobile', label: '移动应用' },
  { value: 'design', label: 'UI/UX设计' },
  { value: 'marketing', label: '数字营销' },
  { value: 'consulting', label: '技术咨询' },
  { value: 'ecommerce', label: '电商解决方案' },
  { value: 'ai', label: 'AI/机器学习' },
  { value: 'cloud', label: '云服务' },
  { value: 'security', label: '安全服务' },
  { value: 'other', label: '其他' },
] as const;

export type ContentEditorCategory = typeof CONTENT_EDITOR_CATEGORIES[number]['value'];

/**
 * 常用 Lucide 图标列表
 * Common Lucide icons for content editor
 */
export const COMMON_ICONS = [
  'Code', 'Palette', 'Smartphone', 'Globe', 'Megaphone', 'Lightbulb',
  'Briefcase', 'ShoppingCart', 'Users', 'Settings', 'FileText', 'Image',
  'Video', 'Music', 'Camera', 'Mic', 'Monitor', 'Laptop', 'Tablet',
  'Server', 'Database', 'Cloud', 'Lock', 'Shield', 'Zap', 'Star',
  'Heart', 'ThumbsUp', 'MessageCircle', 'Mail', 'Phone', 'MapPin',
  'Calendar', 'Clock', 'Search', 'Filter', 'Edit', 'Trash', 'Plus',
  'Minus', 'Check', 'X', 'ArrowRight', 'ArrowLeft', 'ChevronRight',
  'ChevronDown', 'ExternalLink', 'Download', 'Upload', 'Share',
  'Copy', 'Clipboard', 'Bookmark', 'Tag', 'Folder', 'File',
  'Package', 'Box', 'Gift', 'Award', 'Trophy', 'Target', 'TrendingUp',
] as const;

export type CommonIcon = typeof COMMON_ICONS[number];

/**
 * 验证图标名称是否有效
 * Validate if icon name is valid
 */
export function isValidIconName(iconName: string): boolean {
  return COMMON_ICONS.includes(iconName as CommonIcon);
}
