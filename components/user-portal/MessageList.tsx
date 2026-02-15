'use client';

import React, { useState } from 'react';
import { Message, MessageType } from '@/lib/user-portal/messaging-types';

interface MessageListProps {
  messages: Message[];
  onSelectMessage: (message: Message) => void;
  onMarkAsRead: (messageId: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
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

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onSelectMessage,
  onMarkAsRead,
  onDelete,
  isLoading = false,
}) => {
  const [deleting, setDeleting] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="message-list skeleton">
        <div className="skeleton-bar" />
      </div>
    );
  }

  const handleMarkAsRead = async (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    try {
      await onMarkAsRead(messageId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    setDeleting(messageId);
    try {
      await onDelete(messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="message-list">
      {messages.length > 0 ? (
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-item ${!message.isRead ? 'unread' : ''}`}
              onClick={() => onSelectMessage(message)}
            >
              <div className="message-header">
                <div className="message-type-badge">
                  <span
                    className="type-dot"
                    style={{ backgroundColor: typeColors[message.type] }}
                  />
                  <span className="type-label">{typeLabels[message.type]}</span>
                </div>
                <span className="message-time">
                  {new Date(message.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>

              <div className="message-content">
                <h3 className="message-title">{message.title}</h3>
                <p className="message-preview">{message.content}</p>
              </div>

              <div className="message-actions">
                {!message.isRead && (
                  <button
                    className="action-btn mark-read"
                    onClick={(e) => handleMarkAsRead(e, message.id)}
                    title="标记为已读"
                  >
                    ✓
                  </button>
                )}
                <button
                  className={`action-btn delete ${deleting === message.id ? 'loading' : ''}`}
                  onClick={(e) => handleDelete(e, message.id)}
                  disabled={deleting === message.id}
                  title="删除"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>暂无消息</p>
        </div>
      )}
    </div>
  );
};
