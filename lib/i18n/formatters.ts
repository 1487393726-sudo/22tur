/**
 * 国际化格式化工具
 * 支持日期、时间、货币和相对时间的本地化格式化
 */

export type SupportedLocale = 'zh' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'ug';

// 语言代码映射到 Intl 语言标签
const localeMap: Record<SupportedLocale, string> = {
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
  ug: 'ug', // 维吾尔语
};

// 货币代码映射
const currencyMap: Record<SupportedLocale, string> = {
  zh: 'CNY',
  'zh-TW': 'TWD',
  en: 'USD',
  ja: 'JPY',
  ko: 'KRW',
  ug: 'CNY',
};

// 相对时间翻译
const relativeTimeTranslations: Record<SupportedLocale, {
  justNow: string;
  minutesAgo: string;
  hoursAgo: string;
  daysAgo: string;
  weeksAgo: string;
  monthsAgo: string;
  yearsAgo: string;
  yesterday: string;
  today: string;
  tomorrow: string;
  inMinutes: string;
  inHours: string;
  inDays: string;
}> = {
  zh: {
    justNow: '刚刚',
    minutesAgo: '{n}分钟前',
    hoursAgo: '{n}小时前',
    daysAgo: '{n}天前',
    weeksAgo: '{n}周前',
    monthsAgo: '{n}个月前',
    yearsAgo: '{n}年前',
    yesterday: '昨天',
    today: '今天',
    tomorrow: '明天',
    inMinutes: '{n}分钟后',
    inHours: '{n}小时后',
    inDays: '{n}天后',
  },
  'zh-TW': {
    justNow: '剛剛',
    minutesAgo: '{n}分鐘前',
    hoursAgo: '{n}小時前',
    daysAgo: '{n}天前',
    weeksAgo: '{n}週前',
    monthsAgo: '{n}個月前',
    yearsAgo: '{n}年前',
    yesterday: '昨天',
    today: '今天',
    tomorrow: '明天',
    inMinutes: '{n}分鐘後',
    inHours: '{n}小時後',
    inDays: '{n}天後',
  },
  en: {
    justNow: 'just now',
    minutesAgo: '{n} minutes ago',
    hoursAgo: '{n} hours ago',
    daysAgo: '{n} days ago',
    weeksAgo: '{n} weeks ago',
    monthsAgo: '{n} months ago',
    yearsAgo: '{n} years ago',
    yesterday: 'yesterday',
    today: 'today',
    tomorrow: 'tomorrow',
    inMinutes: 'in {n} minutes',
    inHours: 'in {n} hours',
    inDays: 'in {n} days',
  },
  ja: {
    justNow: 'たった今',
    minutesAgo: '{n}分前',
    hoursAgo: '{n}時間前',
    daysAgo: '{n}日前',
    weeksAgo: '{n}週間前',
    monthsAgo: '{n}ヶ月前',
    yearsAgo: '{n}年前',
    yesterday: '昨日',
    today: '今日',
    tomorrow: '明日',
    inMinutes: '{n}分後',
    inHours: '{n}時間後',
    inDays: '{n}日後',
  },
  ko: {
    justNow: '방금',
    minutesAgo: '{n}분 전',
    hoursAgo: '{n}시간 전',
    daysAgo: '{n}일 전',
    weeksAgo: '{n}주 전',
    monthsAgo: '{n}개월 전',
    yearsAgo: '{n}년 전',
    yesterday: '어제',
    today: '오늘',
    tomorrow: '내일',
    inMinutes: '{n}분 후',
    inHours: '{n}시간 후',
    inDays: '{n}일 후',
  },
  ug: {
    justNow: 'ھازىر',
    minutesAgo: '{n} مىنۇت بۇرۇن',
    hoursAgo: '{n} سائەت بۇرۇن',
    daysAgo: '{n} كۈن بۇرۇن',
    weeksAgo: '{n} ھەپتە بۇرۇن',
    monthsAgo: '{n} ئاي بۇرۇن',
    yearsAgo: '{n} يىل بۇرۇن',
    yesterday: 'تۈنۈگۈن',
    today: 'بۈگۈن',
    tomorrow: 'ئەتە',
    inMinutes: '{n} مىنۇتتىن كېيىن',
    inHours: '{n} سائەتتىن كېيىن',
    inDays: '{n} كۈندىن كېيىن',
  },
};

/**
 * 获取 Intl 语言标签
 */
export function getIntlLocale(locale: SupportedLocale): string {
  return localeMap[locale] || 'en-US';
}

/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param locale 语言代码
 * @param options 格式化选项
 */
export function formatDate(
  date: Date | number | string,
  locale: SupportedLocale = 'zh',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const intlLocale = getIntlLocale(locale);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  try {
    return new Intl.DateTimeFormat(intlLocale, defaultOptions).format(dateObj);
  } catch {
    // 回退到基本格式
    return dateObj.toLocaleDateString();
  }
}

/**
 * 格式化短日期 (如: 2024/01/15)
 */
export function formatShortDate(
  date: Date | number | string,
  locale: SupportedLocale = 'zh'
): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * 格式化长日期 (如: 2024年1月15日 星期一)
 */
export function formatLongDate(
  date: Date | number | string,
  locale: SupportedLocale = 'zh'
): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

/**
 * 格式化时间
 * @param date 日期对象或时间戳
 * @param locale 语言代码
 * @param options 格式化选项
 */
export function formatTime(
  date: Date | number | string,
  locale: SupportedLocale = 'zh',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const intlLocale = getIntlLocale(locale);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  
  try {
    return new Intl.DateTimeFormat(intlLocale, defaultOptions).format(dateObj);
  } catch {
    return dateObj.toLocaleTimeString();
  }
}

/**
 * 格式化日期时间
 */
export function formatDateTime(
  date: Date | number | string,
  locale: SupportedLocale = 'zh',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const intlLocale = getIntlLocale(locale);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  
  try {
    return new Intl.DateTimeFormat(intlLocale, defaultOptions).format(dateObj);
  } catch {
    return dateObj.toLocaleString();
  }
}

/**
 * 格式化货币
 * @param amount 金额
 * @param locale 语言代码
 * @param currency 货币代码（可选，默认根据语言自动选择）
 */
export function formatCurrency(
  amount: number,
  locale: SupportedLocale = 'zh',
  currency?: string
): string {
  const intlLocale = getIntlLocale(locale);
  const currencyCode = currency || currencyMap[locale] || 'CNY';
  
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

/**
 * 格式化数字
 * @param num 数字
 * @param locale 语言代码
 * @param options 格式化选项
 */
export function formatNumber(
  num: number,
  locale: SupportedLocale = 'zh',
  options: Intl.NumberFormatOptions = {}
): string {
  const intlLocale = getIntlLocale(locale);
  
  try {
    return new Intl.NumberFormat(intlLocale, options).format(num);
  } catch {
    return num.toString();
  }
}

/**
 * 格式化百分比
 */
export function formatPercent(
  num: number,
  locale: SupportedLocale = 'zh',
  decimals: number = 0
): string {
  return formatNumber(num, locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 格式化相对时间
 * @param date 日期对象或时间戳
 * @param locale 语言代码
 * @param baseDate 基准日期（默认为当前时间）
 */
export function formatRelativeTime(
  date: Date | number | string,
  locale: SupportedLocale = 'zh',
  baseDate: Date = new Date()
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const diff = dateObj.getTime() - baseDate.getTime();
  const absDiff = Math.abs(diff);
  const isPast = diff < 0;
  
  const translations = relativeTimeTranslations[locale] || relativeTimeTranslations.en;
  
  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  // 检查是否是昨天、今天或明天
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);
  const targetDay = new Date(dateObj);
  targetDay.setHours(0, 0, 0, 0);
  const dayDiff = Math.round((targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (dayDiff === 0) return translations.today;
  if (dayDiff === -1) return translations.yesterday;
  if (dayDiff === 1) return translations.tomorrow;
  
  // 相对时间
  if (isPast) {
    if (seconds < 60) return translations.justNow;
    if (minutes < 60) return translations.minutesAgo.replace('{n}', String(minutes));
    if (hours < 24) return translations.hoursAgo.replace('{n}', String(hours));
    if (days < 7) return translations.daysAgo.replace('{n}', String(days));
    if (weeks < 4) return translations.weeksAgo.replace('{n}', String(weeks));
    if (months < 12) return translations.monthsAgo.replace('{n}', String(months));
    return translations.yearsAgo.replace('{n}', String(years));
  } else {
    if (minutes < 60) return translations.inMinutes.replace('{n}', String(minutes));
    if (hours < 24) return translations.inHours.replace('{n}', String(hours));
    return translations.inDays.replace('{n}', String(days));
  }
}

/**
 * 获取月份名称列表
 */
export function getMonthNames(
  locale: SupportedLocale = 'zh',
  format: 'long' | 'short' | 'narrow' = 'long'
): string[] {
  const intlLocale = getIntlLocale(locale);
  const formatter = new Intl.DateTimeFormat(intlLocale, { month: format });
  
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2024, i, 1);
    return formatter.format(date);
  });
}

/**
 * 获取星期名称列表
 */
export function getWeekdayNames(
  locale: SupportedLocale = 'zh',
  format: 'long' | 'short' | 'narrow' = 'long'
): string[] {
  const intlLocale = getIntlLocale(locale);
  const formatter = new Intl.DateTimeFormat(intlLocale, { weekday: format });
  
  // 从周日开始
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2024, 0, i); // 2024年1月的第一个周日是7号，但我们从0开始
    date.setDate(date.getDate() - date.getDay() + i);
    return formatter.format(date);
  });
}

/**
 * 解析日期字符串
 */
export function parseDate(dateString: string): Date | null {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * 检查日期是否有效
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 获取时区名称
 */
export function getTimezoneName(
  locale: SupportedLocale = 'zh',
  timezone?: string
): string {
  const intlLocale = getIntlLocale(locale);
  const options: Intl.DateTimeFormatOptions = {
    timeZoneName: 'long',
    ...(timezone && { timeZone: timezone }),
  };
  
  try {
    const parts = new Intl.DateTimeFormat(intlLocale, options).formatToParts(new Date());
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    return tzPart?.value || '';
  } catch {
    return timezone || '';
  }
}

// 导出默认格式化器实例
export const defaultFormatters = {
  date: (date: Date | number | string) => formatDate(date, 'zh'),
  time: (date: Date | number | string) => formatTime(date, 'zh'),
  dateTime: (date: Date | number | string) => formatDateTime(date, 'zh'),
  currency: (amount: number) => formatCurrency(amount, 'zh'),
  number: (num: number) => formatNumber(num, 'zh'),
  relativeTime: (date: Date | number | string) => formatRelativeTime(date, 'zh'),
};
