'use client';

import React from 'react';
import { DashboardCard } from './DashboardCard';

interface QuickAction {
  label: string;
  href: string;
  icon: string;
  color: string;
}

export function QuickActions() {
  const actions: QuickAction[] = [
    {
      label: 'Quick Shop',
      href: '/shop',
      icon: '🛍️',
      color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'View Orders',
      href: '/user/orders',
      icon: '📦',
      color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    },
    {
      label: 'Contact Support',
      href: '/user/support',
      icon: '💬',
      color: 'bg-purple-100 dark:bg-purple-900 text-white dark:text-white',
    },
    {
      label: 'My Services',
      href: '/user/services',
      icon: '⚙️',
      color: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <DashboardCard title="Quick Actions">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            className={`
              p-4 rounded-lg flex flex-col items-center justify-center gap-2
              ${action.color}
              hover:opacity-80 transition-opacity
              text-center
            `}
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-sm font-medium">{action.label}</span>
          </a>
        ))}
      </div>
    </DashboardCard>
  );
}
