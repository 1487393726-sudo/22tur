'use client';

/**
 * Bottom Navigation
 * 移动端底部导航栏
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Search,
  Bell,
  User,
  Menu,
  FileText,
  Briefcase,
  Settings,
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

interface BottomNavigationProps {
  items?: NavItem[];
  className?: string;
}

const defaultItems: NavItem[] = [
  { href: '/', icon: Home, label: '首页' },
  { href: '/search', icon: Search, label: '搜索' },
  { href: '/notifications', icon: Bell, label: '通知' },
  { href: '/profile', icon: User, label: '我的' },
];

export function BottomNavigation({ items = defaultItems, className }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white border-t border-gray-200',
        'safe-area-inset-bottom',
        'md:hidden', // 仅在移动端显示
        className
      )}
    >
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center',
                'w-full h-full',
                'text-xs transition-colors',
                isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <div className="relative">
                <Icon className={cn('w-6 h-6', isActive && 'text-primary')} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// 用户端底部导航
export function UserBottomNavigation() {
  const items: NavItem[] = [
    { href: '/user', icon: Home, label: '首页' },
    { href: '/user/documents', icon: FileText, label: '文档' },
    { href: '/user/investments', icon: Briefcase, label: '投资' },
    { href: '/user/profile', icon: User, label: '我的' },
  ];

  return <BottomNavigation items={items} />;
}

// 管理端底部导航
export function AdminBottomNavigation() {
  const items: NavItem[] = [
    { href: '/admin', icon: Home, label: '概览' },
    { href: '/admin/orders', icon: FileText, label: '订单' },
    { href: '/admin/notifications', icon: Bell, label: '通知' },
    { href: '/admin/settings', icon: Settings, label: '设置' },
  ];

  return <BottomNavigation items={items} />;
}

export default BottomNavigation;
