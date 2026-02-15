'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Bell, User, Search } from 'lucide-react';
import { userPortalNavigation, userPortalAccountNav } from '@/lib/user-portal/navigation';
import { ThemeSwitcher } from './ThemeSwitcher';
import {
  getNavAriaLabel,
  getNotificationAriaLabel,
  getUserMenuAriaLabel,
  getMobileMenuAriaLabel,
  getSearchAriaLabel,
} from '@/lib/user-portal/accessibility-utils';

interface TopNavigationProps {
  onMenuToggle?: (isOpen: boolean) => void;
  unreadMessages?: number;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  onMenuToggle,
  unreadMessages = 0,
}) => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    onMenuToggle?.(newState);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav
      className="sticky top-0 z-40 bg-white border-b border-[var(--color-border-light)] shadow-sm"
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/user/dashboard"
            className="flex items-center gap-2"
            aria-label="User Portal Home"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-500)] flex items-center justify-center">
              <span className="text-white font-bold text-sm" aria-hidden="true">
                UP
              </span>
            </div>
            <span className="hidden sm:inline font-semibold text-[var(--color-text-primary)]">
              用户中心
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1" role="menubar">
            {userPortalNavigation.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-500)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                }`}
                role="menuitem"
                aria-current={isActive(item.href) ? 'page' : undefined}
                aria-label={getNavAriaLabel(item.label, item.badge)}
              >
                {item.label}
                {item.badge && item.badge > 0 && (
                  <span
                    className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-error)] text-white"
                    aria-label={`${item.badge} unread`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden sm:flex items-center bg-[var(--color-bg-secondary)] rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-[var(--color-text-tertiary)]" aria-hidden="true" />
              <input
                type="text"
                placeholder="搜索..."
                aria-label={getSearchAriaLabel()}
                className="ml-2 bg-transparent outline-none text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] w-32"
              />
            </div>

            {/* Theme Switcher */}
            <ThemeSwitcher variant="button" size="md" />

            {/* Notifications */}
            <button
              className="relative p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
              aria-label={getNotificationAriaLabel(unreadMessages)}
              aria-pressed="false"
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
              {unreadMessages > 0 && (
                <span
                  className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-error)] rounded-full"
                  aria-label={`${unreadMessages} unread notifications`}
                />
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
                aria-label={getUserMenuAriaLabel(isUserMenuOpen)}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
              >
                <User className="w-5 h-5" aria-hidden="true" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[var(--color-border-light)] py-2"
                  role="menu"
                >
                  {userPortalAccountNav.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
              aria-label={getMobileMenuAriaLabel(isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            className="md:hidden pb-4 border-t border-[var(--color-border-light)]"
            id="mobile-navigation"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1 mt-4">
              {userPortalNavigation.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-500)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
