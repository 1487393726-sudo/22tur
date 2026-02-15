"use client";

import { useState, useEffect, useCallback } from "react";

export type DashboardLocale = 'zh' | 'zh-TW' | 'en' | 'ug' | 'ja' | 'ko';

// Dashboard translations type
export interface DashboardTranslations {
  sidebar: {
    overview: string;
    myOrders: string;
    market: string;
    investment: string;
    support: string;
    files: string;
    clientService: string;
    serviceOrders: string;
    projectProgress: string;
    myContracts: string;
    cart: string;
    appointments: string;
    browse: string;
    marketplace: string;
    portfolio: string;
    pricing: string;
    services: string;
    settings: string;
    openMenu: string;
    closeMenu: string;
  };
  overview: Record<string, any>;
  orders: Record<string, any>;
  market: Record<string, any>;
  investment: Record<string, any>;
  support: Record<string, any>;
  files: Record<string, any>;
  client: Record<string, any>;
  appointments: Record<string, any>;
  common: Record<string, any>;
}

const defaultLocale: DashboardLocale = 'zh';

// Cache for loaded translations
const translationsCache: Partial<Record<DashboardLocale, any>> = {};

// Map DashboardLocale to MESSAGES locale key
const localeToMessagesKey: Record<DashboardLocale, string> = {
  'zh': 'zh-CN',
  'zh-TW': 'zh-TW',
  'en': 'en',
  'ug': 'ug',
  'ja': 'ja',
  'ko': 'ko'
};

// Import all dashboard translations explicitly for Turbopack compatibility
const dashboardImports: Record<DashboardLocale, () => Promise<any>> = {
  'zh': () => import('@/messages/zh/dashboard.json'),
  'zh-TW': () => import('@/messages/zh-TW/dashboard.json'),
  'en': () => import('@/messages/en/dashboard.json'),
  'ug': () => import('@/messages/ug/dashboard.json'),
  'ja': () => import('@/messages/ja/dashboard.json'),
  'ko': () => import('@/messages/ko/dashboard.json'),
};

// Load translations dynamically
async function loadTranslations(locale: DashboardLocale): Promise<any> {
  if (translationsCache[locale]) {
    return translationsCache[locale]!;
  }

  try {
    // Load dashboard translations from JSON file using explicit imports
    const importFn = dashboardImports[locale] || dashboardImports['zh'];
    const dashboardTranslations = await importFn();
    
    // Load settings translations from messages/all.ts
    const { MESSAGES } = await import('@/messages/all');
    const messagesKey = localeToMessagesKey[locale];
    const settingsTranslations = MESSAGES[messagesKey as keyof typeof MESSAGES]?.settings || {};
    
    // Merge translations
    translationsCache[locale] = {
      ...(dashboardTranslations.default || dashboardTranslations),
      settings: settingsTranslations
    };
    
    return translationsCache[locale]!;
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    // Fallback to Chinese
    if (locale !== 'zh') {
      return loadTranslations('zh');
    }
    throw error;
  }
}

export function useDashboardTranslations() {
  const [locale, setLocaleState] = useState<DashboardLocale>(defaultLocale);
  const [translations, setTranslations] = useState<DashboardTranslations | null>(null);
  const [loading, setLoading] = useState(true);

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('dashboard-locale') as DashboardLocale;
    if (savedLocale && ['zh', 'zh-TW', 'en', 'ug', 'ja', 'ko'].includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  // Load translations when locale changes
  useEffect(() => {
    setLoading(true);
    loadTranslations(locale)
      .then(setTranslations)
      .finally(() => setLoading(false));
  }, [locale]);

  const setLocale = useCallback((newLocale: DashboardLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem('dashboard-locale', newLocale);
  }, []);

  // Helper function to get nested translation value
  const t = useCallback((key: string, fallback?: string): string => {
    if (!translations) return fallback || key;
    
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }
    
    return typeof value === 'string' ? value : fallback || key;
  }, [translations]);

  return {
    locale,
    setLocale,
    translations,
    loading,
    t,
    isRTL: locale === 'ug' // Uyghur is RTL
  };
}

export const localeNames: Record<DashboardLocale, string> = {
  'zh': '简体中文',
  'zh-TW': '繁體中文',
  'en': 'English',
  'ug': 'ئۇيغۇرچە',
  'ja': '日本語',
  'ko': '한국어'
};
