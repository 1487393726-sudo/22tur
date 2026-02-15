"use client";

import { ReactNode } from "react";
import { LucideIcon, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import "@/styles/user-pages.css";

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

interface UserPageLayoutProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: "new" | "hot" | "pro";
  stats?: StatItem[];
  actions?: ReactNode;
  children: ReactNode;
}

export function UserPageLayout({
  title,
  description,
  icon: Icon,
  badge,
  badgeType = "new",
  stats,
  actions,
  children,
}: UserPageLayoutProps) {
  const getBadgeClass = () => {
    switch (badgeType) {
      case "hot":
        return "user-page-badge-hot";
      case "pro":
        return "user-page-badge-pro";
      default:
        return "user-page-badge-new";
    }
  };

  return (
    <div className="user-page-container">
      {/* Hero 区域 */}
      <div className="user-page-hero">
        <div className="user-page-hero-content">
          <div className="user-page-hero-header">
            <div className="user-page-hero-icon">
              <Icon className="w-8 h-8" />
            </div>
            <div className="user-page-hero-title-section">
              <div className="user-page-hero-title-row">
                <h1 className="user-page-hero-title">{title}</h1>
                {badge && (
                  <span className={`user-page-badge ${getBadgeClass()}`}>
                    {badge}
                  </span>
                )}
                <Sparkles className="user-page-sparkle" />
              </div>
              {description && (
                <p className="user-page-hero-description">{description}</p>
              )}
            </div>
          </div>

          {/* 统计卡片 */}
          {stats && stats.length > 0 && (
            <div className="user-page-stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="user-page-stat-card">
                  <div className="user-page-stat-icon">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="user-page-stat-content">
                    <span className="user-page-stat-value">{stat.value}</span>
                    <span className="user-page-stat-label">{stat.label}</span>
                  </div>
                  {stat.trend && (
                    <span
                      className={`user-page-stat-trend ${stat.trendUp ? "up" : "down"}`}
                    >
                      {stat.trend}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 操作按钮 */}
          {actions && <div className="user-page-actions">{actions}</div>}
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="user-page-content">{children}</div>
    </div>
  );
}

// 通用卡片组件
interface UserCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function UserCard({
  title,
  description,
  icon: Icon,
  children,
  className = "",
  noPadding = false,
}: UserCardProps) {
  return (
    <div className={`user-card ${className}`}>
      {(title || description) && (
        <div className="user-card-header">
          {Icon && (
            <div className="user-card-header-icon">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            {title && <h3 className="user-card-title">{title}</h3>}
            {description && (
              <p className="user-card-description">{description}</p>
            )}
          </div>
        </div>
      )}
      <div className={noPadding ? "" : "user-card-content"}>{children}</div>
    </div>
  );
}

// 通用按钮组件
interface UserButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function UserButton({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  onClick,
  className = "",
  disabled = false,
}: UserButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`user-button user-button-${variant} user-button-${size} ${className}`}
    >
      {Icon && <Icon className="user-button-icon" />}
      {children}
    </button>
  );
}

// 空状态组件
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="user-empty-state">
      <div className="user-empty-state-icon">
        <Icon className="w-12 h-12" />
      </div>
      <h3 className="user-empty-state-title">{title}</h3>
      {description && (
        <p className="user-empty-state-description">{description}</p>
      )}
      {action && <div className="user-empty-state-action">{action}</div>}
    </div>
  );
}

// 搜索筛选栏组件
interface SearchFilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
}

export function SearchFilterBar({
  searchPlaceholder = "搜索...",
  searchValue = "",
  onSearchChange,
  filters,
}: SearchFilterBarProps) {
  return (
    <div className="user-search-filter-bar">
      <div className="user-search-input-wrapper">
        <svg
          className="user-search-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="user-search-input"
        />
      </div>
      {filters && <div className="user-filter-buttons">{filters}</div>}
    </div>
  );
}

// 列表项组件
interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  badge?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
}

export function ListItem({
  title,
  subtitle,
  description,
  icon: Icon,
  badge,
  meta,
  actions,
  onClick,
}: ListItemProps) {
  return (
    <div className="user-list-item" onClick={onClick}>
      {Icon && (
        <div className="user-list-item-icon">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="user-list-item-content">
        <div className="user-list-item-header">
          <span className="user-list-item-title">{title}</span>
          {badge}
        </div>
        {subtitle && <span className="user-list-item-subtitle">{subtitle}</span>}
        {description && (
          <p className="user-list-item-description">{description}</p>
        )}
        {meta && <div className="user-list-item-meta">{meta}</div>}
      </div>
      {actions && <div className="user-list-item-actions">{actions}</div>}
    </div>
  );
}

// Tabs 组件
interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: string;
}

interface UserTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function UserTabs({ tabs, activeTab, onTabChange }: UserTabsProps) {
  return (
    <div className="user-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`user-tab ${activeTab === tab.id ? "active" : ""}`}
        >
          {tab.icon && <tab.icon className="user-tab-icon" />}
          <span>{tab.label}</span>
          {tab.badge && <span className="user-tab-badge">{tab.badge}</span>}
        </button>
      ))}
    </div>
  );
}
