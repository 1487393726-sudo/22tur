'use client';

import React from 'react';
import { Message, MessageType } from '@/lib/user-portal/messaging-types';

interface MessageDetailProps {
  message: Message | null;
  onBack: () => void;
  onMarkAsRead: (messageId: string) => Promise<void>;
  isLoading?: boolean;
}

const typeLabels: Record<MessageType, string> = {
  order: '订单',
  service: '服务',
  promotion: '促销',
  system: '系统',
};

const typeColors: Record<MessageType, string> = {
  order: '#3B82F6',
  service: '#10B981',
  promotion: '#F59E0B',
  system: '#6B7280',
};

export const MessageDetail: React.FC<MessageDetailProps> = ({
  message,
  onBack,
  onMarkAsRead,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="message-detail skeleton">
        <div className="skeleton-bar" />
      </div>
    );
  }

  if (!message) {
    return (
      <div className="message-detail empty">
        <p>选择一条消息查看详情</p>
      </div>
    );
  }

  const handleMarkAsRead = async () => {
    try {
      await onMarkAsRead(message.id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return (
    <div className="message-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          ← 返回
        </button>
        <div className="header-info">
          <span
            className="type-badge"
            style={{ backgroundColor: typeColors[message.type] }}
          >
            {typeLabels[message.type]}
          </span>
          <span className="message-date">
            {new Date(message.createdAt).toLocaleString('zh-CN')}
          </span>
        </div>
      </div>

      <div className="detail-content">
        <h1 className="detail-title">{message.title}</h1>

        <div className="detail-body">
          <p>{message.content}</p>
        </div>

        <div className="detail-footer">
          {!message.isRead && (
            <button className="mark-read-btn" onClick={handleMarkAsRead}>
              标记为已读
            </button>
          )}
          {message.isRead && (
            <span className="read-indicator">✓ 已读</span>
          )}
        </div>
      </div>
    </div>
  );
};
