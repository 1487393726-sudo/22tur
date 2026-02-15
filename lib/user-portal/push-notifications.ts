/**
 * Push Notifications Utilities for User Portal
 * Handles push notification configuration, delivery, and management
 */

export interface PushNotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: Record<string, any>;
  vibrate?: number[];
  sound?: string;
  timestamp?: number;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationPermission {
  permission: 'granted' | 'denied' | 'default';
  timestamp: number;
}

export interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  actionTaken?: string;
}

export interface PushSubscription {
  endpoint: string;
  auth: string;
  p256dh: string;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') {
    return {
      permission: 'denied',
      timestamp: Date.now(),
    };
  }

  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return {
      permission: Notification.permission,
      timestamp: Date.now(),
    };
  }

  try {
    const permission = await Notification.requestPermission();
    return {
      permission: permission as 'granted' | 'denied' | 'default',
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return {
      permission: 'denied',
      timestamp: Date.now(),
    };
  }
}

/**
 * Check if notifications are supported
 */
export function isNotificationSupported(): boolean {
  return typeof Notification !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Check if notifications are enabled
 */
export function isNotificationEnabled(): boolean {
  if (typeof Notification === 'undefined') {
    return false;
  }

  return Notification.permission === 'granted';
}

/**
 * Send a notification
 */
export function sendNotification(config: PushNotificationConfig): Notification | null {
  if (!isNotificationEnabled()) {
    console.warn('Notifications are not enabled');
    return null;
  }

  try {
    const notification = new Notification(config.title, {
      body: config.body,
      icon: config.icon,
      badge: config.badge,
      tag: config.tag,
      requireInteraction: config.requireInteraction,
      actions: config.actions,
      data: config.data,
      vibrate: config.vibrate,
      sound: config.sound,
      timestamp: config.timestamp || Date.now(),
    });

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
}

/**
 * Send notification with click handler
 */
export function sendNotificationWithHandler(
  config: PushNotificationConfig,
  onClickHandler: (event: Event) => void,
  onCloseHandler?: (event: Event) => void
): Notification | null {
  const notification = sendNotification(config);

  if (notification) {
    notification.addEventListener('click', onClickHandler);
    if (onCloseHandler) {
      notification.addEventListener('close', onCloseHandler);
    }
  }

  return notification;
}

/**
 * Store notification in history
 */
export function storeNotificationHistory(notification: NotificationHistory): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    const history = JSON.parse(localStorage.getItem('notification_history') || '[]');
    history.push(notification);

    // Keep only last 100 notifications
    if (history.length > 100) {
      history.shift();
    }

    localStorage.setItem('notification_history', JSON.stringify(history));
  } catch (error) {
    console.error('Error storing notification history:', error);
  }
}

/**
 * Get notification history
 */
export function getNotificationHistory(): NotificationHistory[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem('notification_history') || '[]');
  } catch (error) {
    console.error('Error getting notification history:', error);
    return [];
  }
}

/**
 * Clear notification history
 */
export function clearNotificationHistory(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('notification_history');
  } catch (error) {
    console.error('Error clearing notification history:', error);
  }
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(notificationId: string): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    const history = JSON.parse(localStorage.getItem('notification_history') || '[]');
    const notification = history.find((n: NotificationHistory) => n.id === notificationId);

    if (notification) {
      notification.read = true;
      localStorage.setItem('notification_history', JSON.stringify(history));
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Get unread notification count
 */
export function getUnreadNotificationCount(): number {
  const history = getNotificationHistory();
  return history.filter((n) => !n.read).length;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    return {
      endpoint: subscription.endpoint,
      auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth') || [])))),
      p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh') || [])))),
    };
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

/**
 * Get push notification subscription
 */
export async function getPushNotificationSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      return {
        endpoint: subscription.endpoint,
        auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth') || [])))),
        p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh') || [])))),
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting push notification subscription:', error);
    return null;
  }
}

/**
 * Listen for notification events
 */
export function listenToNotificationEvents(
  onNotification: (notification: Notification) => void,
  onError?: (error: Error) => void
): () => void {
  if (typeof Notification === 'undefined') {
    return () => {};
  }

  // This is a simplified version - in a real app, you'd listen to service worker messages
  const handleNotification = (event: Event) => {
    onNotification(event as any);
  };

  const handleError = (event: Event) => {
    if (onError) {
      onError(new Error('Notification error'));
    }
  };

  // Note: Actual implementation would depend on service worker setup
  return () => {
    // Cleanup
  };
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  showBadge: boolean;
  categories: {
    orders: boolean;
    messages: boolean;
    promotions: boolean;
    system: boolean;
  };
}

/**
 * Get notification preferences
 */
export function getNotificationPreferences(): NotificationPreferences {
  if (typeof localStorage === 'undefined') {
    return getDefaultNotificationPreferences();
  }

  try {
    const prefs = localStorage.getItem('notification_preferences');
    if (prefs) {
      return JSON.parse(prefs);
    }
  } catch (error) {
    console.error('Error getting notification preferences:', error);
  }

  return getDefaultNotificationPreferences();
}

/**
 * Set notification preferences
 */
export function setNotificationPreferences(preferences: NotificationPreferences): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('notification_preferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Error setting notification preferences:', error);
  }
}

/**
 * Get default notification preferences
 */
export function getDefaultNotificationPreferences(): NotificationPreferences {
  return {
    enabled: true,
    sound: true,
    vibration: true,
    showBadge: true,
    categories: {
      orders: true,
      messages: true,
      promotions: false,
      system: true,
    },
  };
}

/**
 * Notification configuration presets
 */
export const NOTIFICATION_PRESETS = {
  ORDER_UPDATE: {
    title: '订单更新',
    body: '您的订单已更新',
    tag: 'order-update',
    icon: '/icons/order.png',
  },
  MESSAGE_RECEIVED: {
    title: '新消息',
    body: '您收到了一条新消息',
    tag: 'message',
    icon: '/icons/message.png',
    requireInteraction: true,
  },
  PROMOTION: {
    title: '特别优惠',
    body: '查看最新的优惠活动',
    tag: 'promotion',
    icon: '/icons/promotion.png',
  },
  SYSTEM_ALERT: {
    title: '系统通知',
    body: '系统维护通知',
    tag: 'system',
    icon: '/icons/system.png',
    requireInteraction: true,
  },
};
