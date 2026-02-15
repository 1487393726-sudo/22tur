/**
 * Notification Management Utilities for User Portal
 * Handles notification history, filtering, and management
 */

export interface Notification {
  id: string;
  type: 'order' | 'message' | 'promotion' | 'system';
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilter {
  type?: 'order' | 'message' | 'promotion' | 'system';
  read?: boolean;
  startDate?: number;
  endDate?: number;
  searchText?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byDate: Record<string, number>;
}

/**
 * Create notification
 */
export function createNotification(
  type: 'order' | 'message' | 'promotion' | 'system',
  title: string,
  body: string,
  options?: {
    actionUrl?: string;
    actionLabel?: string;
    metadata?: Record<string, any>;
  }
): Notification {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    body,
    timestamp: Date.now(),
    read: false,
    actionUrl: options?.actionUrl,
    actionLabel: options?.actionLabel,
    metadata: options?.metadata,
  };
}

/**
 * Store notification
 */
export function storeNotification(notification: Notification): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push(notification);

    // Keep only last 500 notifications
    if (notifications.length > 500) {
      notifications.shift();
    }

    localStorage.setItem('notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Error storing notification:', error);
  }
}

/**
 * Get all notifications
 */
export function getAllNotifications(): Notification[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem('notifications') || '[]');
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

/**
 * Get notifications with filter
 */
export function getNotifications(filter?: NotificationFilter): Notification[] {
  let notifications = getAllNotifications();

  if (!filter) {
    return notifications;
  }

  if (filter.type) {
    notifications = notifications.filter((n) => n.type === filter.type);
  }

  if (filter.read !== undefined) {
    notifications = notifications.filter((n) => n.read === filter.read);
  }

  if (filter.startDate) {
    notifications = notifications.filter((n) => n.timestamp >= filter.startDate!);
  }

  if (filter.endDate) {
    notifications = notifications.filter((n) => n.timestamp <= filter.endDate!);
  }

  if (filter.searchText) {
    const searchLower = filter.searchText.toLowerCase();
    notifications = notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(searchLower) ||
        n.body.toLowerCase().includes(searchLower)
    );
  }

  return notifications;
}

/**
 * Get notification by ID
 */
export function getNotificationById(id: string): Notification | null {
  const notifications = getAllNotifications();
  return notifications.find((n) => n.id === id) || null;
}

/**
 * Mark notification as read
 */
export function markAsRead(id: string): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  try {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notification = notifications.find((n: Notification) => n.id === id);

    if (notification) {
      notification.read = true;
      localStorage.setItem('notifications', JSON.stringify(notifications));
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  try {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.forEach((n: Notification) => {
      n.read = true;
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

/**
 * Mark notifications as read by type
 */
export function markAsReadByType(type: 'order' | 'message' | 'promotion' | 'system'): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  try {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.forEach((n: Notification) => {
      if (n.type === type) {
        n.read = true;
      }
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    return true;
  } catch (error) {
    console.error('Error marking notifications as read by type:', error);
    return false;
  }
}

/**
 * Delete notification
 */
export function deleteNotification(id: string): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  try {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const filtered = notifications.filter((n: Notification) => n.id !== id);
    localStorage.setItem('notifications', JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

/**
 * Delete notifications by type
 */
export function deleteNotificationsByType(type: 'order' | 'message' | 'promotion' | 'system'): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  try {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const filtered = notifications.filter((n: Notification) => n.type !== type);
    localStorage.setItem('notifications', JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting notifications by type:', error);
    return false;
  }
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  try {
    localStorage.removeItem('notifications');
    return true;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return false;
  }
}

/**
 * Get unread notification count
 */
export function getUnreadCount(): number {
  const notifications = getAllNotifications();
  return notifications.filter((n) => !n.read).length;
}

/**
 * Get unread count by type
 */
export function getUnreadCountByType(type: 'order' | 'message' | 'promotion' | 'system'): number {
  const notifications = getAllNotifications();
  return notifications.filter((n) => n.type === type && !n.read).length;
}

/**
 * Get notification statistics
 */
export function getNotificationStats(): NotificationStats {
  const notifications = getAllNotifications();

  const stats: NotificationStats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    byType: {
      order: 0,
      message: 0,
      promotion: 0,
      system: 0,
    },
    byDate: {},
  };

  notifications.forEach((n) => {
    stats.byType[n.type]++;

    const date = new Date(n.timestamp).toISOString().split('T')[0];
    stats.byDate[date] = (stats.byDate[date] || 0) + 1;
  });

  return stats;
}

/**
 * Get recent notifications
 */
export function getRecentNotifications(limit: number = 10): Notification[] {
  const notifications = getAllNotifications();
  return notifications.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

/**
 * Get notifications by date range
 */
export function getNotificationsByDateRange(startDate: number, endDate: number): Notification[] {
  const notifications = getAllNotifications();
  return notifications.filter((n) => n.timestamp >= startDate && n.timestamp <= endDate);
}

/**
 * Search notifications
 */
export function searchNotifications(query: string): Notification[] {
  const queryLower = query.toLowerCase();
  const notifications = getAllNotifications();

  return notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(queryLower) ||
      n.body.toLowerCase().includes(queryLower) ||
      (n.metadata && JSON.stringify(n.metadata).toLowerCase().includes(queryLower))
  );
}

/**
 * Export notifications
 */
export function exportNotifications(format: 'json' | 'csv' = 'json'): string {
  const notifications = getAllNotifications();

  if (format === 'json') {
    return JSON.stringify(notifications, null, 2);
  }

  // CSV format
  const headers = ['ID', 'Type', 'Title', 'Body', 'Timestamp', 'Read'];
  const rows = notifications.map((n) => [
    n.id,
    n.type,
    `"${n.title}"`,
    `"${n.body}"`,
    new Date(n.timestamp).toISOString(),
    n.read ? 'Yes' : 'No',
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return csv;
}

/**
 * Notification type labels
 */
export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  order: '订单',
  message: '消息',
  promotion: '促销',
  system: '系统',
};

/**
 * Notification type colors
 */
export const NOTIFICATION_TYPE_COLORS: Record<string, string> = {
  order: '#14B8A6',
  message: '#3B82F6',
  promotion: '#F59E0B',
  system: '#EF4444',
};

/**
 * Notification type icons
 */
export const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
  order: '📦',
  message: '💬',
  promotion: '🎉',
  system: '⚙️',
};
