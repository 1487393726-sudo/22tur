/**
 * React Hook for internationalized formatters
 * 提供本地化的日期、时间、货币和数字格式化功能
 */

'use client';

import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import {
  formatDate,
  formatShortDate,
  formatLongDate,
  formatTime,
  formatDateTime,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  getMonthNames,
  getWeekdayNames,
  type SupportedLocale,
} from './formatters';

/**
 * 格式化工具 Hook
 * 根据当前语言环境提供本地化的格式化函数
 */
export function useFormatters() {
  const locale = useLocale() as SupportedLocale;

  return useMemo(() => ({
    /**
     * 格式化日期
     * @example formatDate(new Date()) // "2024年1月15日"
     */
    formatDate: (date: Date | number | string, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, locale, options),

    /**
     * 格式化短日期
     * @example formatShortDate(new Date()) // "2024/01/15"
     */
    formatShortDate: (date: Date | number | string) =>
      formatShortDate(date, locale),

    /**
     * 格式化长日期
     * @example formatLongDate(new Date()) // "2024年1月15日 星期一"
     */
    formatLongDate: (date: Date | number | string) =>
      formatLongDate(date, locale),

    /**
     * 格式化时间
     * @example formatTime(new Date()) // "14:30"
     */
    formatTime: (date: Date | number | string, options?: Intl.DateTimeFormatOptions) =>
      formatTime(date, locale, options),

    /**
     * 格式化日期时间
     * @example formatDateTime(new Date()) // "2024年1月15日 14:30"
     */
    formatDateTime: (date: Date | number | string, options?: Intl.DateTimeFormatOptions) =>
      formatDateTime(date, locale, options),

    /**
     * 格式化货币
     * @example formatCurrency(1234.56) // "¥1,234.56"
     */
    formatCurrency: (amount: number, currency?: string) =>
      formatCurrency(amount, locale, currency),

    /**
     * 格式化数字
     * @example formatNumber(1234567) // "1,234,567"
     */
    formatNumber: (num: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(num, locale, options),

    /**
     * 格式化百分比
     * @example formatPercent(0.1234) // "12%"
     */
    formatPercent: (num: number, decimals?: number) =>
      formatPercent(num, locale, decimals),

    /**
     * 格式化相对时间
     * @example formatRelativeTime(new Date(Date.now() - 3600000)) // "1小时前"
     */
    formatRelativeTime: (date: Date | number | string, baseDate?: Date) =>
      formatRelativeTime(date, locale, baseDate),

    /**
     * 获取月份名称列表
     * @example getMonthNames() // ["一月", "二月", ...]
     */
    getMonthNames: (format?: 'long' | 'short' | 'narrow') =>
      getMonthNames(locale, format),

    /**
     * 获取星期名称列表
     * @example getWeekdayNames() // ["星期日", "星期一", ...]
     */
    getWeekdayNames: (format?: 'long' | 'short' | 'narrow') =>
      getWeekdayNames(locale, format),

    /**
     * 当前语言代码
     */
    locale,
  }), [locale]);
}

/**
 * 简化的日期格式化 Hook
 */
export function useDateFormatter() {
  const { formatDate, formatShortDate, formatLongDate, formatDateTime, formatRelativeTime } = useFormatters();
  
  return {
    format: formatDate,
    short: formatShortDate,
    long: formatLongDate,
    dateTime: formatDateTime,
    relative: formatRelativeTime,
  };
}

/**
 * 简化的数字格式化 Hook
 */
export function useNumberFormatter() {
  const { formatNumber, formatCurrency, formatPercent } = useFormatters();
  
  return {
    format: formatNumber,
    currency: formatCurrency,
    percent: formatPercent,
  };
}

export default useFormatters;
