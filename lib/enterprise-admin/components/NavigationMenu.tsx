'use client';

import React, { useState, useCallback } from 'react';
import { Menu, X, ChevronRight, Home, Settings, LogOut } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
  badge?: number;
  permission?: string;
}

export interface NavigationMenuProps {
  items: NavItem[];
  currentPath?: string;
  onNavigate?: (path: string) => void;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
  className?: string;
}

export function NavigationMenu({
  items,
  currentPath = '/',
  onNavigate,
  userInfo,
  onLogout,
  className = '',
}: NavigationMenuProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleNavigate = useCallback(
    (path: string) => {
      onNavigate?.(path);
      setMobileDrawerOpen(false);
    },
    [onNavigate]
  );

  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              handleNavigate(item.href);
            }
          }}
          className={`
            w-full flex items-center gap-3 px-4 py-2.5 rounded transition-colors
            ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }
            ${level > 0 ? 'ml-4' : ''}
          `}
        >
          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
          <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
          {item.badge && (
            <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight
              size={16}
              className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="space-y-1 mt-1">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex h-screen bg-gray-900 ${className}`}>
      {/* Sidebar */}
      <aside
        className={`
          bg-gray-800 border-r border-gray-700 transition-all duration-300
          ${sidebarOpen ? 'w-64' : 'w-20'}
          hidden md:flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-lg font-bold text-white">Admin</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.map(item => renderNavItem(item))}
        </nav>

        {/* User Info */}
        {userInfo && (
          <div className="p-4 border-t border-gray-700 space-y-3">
            <div className="flex items-center gap-3">
              {userInfo.avatar && (
                <img
                  src={userInfo.avatar}
                  alt={userInfo.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {userInfo.name}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {userInfo.email}
                  </div>
                </div>
              )}
            </div>
            {sidebarOpen && onLogout && (
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between md:hidden">
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
          >
            {mobileDrawerOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-lg font-bold text-white">Admin</h1>
          <div className="w-10" />
        </header>

        {/* Mobile Drawer */}
        {mobileDrawerOpen && (
          <div className="md:hidden bg-gray-800 border-b border-gray-700 p-4 space-y-2 max-h-96 overflow-y-auto">
            {items.map(item => renderNavItem(item))}
          </div>
        )}
      </div>
    </div>
  );
}

// Breadcrumb Component
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
  className?: string;
}

export function Breadcrumb({
  items,
  onNavigate,
  className = '',
}: BreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`}>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {idx > 0 && <ChevronRight size={16} className="text-gray-500" />}
          {item.href ? (
            <button
              onClick={() => onNavigate?.(item.href!)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-gray-400">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Top Navigation Component
export interface TopNavProps {
  title?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary';
  }>;
  className?: string;
}

export function TopNav({
  title,
  actions,
  className = '',
}: TopNavProps) {
  return (
    <div className={`bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between ${className}`}>
      {title && <h1 className="text-2xl font-bold text-white">{title}</h1>}
      {actions && (
        <div className="flex items-center gap-3">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={`
                px-4 py-2 rounded font-medium flex items-center gap-2 transition-colors
                ${
                  action.variant === 'primary'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
