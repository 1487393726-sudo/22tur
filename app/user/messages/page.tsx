'use client';

import React, { useState, useEffect } from 'react';
import { MessageList } from '@/components/user-portal/MessageList';
import { MessageDetail } from '@/components/user-portal/MessageDetail';
import { NotificationSettings } from '@/components/user-portal/NotificationSettings';
import {
  Message,
  NotificationPreference,
  MessageType,
} from '@/lib/user-portal/messaging-types';

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<'messages' | 'settings'>(
    'messages'
  );
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageFilter, setMessageFilter] = useState<MessageType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference | null>(
    null
  );

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls
        const mockMessages: Message[] = [
          {
            id: 'm1',
            type: 'order',
            title: '订单已发货',
            content: '您的订单 #12345 已发货，预计3-5天送达',
            isRead: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            relatedId: 'order-12345',
          },
          {
            id: 'm2',
            type: 'promotion',
            title: '限时优惠活动',
            content: '今天特价商品享受50%折扣，仅限今天！',
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
          {
            id: 'm3',
            type: 'service',
            title: '服务进度更新',
            content: '您的设计服务已进入最后阶段，预计明天完成',
            isRead: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            relatedId: 'service-789',
          },
          {
            id: 'm4',
            type: 'system',
            title: '系统维护通知',
            content: '系统将于今晚22:00-23:00进行维护，期间可能无法访问',
            isRead: true,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'm5',
            type: 'order',
            title: '订单已确认',
            content: '您的订单 #12344 已确认，商家正在准备',
            isRead: true,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            relatedId: 'order-12344',
          },
        ];

        const mockPreferences: NotificationPreference = {
          id: 'pref-1',
          userId: 'user-1',
          orderNotifications: true,
          serviceNotifications: true,
          promotionNotifications: true,
          systemNotifications: true,
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
        };

        setMessages(mockMessages);
        setPreferences(mockPreferences);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setMessages(
        messages.map((msg) =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );

      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, isRead: true });
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setMessages(messages.filter((msg) => msg.id !== messageId));

      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleSavePreferences = async (
    newPreferences: NotificationPreference
  ) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const filteredMessages =
    messageFilter === 'all'
      ? messages
      : messages.filter((msg) => msg.type === messageFilter);

  return (
    <div className="messages-page">
      <div className="page-header">
        <h1>消息和通知</h1>
      </div>

      <div className="page-tabs">
        <button
          className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          消息
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          设置
        </button>
      </div>

      <div className="page-content">
        {activeTab === 'messages' ? (
          <div className="messages-section">
            <div className="messages-filter">
              <button
                className={`filter-btn ${messageFilter === 'all' ? 'active' : ''}`}
                onClick={() => setMessageFilter('all')}
              >
                全部
              </button>
              <button
                className={`filter-btn ${messageFilter === 'order' ? 'active' : ''}`}
                onClick={() => setMessageFilter('order')}
              >
                订单
              </button>
              <button
                className={`filter-btn ${messageFilter === 'service' ? 'active' : ''}`}
                onClick={() => setMessageFilter('service')}
              >
                服务
              </button>
              <button
                className={`filter-btn ${messageFilter === 'promotion' ? 'active' : ''}`}
                onClick={() => setMessageFilter('promotion')}
              >
                促销
              </button>
              <button
                className={`filter-btn ${messageFilter === 'system' ? 'active' : ''}`}
                onClick={() => setMessageFilter('system')}
              >
                系统
              </button>
            </div>

            <div className="messages-layout">
              <div className="messages-list-container">
                <MessageList
                  messages={filteredMessages}
                  onSelectMessage={setSelectedMessage}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  isLoading={isLoading}
                />
              </div>

              <div className="messages-detail-container">
                <MessageDetail
                  message={selectedMessage}
                  onBack={() => setSelectedMessage(null)}
                  onMarkAsRead={handleMarkAsRead}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        ) : (
          <NotificationSettings
            preferences={preferences}
            onSave={handleSavePreferences}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
