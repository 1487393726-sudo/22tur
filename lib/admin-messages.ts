/**
 * 管理后台翻译消息加载器
 * 支持6种语言：简体中文、繁体中文、英语、日语、韩语、维吾尔语
 */

import type { Locale } from '@/i18n';

// 简体中文
import zhAdmin from '@/messages/zh/admin.json';
import zhCommon from '@/messages/zh/common.json';

// 繁体中文
import zhTWAdmin from '@/messages/zh-TW/admin.json';
import zhTWCommon from '@/messages/zh-TW/common.json';

// 英语
import enAdmin from '@/messages/en/admin.json';
import enCommon from '@/messages/en/common.json';

// 日语
import jaAdmin from '@/messages/ja/admin.json';
import jaCommon from '@/messages/ja/common.json';

// 韩语
import koAdmin from '@/messages/ko/admin.json';
import koCommon from '@/messages/ko/common.json';

// 维吾尔语
import ugAdmin from '@/messages/ug/admin.json';
import ugCommon from '@/messages/ug/common.json';

export type AdminLocale = 'zh' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'ug';

export const ADMIN_MESSAGES: Record<AdminLocale, { admin: typeof zhAdmin; common: typeof zhCommon }> = {
  'zh': { admin: zhAdmin, common: zhCommon },
  'zh-TW': { admin: zhTWAdmin, common: zhTWCommon },
  'en': { admin: enAdmin, common: enCommon },
  'ja': { admin: jaAdmin, common: jaCommon },
  'ko': { admin: koAdmin, common: koCommon },
  'ug': { admin: ugAdmin, common: ugCommon },
};

export function getAdminMessages(locale: AdminLocale) {
  return ADMIN_MESSAGES[locale] || ADMIN_MESSAGES['zh'];
}

// RTL语言列表
export const RTL_LOCALES: AdminLocale[] = ['ug'];

export function isRTL(locale: AdminLocale): boolean {
  return RTL_LOCALES.includes(locale);
}

// 语言显示名称
export const ADMIN_LOCALE_NAMES: Record<AdminLocale, string> = {
  'zh': '简体中文',
  'zh-TW': '繁體中文',
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어',
  'ug': 'ئۇيغۇرچە',
};
