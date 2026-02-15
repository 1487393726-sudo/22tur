'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Heart,
  History,
  Gift,
  Undo,
  Settings,
  LogOut,
} from 'lucide-react';
import {
  userPortalNavigation,
  userPortalSecondaryNav,
  userPortalAccountNav,
} from '@/lib/user-portal/navigation';
import {
  getNavAriaLabel,
  getSectionToggleAriaLabel,
  getExpandableSectionAriaLabel,
} from '@/lib/user-portal/accessibility-utils';

interface SidebarNavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const secondaryIconMap: Record<string, React.ReactNode> = {
  heart: <Heart className="w-4 h-4" />,
  history: <History className="w-4 h-4" />,
  gift: <Gift className="w-4 h-4" />,
  undo: <Undo className="w-4 h-4" />,
};

const accountIconMap: Record<string, React.ReactNode> = {
  settings: <Settings className="w-4 h-4" />,
  'log-out': <LogOut className="w-4 h-4" />,
};

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  isOpen = true,
  onClose,
}) => {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    secondary: true,
    account: false,
  });

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <aside
      className={`hidden lg:flex flex-col w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-light)] h-screen sticky top-0 overflow-y-auto transition-all ${
        !isOpen ? 'w-0 overflow-hidden' : ''
      }`}
      role="complementary"
      aria-label="Sidebar navigation"
    >
      <div className="p-6">
        {/* Sidebar Header */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            用户中心
          </h2>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
            自助服务系统
          </p>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1 mb-8" aria-label="Primary navigation">
          <p className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">
            主菜单
          </p>
          {userPortalNavigation.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-[var(--color-primary-500)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)]'
              }`}
              aria-current={isActive(item.href) ? 'page' : undefined}
              aria-label={getNavAriaLabel(item.label, item.badge)}
            >
              <span className="w-5 h-5" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span
                  className="ml-auto inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--color-error)] text-white"
                  aria-label={`${item.badge} unread`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Secondary Navigation */}
        <nav className="space-y-1 mb-8" aria-label="Secondary navigation">
          <button
            onClick={() => toggleSection('secondary')}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider hover:text-[var(--color-text-secondary)] transition-colors"
            aria-expanded={expandedSections.secondary}
            aria-label={getSectionToggleAriaLabel('My Content', expandedSections.secondary)}
          >
            <span>我的内容</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                expandedSections.secondary ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {expandedSections.secondary && (
            <div className="space-y-1" role="region" aria-label="My Content items">
              {userPortalSecondaryNav.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-500)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)]'
                  }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <span className="w-4 h-4" aria-hidden="true">
                    {secondaryIconMap[item.icon]}
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Account Navigation */}
        <nav className="space-y-1 border-t border-[var(--color-border-light)] pt-4" aria-label="Account navigation">
          <button
            onClick={() => toggleSection('account')}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider hover:text-[var(--color-text-secondary)] transition-colors"
            aria-expanded={expandedSections.account}
            aria-label={getSectionToggleAriaLabel('Account', expandedSections.account)}
          >
            <span>账户</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                expandedSections.account ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {expandedSections.account && (
            <div className="space-y-1" role="region" aria-label="Account items">
              {userPortalAccountNav.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-500)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)]'
                  }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <span className="w-4 h-4" aria-hidden="true">
                    {accountIconMap[item.icon]}
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};
