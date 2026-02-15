"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * 路由主题配置
 * Route-based theme configuration
 * 
 * - website: 官网使用紫色渐变主题 (Purple gradient for public website)
 * - admin: 管理后台使用 Tokyo Night 主题 (Tokyo Night for admin)
 * - dashboard/user: 用户中心使用深色主题 (Dark theme for user center)
 */

export type RouteThemeType = "website" | "admin" | "dashboard" | "user";

export interface RouteThemeConfig {
  type: RouteThemeType;
  theme: string; // CSS data-theme value
  className?: string; // Additional CSS classes
}

// 路由主题映射
const routeThemeMap: Record<string, RouteThemeConfig> = {
  // 管理后台 - Tokyo Night 主题
  "/admin": { type: "admin", theme: "tokyo", className: "admin-theme" },
  
  // 用户中心 - 深色主题
  "/dashboard": { type: "dashboard", theme: "dark", className: "dashboard-theme" },
  "/user": { type: "user", theme: "dark", className: "user-theme" },
  
  // 投资者门户 - 深色主题
  "/investor-portal": { type: "dashboard", theme: "dark", className: "investor-theme" },
  
  // 客户端 - 深色主题
  "/client": { type: "user", theme: "dark", className: "client-theme" },
};

// 默认网站主题 (紫色渐变)
const defaultWebsiteTheme: RouteThemeConfig = {
  type: "website",
  theme: "light", // 官网使用浅色紫色渐变
  className: "website-theme",
};

interface RouteThemeContextType {
  currentTheme: RouteThemeConfig;
  routeType: RouteThemeType;
  isWebsite: boolean;
  isAdmin: boolean;
  isDashboard: boolean;
  setOverrideTheme: (theme: string | null) => void;
}

const RouteThemeContext = createContext<RouteThemeContextType | undefined>(undefined);

/**
 * 根据路径获取主题配置
 */
function getThemeForPath(pathname: string): RouteThemeConfig {
  // 检查路径前缀匹配
  for (const [prefix, config] of Object.entries(routeThemeMap)) {
    if (pathname.startsWith(prefix)) {
      return config;
    }
  }
  
  // 默认返回网站主题
  return defaultWebsiteTheme;
}

export function RouteThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [overrideTheme, setOverrideTheme] = useState<string | null>(null);
  
  // 获取当前路由的主题配置
  const baseTheme = getThemeForPath(pathname);
  
  // 如果有覆盖主题，使用覆盖主题
  const currentTheme: RouteThemeConfig = overrideTheme
    ? { ...baseTheme, theme: overrideTheme }
    : baseTheme;

  useEffect(() => {
    setMounted(true);
  }, []);

  // 应用主题到 document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // 设置 data-theme 属性
    root.setAttribute("data-theme", currentTheme.theme);
    
    // 设置 data-route-type 属性，用于 CSS 选择器
    root.setAttribute("data-route-type", currentTheme.type);
    
    // 移除所有主题类名（保留 theme-purple-pink 由下方单独处理）
    root.classList.remove("website-theme", "admin-theme", "dashboard-theme", "user-theme", "investor-theme", "client-theme", "theme-purple-pink");
    
    // 添加当前主题类名
    if (currentTheme.className) {
      root.classList.add(currentTheme.className);
    }

    // 管理后台固定使用紫粉渐变主题
    if (currentTheme.type === "admin") {
      root.classList.add("theme-purple-pink");
      root.style.setProperty("--gradient-from", "#9333ea");
      root.style.setProperty("--gradient-to", "#db2777");
    } else {
      root.classList.remove("theme-purple-pink");
    }

    // 对于非网站路由，添加 dark 类以启用深色模式样式
    if (currentTheme.type !== "website" && (currentTheme.theme === "dark" || currentTheme.theme === "tokyo")) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

  }, [mounted, currentTheme, pathname]);

  const contextValue: RouteThemeContextType = {
    currentTheme,
    routeType: currentTheme.type,
    isWebsite: currentTheme.type === "website",
    isAdmin: currentTheme.type === "admin",
    isDashboard: currentTheme.type === "dashboard" || currentTheme.type === "user",
    setOverrideTheme,
  };

  return (
    <RouteThemeContext.Provider value={contextValue}>
      {children}
    </RouteThemeContext.Provider>
  );
}

/**
 * 使用路由主题的 Hook
 */
export function useRouteTheme() {
  const context = useContext(RouteThemeContext);
  if (!context) {
    throw new Error("useRouteTheme must be used within RouteThemeProvider");
  }
  return context;
}

/**
 * 检查当前是否为网站路由
 */
export function isWebsiteRoute(pathname: string): boolean {
  return getThemeForPath(pathname).type === "website";
}

/**
 * 检查当前是否为管理后台路由
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

/**
 * 检查当前是否为用户中心路由
 */
export function isDashboardRoute(pathname: string): boolean {
  const config = getThemeForPath(pathname);
  return config.type === "dashboard" || config.type === "user";
}
