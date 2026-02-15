'use client';

import { useEffect } from 'react';
import { initializeThemes } from '@/lib/theme-sync';

/**
 * 主题初始化组件
 * 在应用启动时初始化主题系统
 */
export function ThemeInitializer() {
  useEffect(() => {
    // 初始化主题系统
    initializeThemes();
  }, []);

  return null;
}
