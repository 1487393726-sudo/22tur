// 首页区块编辑系统工具函数

import type { ReorderItem } from '@/types/homepage';

/**
 * 重排序数组元素
 * @param items 原始数组
 * @param reorderItems 重排序信息
 * @returns 重排序后的数组
 */
export function reorderItems<T extends { id: string; order: number }>(
  items: T[],
  reorderItems: ReorderItem[]
): T[] {
  const orderMap = new Map(reorderItems.map(item => [item.id, item.order]));
  
  return items
    .map(item => ({
      ...item,
      order: orderMap.get(item.id) ?? item.order,
    }))
    .sort((a, b) => a.order - b.order);
}

/**
 * 过滤活跃项目
 * @param items 原始数组
 * @returns 只包含活跃项目的数组
 */
export function filterActiveItems<T extends { isActive: boolean }>(items: T[]): T[] {
  return items.filter(item => item.isActive);
}

/**
 * 按order字段排序
 * @param items 原始数组
 * @returns 排序后的数组
 */
export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

/**
 * 获取下一个order值
 * @param items 现有数组
 * @returns 下一个order值
 */
export function getNextOrder<T extends { order: number }>(items: T[]): number {
  if (items.length === 0) return 0;
  return Math.max(...items.map(item => item.order)) + 1;
}

/**
 * 社交媒体平台列表
 */
export const SOCIAL_PLATFORMS = [
  { value: 'wechat', label: '微信', labelEn: 'WeChat' },
  { value: 'weibo', label: '微博', labelEn: 'Weibo' },
  { value: 'twitter', label: 'Twitter', labelEn: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn', labelEn: 'LinkedIn' },
  { value: 'github', label: 'GitHub', labelEn: 'GitHub' },
  { value: 'facebook', label: 'Facebook', labelEn: 'Facebook' },
  { value: 'instagram', label: 'Instagram', labelEn: 'Instagram' },
  { value: 'youtube', label: 'YouTube', labelEn: 'YouTube' },
  { value: 'tiktok', label: '抖音/TikTok', labelEn: 'TikTok' },
  { value: 'bilibili', label: 'Bilibili', labelEn: 'Bilibili' },
  { value: 'zhihu', label: '知乎', labelEn: 'Zhihu' },
  { value: 'douyin', label: '抖音', labelEn: 'Douyin' },
  { value: 'xiaohongshu', label: '小红书', labelEn: 'Xiaohongshu' },
] as const;

/**
 * 按钮样式选项
 */
export const BUTTON_VARIANTS = [
  { value: 'primary', label: '主要', labelEn: 'Primary' },
  { value: 'secondary', label: '次要', labelEn: 'Secondary' },
  { value: 'outline', label: '轮廓', labelEn: 'Outline' },
] as const;

/**
 * 常用图标列表
 */
export const COMMON_ICONS = [
  'Users', 'Building', 'Globe', 'Award', 'Star', 'Heart', 'ThumbsUp',
  'Zap', 'Shield', 'Clock', 'Calendar', 'Mail', 'Phone', 'MapPin',
  'Code', 'Palette', 'Camera', 'Video', 'Music', 'FileText', 'Folder',
  'Settings', 'Search', 'Filter', 'Download', 'Upload', 'Share',
  'Link', 'ExternalLink', 'ChevronRight', 'ArrowRight', 'Check',
  'Plus', 'Minus', 'X', 'Menu', 'MoreHorizontal', 'MoreVertical',
  'Home', 'User', 'Lock', 'Unlock', 'Eye', 'EyeOff', 'Bell',
  'MessageCircle', 'Send', 'Inbox', 'Archive', 'Trash', 'Edit',
  'Copy', 'Clipboard', 'Save', 'Refresh', 'RotateCcw', 'RotateCw',
] as const;

/**
 * 获取社交媒体平台图标
 */
export function getSocialIcon(platform: string): string {
  const iconMap: Record<string, string> = {
    wechat: 'MessageCircle',
    weibo: 'AtSign',
    twitter: 'Twitter',
    linkedin: 'Linkedin',
    github: 'Github',
    facebook: 'Facebook',
    instagram: 'Instagram',
    youtube: 'Youtube',
    tiktok: 'Music',
    bilibili: 'Play',
    zhihu: 'HelpCircle',
    douyin: 'Music',
    xiaohongshu: 'BookOpen',
  };
  return iconMap[platform] || 'Link';
}

/**
 * 根据语言获取内容
 */
export function getLocalizedContent<T extends Record<string, unknown>>(
  item: T,
  locale: string,
  fields: string[]
): T {
  const result = { ...item };
  
  fields.forEach(field => {
    const enField = `${field}En`;
    if (locale === 'en' && enField in item && item[enField]) {
      (result as Record<string, unknown>)[field] = item[enField];
    }
  });
  
  return result;
}
