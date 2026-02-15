// Messaging and Notification System Types

export type MessageType = 'order' | 'service' | 'promotion' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Message {
  id: string;
  type: MessageType;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  relatedId?: string; // Order ID, Service ID, etc.
}

export interface Notification {
  id: string;
  userId: string;
  type: MessageType;
  title: string;
  content: string;
  priority: NotificationPriority;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  orderNotifications: boolean;
  serviceNotifications: boolean;
  promotionNotifications: boolean;
  systemNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string; // HH:mm format
}

export interface MessageThread {
  id: string;
  participantIds: string[];
  subject: string;
  messages: Message[];
  lastMessageAt: Date;
  isArchived: boolean;
}

export interface NotificationBadge {
  unreadCount: number;
  unreadByType: Record<MessageType, number>;
  lastCheckedAt: Date;
}

export interface MessageFilter {
  type?: MessageType;
  isRead?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  searchText?: string;
}

export interface NotificationStats {
  totalMessages: number;
  unreadMessages: number;
  totalNotifications: number;
  unreadNotifications: number;
  messagesByType: Record<MessageType, number>;
}
