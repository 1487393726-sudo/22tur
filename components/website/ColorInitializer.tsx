'use client';

import { useEffect } from 'react';
import { applyWebsiteColorStyle } from '@/lib/website/color-style-runtime';

/**
 * 颜色初始化组件
 * 在应用启动时自动应用统一的官网颜色风格
 * 确保所有页面使用一致的颜色配置
 */
export function ColorInitializer() {
  useEffect(() => {
    // 默认按上次选择的官网颜色风格初始化
    if (typeof window === "undefined") return;

    const saved =
      (localStorage.getItem("website-color-style") as any) ||
      "website-default";

    applyWebsiteColorStyle(saved);
  }, []);

  return null;
}

export default ColorInitializer;
