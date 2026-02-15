"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { 
  AdminLocale, 
  getAdminMessages, 
  isRTL, 
  ADMIN_LOCALE_NAMES 
} from '@/lib/admin-messages';

interface AdminLocaleContextType {
  locale: AdminLocale;
  setLocale: (locale: AdminLocale) => void;
  isRTL: boolean;
  localeNames: typeof ADMIN_LOCALE_NAMES;
}

const AdminLocaleContext = createContext<AdminLocaleContextType | null>(null);

const STORAGE_KEY = 'admin-locale';

export function AdminLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>('zh');
  const [mounted, setMounted] = useState(false);

  // 从 localStorage 加载语言设置
  useEffect(() => {
    const savedLocale = localStorage.getItem(STORAGE_KEY) as AdminLocale;
    if (savedLocale && ADMIN_LOCALE_NAMES[savedLocale]) {
      setLocaleState(savedLocale);
    }
    setMounted(true);
  }, []);

  // 设置语言并保存到 localStorage
  const setLocale = useCallback((newLocale: AdminLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    // 更新 HTML dir 属性
    document.documentElement.dir = isRTL(newLocale) ? 'rtl' : 'ltr';
  }, []);

  // 初始化时设置 dir 属性
  useEffect(() => {
    if (mounted) {
      document.documentElement.dir = isRTL(locale) ? 'rtl' : 'ltr';
    }
  }, [locale, mounted]);

  const messages = getAdminMessages(locale);

  // 避免 hydration 不匹配
  if (!mounted) {
    return null;
  }

  return (
    <AdminLocaleContext.Provider
      value={{
        locale,
        setLocale,
        isRTL: isRTL(locale),
        localeNames: ADMIN_LOCALE_NAMES,
      }}
    >
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </AdminLocaleContext.Provider>
  );
}

export function useAdminLocale() {
  const context = useContext(AdminLocaleContext);
  if (!context) {
    throw new Error('useAdminLocale must be used within AdminLocaleProvider');
  }
  return context;
}
