'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ShoppingBag,
  Briefcase,
  User,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { userPortalNavigation } from '@/lib/user-portal/navigation';
import { getNavAriaLabel } from '@/lib/user-portal/accessibility-utils';

interface BottomNavigationProps {
  unreadMessages?: number;
}

const iconMap: Record<string, React.ReactNode> = {
  home: <Home className="w-6 h-6" />,
  'shopping-bag': <ShoppingBag className="w-6 h-6" />,
  briefcase: <Briefcase className="w-6 h-6" />,
  user: <User className="w-6 h-6" />,
  bell: <Bell className="w-6 h-6" />,
  'help-circle': <HelpCircle className="w-6 h-6" />,
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  unreadMessages = 0,
}) => {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-[var(--color-border-light)] shadow-lg"
      aria-label="Mobile navigation"
      role="navigation"
    >
      <div className="flex justify-around items-center h-16">
        {userPortalNavigation.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative ${
              isActive(item.href)
                ? 'text-[var(--color-primary-500)]'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
            }`}
            aria-current={isActive(item.href) ? 'page' : undefined}
            aria-label={getNavAriaLabel(item.label, item.badge)}
          >
            <div className="relative">
              {iconMap[item.icon] && (
                <span aria-hidden="true">{iconMap[item.icon]}</span>
              )}
              {item.id === 'messages' && unreadMessages > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-error)] text-white text-xs rounded-full flex items-center justify-center font-bold"
                  aria-label={`${unreadMessages} unread messages`}
                >
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
            {isActive(item.href) && (
              <div
                className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-primary-500)]"
                aria-hidden="true"
              />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};
