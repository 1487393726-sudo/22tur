'use client';

import React from 'react';

interface DashboardCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DashboardCard({
  title,
  icon,
  children,
  className = '',
}: DashboardCardProps) {
  return (
    <div
      className={`
        purple-gradient-card
        rounded-lg
        p-6
        border
        hover:shadow-md transition-shadow
        ${className}
      `}
    >
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-4">
          {icon && <div className="text-teal-600 dark:text-teal-400">{icon}</div>}
          {title && (
            <h3 className="purple-gradient-title text-lg font-semibold">
              {title}
            </h3>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
