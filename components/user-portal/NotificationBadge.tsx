'use client';

import React from 'react';
import { NotificationBadge as NotificationBadgeType } from '@/lib/user-portal/messaging-types';

interface NotificationBadgeProps {
  badge: NotificationBadgeType | null;
  onClick?: () => void;
  isLoading?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  badge,
  onClick,
  isLoading = false,
}) => {
  if (isLoading || !badge) {
    return (
      <div className="notification-badge skeleton">
        <div className="skeleton-circle" />
      </div>
    );
  }

  const hasUnread = badge.unreadCount > 0;

  return (
    <button
      className={`notification-badge ${hasUnread ? 'has-unread' : ''}`}
      onClick={onClick}
      title={`${badge.unreadCount} 条未读消息`}
    >
      <span className="bell-icon">🔔</span>
      {hasUnread && (
        <span className="unread-count">
          {badge.unreadCount > 99 ? '99+' : badge.unreadCount}
        </span>
      )}
    </button>
  );
};
